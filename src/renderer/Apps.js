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
        this.statusUser = document.querySelector(".status-user");
        this.statusLatency = document.querySelector(".status-latency");
        this.statusTime = document.querySelector(".status-time");
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
        this.journalList = document.getElementById("journalList");
        this.journal = new JournalService(this.journalList);
        this.history = new HistoryService();
        this.issueFilter = "open";
        this.filterButtons = document.querySelectorAll('input[name="issueFilter"]');
        this.issueFilter = "active";
        this.filterActiveBtn = document.getElementById("filterActive");
        this.filterAllBtn = document.getElementById("filterAll");
        this.pollInterval = document.getElementById("pollInterval");
        this.clearJournalBtn = document.getElementById("clearJournalBtn");
        this.startWithWindows = document.getElementById("startWithWindows");
        this.startMinimized = document.getElementById("startMinimized");
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
                arrow.innerText = block.hidden ? "▶" : "▼";
            });

        });

        this.filterButtons.forEach(button => {

            button.addEventListener("change", () => {

                this.issueFilter = button.value;

                if (this.lastDashboard) {

                    this.renderIssues(this.lastDashboard);

                }

            });

        });

        this.clearJournalBtn.addEventListener("click",() => { this.journal.clear();}
        );

        this.startWithWindows.addEventListener("change",() => this.saveSettings(true));
        this.startMinimized.addEventListener("change",() => this.saveSettings(true));
        this.pollInterval.addEventListener("change",() => this.saveSettings());
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

   initializeHistory(dashboard){

        if(this.initialized)
            return;


        dashboard.all.forEach(issue=>{

            this.history.save(issue);

        });


    this.initialized=true;

}
    

    async loadSettings() {
        const settings = await window.api.loadSettings();
        this.settings = settings;
        this.serverUrl.value = settings.serverUrl || "";
        this.apiKey.value = settings.apiKey || "";
        this.pollInterval.value = settings.pollInterval || 60;
        this.startWithWindows.checked = settings.startWithWindows;
        this.startMinimized.checked = settings.startMinimized;
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
            this.statusTitle.innerText = "💾 Настройки сохранены";
            this.statusUser.innerText = "";
            this.statusLatency.innerText = "";
            this.statusTime.innerText = "";
        }
    }

    async sync() {
        this.statusTitle.innerText = "⏳ Проверяем подключение...";
        this.statusUser.innerText = "";
        this.statusLatency.innerText = "";

        try {

            const data = await this.syncService.sync();
            const info = data.serverInfo;
            const dashboard = data.dashboard;
            this.closedStatuses = new Set(dashboard.statuses.filter(status => status.is_closed)
                .map(status => status.id)

            );
            
            this.lastDashboard =dashboard;

            this.statusTitle.innerText = "🟢 Подключено";

            this.statusUser.innerText =
                "Пользователь: " +
                info.user.firstname +
                " " +
                info.user.lastname;

            this.statusLatency.innerText =
                "Отклик: " +
                info.latency +
                " ms";

            const now = new Date().toLocaleTimeString();
            this.statusSync.innerText =
                "Последняя синхронизация: " + now;
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

            this.statusTitle.innerText = "🔴 Ошибка подключения";
            this.statusUser.innerText = ex.message;
            this.statusLatency.innerText = "";
            this.statusTime.innerText =
                new Date().toLocaleTimeString();

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

        this.assignedList.innerHTML = "";
        this.authoredList.innerHTML = "";
        this.watchedList.innerHTML = "";
        this.assignedTotal.innerText = assigned.length;
        this.authoredTotal.innerText = authored.length;
        this.watchedTotal.innerText = watched.length;

        const shown = new Set();

        assigned.forEach(issue => {

            this.assignedList.appendChild(
                IssueRenderer.create(issue)
            );

            shown.add(issue.id);

        });

        authored.forEach(issue => {

            if (shown.has(issue.id))
                return;

            this.authoredList.appendChild(
                IssueRenderer.create(issue)
            );

            shown.add(issue.id);

        });

        watched.forEach(issue => {

            if (shown.has(issue.id))
                return;

            this.watchedList.appendChild(
                IssueRenderer.create(issue)
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
        const seconds = Number(this.pollInterval.value);

        this.syncInterval=setInterval(()=>{

            this.sync();

        },seconds * 1000);

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
                issue.project?.name || "Без проекта",

            id:
                issue.id,

            subject:
                issue.subject,

            body:
                notification.body

        });

        window.api.showNotification(
            notification.title,
            notification.body
        );

    }

    async checkComments(issue){
        const state = await window.api.getHistory(issue.id);
        const fullIssue = await window.api.loadIssue(issue.id);

        const journal = CommentService.getLastJournal(fullIssue);

        if(!journal)
            return;

        if(!CommentService.hasComment(journal))
            return;

        if( state && state.lastJournalId===journal.id)
            return;

        this.journal.add(

            "💬 "+

            journal.user.name+

            " оставил комментарий"

        );
        

        window.api.showNotification(

            "["+

            issue.project.name+

            "] #"+

            issue.id,

            journal.user.name+

            "\n\n"+

            journal.notes

        );
        await window.api.saveHistory(issue.id,
            {

            updatedOn:issue.updated_on,

            lastJournalId:journal.id

            }

        );

    }

    async checkMissedChanges(dashboard){

        const changes =
            await CompareService.compareFromHistory(
                dashboard
            );


        if(changes.length===0)
            return;


        if(changes.length > 5){

            window.api.showNotification(

                "Redmine",

                "За время отсутствия:\n\n"+
                changes.length+
                " изменений"

            );

            return;

        }


        for(const change of changes){

            await this.processIssueChanges(
                [change]
            );
            await this.history.update(
                change.issue
            );
        }

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