class App {

    constructor() {

        this.serverUrl = document.getElementById("serverUrl");
        this.apiKey = document.getElementById("apiKey");

        this.saveBtn = document.getElementById("saveBtn");
        this.refreshBtn = document.getElementById("testBtn");

        this.tabs = document.querySelectorAll(".tab");
        this.sectionHeaders = document.querySelectorAll(".issues-header");
        this.pages = document.querySelectorAll(".page");
        
        this.statusTitle = document.querySelector(".status-title");
        this.statusUserName = document.getElementById("statusUserName");
        this.statusUserInfo = document.getElementById("statusUserInfo");
        this.statusCard = document.getElementById("statusCard");
        this.statusSync = document.querySelector(".status-sync");
        this.assignedCount = document.getElementById("assignedCount");
        this.authoredCount = document.getElementById("authoredCount");
        this.watchedCount = document.getElementById("watchedCount");
        this.assignedTotal = document.getElementById("assignedTotal");
        this.authoredTotal = document.getElementById("authoredTotal");
        this.watchedTotal = document.getElementById("watchedTotal");
        this.allCount = document.getElementById("allCount");
        this.assignedList = document.getElementById("assignedList");
        this.authoredList = document.getElementById("authoredList");
        this.watchedList = document.getElementById("watchedList");
        this.syncService = new window.SyncService();
        this.issuesList = document.getElementById("issuesList");
        this.syncInterval = null;
        this.syncing = false;
        this.syncRetryCount = 0;
        this.journalList = document.getElementById("journalList");
        this.journal = new JournalService(this.journalList);
        this.history = new HistoryService();
        
        this.issueFilter = "active";
        this.filterActiveBtn = document.getElementById("filterActive");
        this.filterAllBtn = document.getElementById("filterAll");
        this.issuesSearch = document.getElementById("issuesSearch");
        this.issuesSort = document.getElementById("issuesSort");
        this.searchQuery = "";
        this.sortKey = "updated_desc";
        this.pollInterval = document.getElementById("pollInterval");
        this.clearJournalBtn = document.getElementById("clearJournalBtn");
        this.startWithWindows = document.getElementById("startWithWindows");
        this.startMinimized = document.getElementById("startMinimized");

        this.langRuBtn = document.getElementById("langRu");
        this.langEnBtn = document.getElementById("langEn");
        this.connectionState = null;
        this.connectionData = {};

        this.settings = {};
        this.registerEvents();
        this.startup();
        

    }

    registerEvents() {
        this.saveBtn.addEventListener(
            "click",
            () => this.saveSettings(false)
        );

        this.refreshBtn.addEventListener(
            "click",
            () => this.sync()
        );

        this.tabs.forEach(tab => {

            tab.addEventListener("click", () => {

                this.showPage(tab.dataset.page);

            });

        });

        this.filterActiveBtn.addEventListener("click", () => {

            this.issueFilter = "active";

            this.updateFilterButtons();

            if (this.lastDashboard) {
                this.renderIssues(this.lastDashboard);
            }

        });

        this.filterAllBtn.addEventListener("click", () => {

            this.issueFilter = "all";

            this.updateFilterButtons();

            if (this.lastDashboard) {
                this.renderIssues(this.lastDashboard);
            }

        });

        this.sectionHeaders.forEach(header=>{

            header.addEventListener("click",()=>{
                const id=header.dataset.target;
                const block=document.getElementById(id);
                const arrow = header.querySelector(".arrow");
                block.hidden=!block.hidden;
                arrow.classList.toggle("collapsed", block.hidden);
            });

        });

        this.clearJournalBtn.addEventListener("click",() => { this.journal.clear();}
        );

        this.startWithWindows.addEventListener("change",() => this.saveSettings(true));
        this.startMinimized.addEventListener("change",() => this.saveSettings(true));
        this.pollInterval.addEventListener("change",() => this.saveSettings());

        this.langRuBtn.addEventListener("click", () => this.setLanguage("ru"));
        this.langEnBtn.addEventListener("click", () => this.setLanguage("en"));

        this.issuesSearch.addEventListener("input", () => {

            this.searchQuery = this.issuesSearch.value;

            if (this.lastDashboard) {
                this.renderIssues(this.lastDashboard);
            }

        });

        this.issuesSort.addEventListener("change", () => {

            this.sortKey = this.issuesSort.value;

            if (this.lastDashboard) {
                this.renderIssues(this.lastDashboard);
            }

        });
    }

    async handleStatusChange(issue, newStatusId) {

        await window.api.updateIssueStatus(issue.id, newStatusId);

        const statusInfo = (this.lastDashboard?.statuses || [])
            .find(status => status.id === newStatusId);

        issue.status = {

            id: newStatusId,
            name: statusInfo ? statusInfo.name : issue.status.name

        };

        await this.history.update(issue);

        if (this.lastDashboard) {
            this.renderIssues(this.lastDashboard);
        }

    }

    async handleComment(issue, text) {

        await window.api.addIssueComment(issue.id, text);

        try {

            const fullIssue = await window.api.loadIssue(issue.id);
            const lastJournal = CommentService.getLastJournal(fullIssue);

            if (lastJournal) {
                await this.history.setLastJournal(issue.id, lastJournal.id);
            }

        } catch (ex) {

            // Не критично: при следующей синхронизации в худшем случае
            // придёт повторное уведомление о собственном комментарии.

        }

    }

    setLanguage(lang, options = {}) {

        const silent = options.silent || false;

        I18nService.setLanguage(lang);

        this.langRuBtn.classList.toggle("active", lang === "ru");
        this.langEnBtn.classList.toggle("active", lang === "en");

        this.settings.language = lang;

        if (!silent) {
            window.api.saveSettings({ language: lang });
        }

        if (this.lastDashboard) {
            this.renderIssues(this.lastDashboard);
        }

        this.refreshStatusUI();

    }

    // Иконка рядом с заголовком статуса рисуется в CSS по data-state
    setStatusTitle(state, key) {

        this.statusTitle.dataset.state = state;
        this.statusTitle.textContent = I18nService.t(key);

    }

    refreshStatusUI() {

        switch (this.connectionState) {

            case "connecting":
                this.setStatusTitle("connecting", "status.connecting");
                break;

            case "connected":
                this.setStatusTitle("connected", "status.connected");
                this.statusUserInfo.innerText = I18nService.t("status.connectedInfo");
                this.statusSync.innerText =
                    I18nService.t("header.lastSync") + " " + this.connectionData.syncTime;
                break;

            case "error":
                this.setStatusTitle("error", "status.error");
                this.statusUserName.innerText = I18nService.t("status.error");
                break;

            case "saved":
                this.setStatusTitle("saved", "status.settingsSaved");
                break;

            default:
                break;

        }

    }

    async startup() {
        await this.loadSettings();
        if (this.serverUrl.value && this.apiKey.value) {
            await this.sync();
            this.startAutoSync();
            window.api.onTraySync(() => {
                this.sync();
            });
        }
    } 

    async loadSettings() {
        const settings = await window.api.loadSettings();
        this.settings = settings;
        this.serverUrl.value = settings.serverUrl || "";
        this.apiKey.value = settings.apiKey || "";
        this.pollInterval.value = settings.pollInterval || 60;
        this.startWithWindows.checked = settings.startWithWindows;
        this.startMinimized.checked = settings.startMinimized;
        this.setLanguage(settings.language || "ru", { silent: true });
    }

    async saveSettings(silent=false) {
        await window.api.saveSettings({

            serverUrl: this.serverUrl.value,
            apiKey: this.apiKey.value,
            pollInterval: Number(this.pollInterval.value),
            startWithWindows:this.startWithWindows.checked,
            startMinimized:this.startMinimized.checked,

        });
        await window.api.setLoginItemSettings(this.startWithWindows.checked);
        if(!silent){
            this.connectionState = "saved";
            this.setStatusTitle("saved", "status.settingsSaved");
            this.statusUserName.innerText = "";
            this.statusUserInfo.innerText = "";
        }
        if (this.serverUrl.value && this.apiKey.value) {
            await this.sync();
            this.startAutoSync();

        }
    }

    async sync() {
        if (this.syncing) {
            return;
        }

        this.syncing = true;

        this.connectionState = "connecting";
        this.setStatusTitle("connecting", "status.connecting");
        this.statusUserName.innerText = "";

        try {

            const data = await this.syncService.sync();
            const info = data.serverInfo;
            const dashboard = data.dashboard;
            this.closedStatuses = new Set(dashboard.statuses.filter(status => status.is_closed)
                .map(status => status.id)

            );
            
            this.lastDashboard =dashboard;

            this.connectionState = "connected";
            this.setStatusTitle("connected", "status.connected");

           this.statusUserName.innerText =
                info.user.firstname +
                " " +
                info.user.lastname;

            this.statusUserInfo.innerText =
                I18nService.t("status.connectedInfo");

            this.statusCard.className =
                "status-card connected";

            const now = new Date().toLocaleTimeString();
            this.connectionData.syncTime = now;
            this.statusSync.innerText =
                I18nService.t("header.lastSync") + " " + now;
            this.renderIssues(dashboard);
            // ищем изменения
            await this.compareIssues(
                dashboard
            );


            // после проверки сохраняем новое состояние
            for(const issue of dashboard.all){

                await this.history.update(issue);

            }

            this.lastDashboard=dashboard;
        }
        catch (ex) {

            console.error("[sync]", ex);

            this.connectionState = "error";
            this.setStatusTitle("error", "status.error");
            this.statusUserName.innerText =
                I18nService.t("status.error");

            this.statusUserInfo.innerText =
                ex.message;

            this.statusCard.className =
                "status-card error";

        } finally {

            this.syncing = false;

        }
    }

    showPage(name) {
        this.pages.forEach(page => {

            page.hidden = true;

        });

        document.getElementById(name + "Page").hidden = false;

        this.tabs.forEach(tab => {

            tab.classList.remove("active");

            if (tab.dataset.page === name)

                tab.classList.add("active");    
        });
    }

    renderIssues(dashboard){
        let assigned = [...dashboard.assigned];
        let authored = [...dashboard.authored];
        let watched = [...dashboard.watched];
        assigned = IssueFilterService.filter(assigned,this.issueFilter,this.closedStatuses);
        authored = IssueFilterService.filter(authored,this.issueFilter,this.closedStatuses);
        watched = IssueFilterService.filter(watched,this.issueFilter,this.closedStatuses );

        assigned = IssueSearchService.filterByQuery(assigned, this.searchQuery);
        authored = IssueSearchService.filterByQuery(authored, this.searchQuery);
        watched = IssueSearchService.filterByQuery(watched, this.searchQuery);

        assigned = IssueSearchService.sort(assigned, this.sortKey);
        authored = IssueSearchService.sort(authored, this.sortKey);
        watched = IssueSearchService.sort(watched, this.sortKey);

        this.assignedList.innerHTML = "";
        this.authoredList.innerHTML = "";
        this.watchedList.innerHTML = "";
        this.assignedTotal.innerText = assigned.length;
        this.authoredTotal.innerText = authored.length;
        this.watchedTotal.innerText = watched.length;

        const renderOptions = {

            statuses: dashboard.statuses || [],
            onStatusChange: (issue, statusId) => this.handleStatusChange(issue, statusId),
            onComment: (issue, text) => this.handleComment(issue, text)

        };

        const shown = new Set();

        assigned.forEach(issue => {

            this.assignedList.appendChild(
                IssueRenderer.create(issue, renderOptions)
            );

            shown.add(issue.id);

        });

        authored.forEach(issue => {

            if (shown.has(issue.id))
                return;

            this.authoredList.appendChild(
                IssueRenderer.create(issue, renderOptions)
            );

            shown.add(issue.id);

        });

        watched.forEach(issue => {

            if (shown.has(issue.id))
                return;

            this.watchedList.appendChild(
                IssueRenderer.create(issue, renderOptions)
            );

            shown.add(issue.id);

        });
        // Верхние счетчики

        this.assignedCount.innerText = assigned.length;
        this.authoredCount.innerText = authored.length;
        this.watchedCount.innerText = watched.length;

        // Счетчики секций

        this.assignedTotal.innerText = assigned.length;
        this.authoredTotal.innerText = authored.length;
        this.watchedTotal.innerText = watched.length;

        // Общее количество без дублей

        const all = new Set();

        assigned.forEach(issue => all.add(issue.id));
        authored.forEach(issue => all.add(issue.id));
        watched.forEach(issue => all.add(issue.id));

        this.allCount.innerText = all.size;
    }

    startAutoSync(){

        if(this.syncInterval){

            clearInterval(this.syncInterval);

        }
        const seconds = Math.max(5, Number(this.pollInterval.value) || 60);

        this.syncInterval = setInterval(() => {
            this.sync();
        }, seconds * 1000);

    }

    async compareIssues(dashboard){
        const settings = await window.api.loadSettings();
        const initialized = settings.historyInitialized;
        const changes=[];

        for(const issue of dashboard.all){

            const state=
                await this.history.get(issue.id);

        // Первый запуск
            if(!state){
                if (initialized) {

                changes.push({

                    type: "new",

                    issue

                });

                }
                await this.history.update(issue);

                continue;

            }

            changes.push(

                ...CompareService.compareIssue(

                    state,

                    issue

                )

            );

        }

        const groups=this.groupChanges(changes);

        for(const issueChanges of groups.values()){

            await this.processIssueChanges(issueChanges);

            await this.history.update(

                issueChanges[0].issue

            );

        }
        if (!initialized) {

            settings.historyInitialized = true;

            await window.api.saveSettings(settings);

        }
    }

    groupChanges(changes){

        const map = new Map();

        changes.forEach(change=>{

            const id = change.issue.id;

            if(!map.has(id)){

                map.set(id,[]);

            }

            map.get(id).push(change);

        });

        return map;

    }

    async processIssueChanges(changes) {


        if(!changes || changes.length===0)
            return;


        const issue = changes[0].issue;


        if(!issue)
            return;

        let journal = null;

        const hasUpdate = changes.some(
            c => c.type === "updated"
        );

        if (hasUpdate) {

            const state =
                await window.api.getHistory(issue.id);

            const fullIssue =
                await window.api.loadIssue(issue.id);

            const lastJournal =
                CommentService.getLastJournal(fullIssue);

            if (
                lastJournal &&
                    CommentService.hasComment(lastJournal)
            ) {

                if (
                    !state ||
                    state.lastJournalId !== lastJournal.id
                ) {

                    journal = lastJournal;

                    await this.history.setLastJournal(
                        issue.id,
                        lastJournal.id
                    );

                }

            }

        }

    // Убираем служебное изменение "updated"
        const visibleChanges = changes.filter(
            c => c.type !== "updated"
        );

    // Если нет ни комментария, ни других изменений — ничего не показываем
        if (visibleChanges.length === 0 && !journal)
            return;

        const notification =
            NotificationBuilder.build(
                issue,
                visibleChanges,
                journal
            );

        if (!notification.body.trim())
            return;

        this.journal.add({

            time: new Date().toLocaleTimeString(),

            project:
                issue.project?.name || I18nService.t("common.noProject"),

            id:
                issue.id,

            subject:
                issue.subject,

            body:
                notification.body,

            items: notification.items

        });

        window.api.showNotification(
            notification.title,
            notification.body
        );

    }

    updateFilterButtons() {

        this.filterActiveBtn.classList.toggle(
            "active",
            this.issueFilter === "active"
        );

        this.filterAllBtn.classList.toggle(
            "active",
            this.issueFilter === "all"
        );

    }
}