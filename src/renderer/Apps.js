class App {

    constructor() {

        this.serverUrl = document.getElementById("serverUrl");
        this.apiKey = document.getElementById("apiKey");
        this.allowSelfSigned = document.getElementById("allowSelfSigned");
        this.proxyUrl = document.getElementById("proxyUrl");

        this.profileSelect = document.getElementById("profileSelect");
        this.profileName = document.getElementById("profileName");
        this.profileNewBtn = document.getElementById("profileNewBtn");
        this.profileRemoveBtn = document.getElementById("profileRemoveBtn");

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
        this.syncInterval = null;
        this.syncing = false;
        this.syncRetryCount = 0;
        this.journalList = document.getElementById("journalList");
        this.journal = new JournalService(this.journalList);
        this.history = new HistoryService();
        this.timers = new TimerService();

        this.issueFilter = "active";
        this.filterActiveBtn = document.getElementById("filterActive");
        this.filterAllBtn = document.getElementById("filterAll");
        this.issuesSearch = document.getElementById("issuesSearch");
        this.issuesSort = document.getElementById("issuesSort");
        this.issuesProject = document.getElementById("issuesProject");
        this.issuesTracker = document.getElementById("issuesTracker");
        this.issuesStatus = document.getElementById("issuesStatus");
        this.issuesReset = document.getElementById("issuesReset");
        this.searchQuery = "";
        this.sortKey = "updated_desc";
        this.filters = { projectId: "", trackerId: "", statusId: "" };

        this.pollInterval = document.getElementById("pollInterval");
        this.maxIssues = document.getElementById("maxIssues");
        this.themeSelect = document.getElementById("themeSelect");
        this.clearJournalBtn = document.getElementById("clearJournalBtn");
        this.startWithWindows = document.getElementById("startWithWindows");
        this.startMinimized = document.getElementById("startMinimized");

        this.dnd = document.getElementById("dnd");
        this.quietEnabled = document.getElementById("quietEnabled");
        this.quietFrom = document.getElementById("quietFrom");
        this.quietTo = document.getElementById("quietTo");
        this.notifyBoxes = document.querySelectorAll("[data-notify]");
        this.appVersion = document.getElementById("appVersion");

        this.langRuBtn = document.getElementById("langRu");
        this.langEnBtn = document.getElementById("langEn");
        this.connectionState = null;
        this.connectionData = {};

        this.settings = {};
        this.lastDashboard = null;
        this.closedStatuses = new Set();
        this.currentUser = null;
        this.activities = null;

        // Номер "поколения" данных. Меняется при смене профиля, чтобы
        // запоздавшая синхронизация старого сервера не писала в историю нового.
        this.epoch = 0;

        this.registerEvents();
        this.registerIpcEvents();
        this.startup();

    }

    // ===================================================================== события

    registerEvents() {

        this.saveBtn.addEventListener(
            "click",
            () => this.saveSettings()
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

            this.rerender();

        });

        this.filterAllBtn.addEventListener("click", () => {

            this.issueFilter = "all";

            this.updateFilterButtons();

            this.rerender();

        });

        this.sectionHeaders.forEach(header => {

            // Секции "Созданные мной" и "Наблюдаю" свёрнуты при запуске - стрелка должна это показывать
            const initialBlock = document.getElementById(header.dataset.target);

            header.querySelector(".arrow")
                ?.classList.toggle("collapsed", !!initialBlock?.hidden);

            header.addEventListener("click", () => {
                const id = header.dataset.target;
                const block = document.getElementById(id);
                const arrow = header.querySelector(".arrow");
                block.hidden = !block.hidden;
                arrow.classList.toggle("collapsed", block.hidden);
            });

        });

        this.clearJournalBtn.addEventListener("click", () => { this.journal.clear(); });

        // Простые переключатели: сохраняем без повторной синхронизации
        this.startWithWindows.addEventListener("change", () => this.persist());
        this.startMinimized.addEventListener("change", () => this.persist());
        this.themeSelect.addEventListener("change", () => this.persist());
        this.quietEnabled.addEventListener("change", () => this.persist());
        this.quietFrom.addEventListener("change", () => this.persist());
        this.quietTo.addEventListener("change", () => this.persist());
        this.notifyBoxes.forEach(box =>
            box.addEventListener("change", () => this.persist())
        );

        this.pollInterval.addEventListener("change", async () => {

            await this.persist();

            this.startAutoSync();

        });

        this.maxIssues.addEventListener("change", async () => {

            await this.persist();

            if (this.isConfigured())
                this.sync();

        });

        // "Не беспокоить" меняется отдельно, чтобы не затирать значение из меню трея
        this.dnd.addEventListener("change", () => {

            window.api.saveSettings({ dnd: this.dnd.checked });

        });

        this.langRuBtn.addEventListener("click", () => this.setLanguage("ru"));
        this.langEnBtn.addEventListener("click", () => this.setLanguage("en"));

        this.issuesSearch.addEventListener("input", () => {

            this.searchQuery = this.issuesSearch.value;

            this.rerender();

        });

        this.issuesSort.addEventListener("change", () => {

            this.sortKey = this.issuesSort.value;

            this.rerender();

        });

        const onFilterChange = () => {

            this.filters = {
                projectId: this.issuesProject.value,
                trackerId: this.issuesTracker.value,
                statusId: this.issuesStatus.value
            };

            this.saveFilters();

            this.rerender();

        };

        this.issuesProject.addEventListener("change", onFilterChange);
        this.issuesTracker.addEventListener("change", onFilterChange);
        this.issuesStatus.addEventListener("change", onFilterChange);

        this.issuesReset.addEventListener("click", () => {

            this.issuesSearch.value = "";
            this.searchQuery = "";
            this.issuesProject.value = "";
            this.issuesTracker.value = "";
            this.issuesStatus.value = "";

            onFilterChange();

        });

        // Профили
        this.profileSelect.addEventListener("change", async () => {

            const settings = await window.api.switchProfile(this.profileSelect.value);

            await this.applyProfile(settings);

        });

        this.profileNewBtn.addEventListener("click", async () => {

            const n = (this.settings.profiles || []).length + 1;

            const settings = await window.api.addProfile(
                I18nService.t("settings.profileDefaultName", { n })
            );

            await this.applyProfile(settings);

            this.profileName.select();

        });

        this.profileRemoveBtn.addEventListener("click", async () => {

            const profiles = this.settings.profiles || [];

            if (profiles.length <= 1)
                return;

            const active = profiles.find(p => p.id === this.settings.activeProfileId);

            if (!confirm(I18nService.t("settings.profileRemoveConfirm", { name: active?.name || "" })))
                return;

            const settings = await window.api.removeProfile(this.settings.activeProfileId);

            await this.applyProfile(settings);

        });

    }

    // События из главного процесса (трей, уведомления)
    registerIpcEvents() {

        window.api.onTraySync(() => this.sync());

        window.api.onNotificationOpen(issueId => this.focusIssue(issueId));

        window.api.onSettingsChanged(changes => {

            if (changes && "dnd" in changes)
                this.dnd.checked = !!changes.dnd;

        });

    }

    isConfigured() {

        return !!(this.serverUrl.value && this.apiKey.value);

    }

    rerender() {

        if (this.lastDashboard)
            this.renderIssues(this.lastDashboard);

    }

    // ===================================================================== действия с задачами

    async handleStatusChange(issue, newStatusId) {

        await window.api.updateIssueStatus(issue.id, newStatusId);

        const statusInfo = (this.lastDashboard?.statuses || [])
            .find(status => status.id === newStatusId);

        issue.status = {

            id: newStatusId,
            name: statusInfo ? statusInfo.name : issue.status.name

        };

        await this.history.update(issue);

        this.rerender();

    }

    // Приоритет, срок, готовность, исполнитель
    async handleUpdate(issue, fields) {

        await window.api.updateIssue(issue.id, fields);

        if ("priority_id" in fields) {

            const info = (this.lastDashboard?.priorities || [])
                .find(p => p.id === fields.priority_id);

            issue.priority = {
                id: fields.priority_id,
                name: info ? info.name : issue.priority?.name
            };

        }

        if ("assigned_to_id" in fields) {

            const user = this.currentUser;

            issue.assigned_to = {
                id: fields.assigned_to_id,
                name: user ? (user.firstname + " " + user.lastname).trim() : ""
            };

        }

        if ("due_date" in fields)
            issue.due_date = fields.due_date || null;

        if ("done_ratio" in fields)
            issue.done_ratio = fields.done_ratio;

        // Свои изменения не должны превращаться в уведомления при следующей синхронизации
        await this.history.update(issue);

        this.rerender();

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

    async handleLogTime(issue, payload) {

        await window.api.logTime(issue.id, payload);

    }

    async getActivities() {

        if (this.activities)
            return this.activities;

        const list = await window.api.getTimeActivities();

        this.activities = list;

        return list;

    }

    // Клик по системному уведомлению: открыть карточку задачи
    focusIssue(issueId) {

        this.showPage("issues");

        const find = () =>
            document.querySelector('.issue-card[data-issue-id="' + issueId + '"]');

        let card = find();

        // Карточку могли скрыть фильтры или поиск - сбрасываем их
        if (!card && this.lastDashboard) {

            this.issueFilter = "all";
            this.updateFilterButtons();
            this.issuesSearch.value = "";
            this.searchQuery = "";
            this.filters = { projectId: "", trackerId: "", statusId: "" };
            this.syncFilterControls();

            this.renderIssues(this.lastDashboard);

            card = find();

        }

        if (!card) {

            // Задачи нет в списках (например, чужая) - открываем в браузере
            window.api.openIssue(issueId);

            return;

        }

        // Развернуть секцию, если она свёрнута
        const list = card.closest(".issues-list");

        if (list && list.hidden) {

            list.hidden = false;

            document
                .querySelector('.issues-header[data-target="' + list.id + '"] .arrow')
                ?.classList.remove("collapsed");

        }

        card.scrollIntoView({ behavior: "smooth", block: "center" });

        IssueRenderer.flash(card);

    }

    // ===================================================================== язык / статус

    setLanguage(lang, options = {}) {

        const silent = options.silent || false;

        I18nService.setLanguage(lang);

        this.langRuBtn.classList.toggle("active", lang === "ru");
        this.langEnBtn.classList.toggle("active", lang === "en");

        this.settings.language = lang;

        if (!silent) {
            window.api.saveSettings({ language: lang });
        }

        this.renderProfiles();

        this.rerender();

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

    // ===================================================================== запуск и настройки

    async startup() {

        await this.loadSettings();

        const version = await window.api.getAppVersion();

        this.appVersion.textContent = version;

        if (this.isConfigured()) {
            await this.sync();
            this.startAutoSync();
        }

    }

    async loadSettings(preloaded) {

        const settings = preloaded || await window.api.loadSettings();

        this.settings = settings;
        this.serverUrl.value = settings.serverUrl || "";
        this.apiKey.value = settings.apiKey || "";
        this.allowSelfSigned.checked = !!settings.allowSelfSigned;
        this.proxyUrl.value = settings.proxyUrl || "";
        this.pollInterval.value = settings.pollInterval || 60;
        this.maxIssues.value = settings.maxIssues || 500;
        this.themeSelect.value = settings.theme || "system";
        this.startWithWindows.checked = settings.startWithWindows;
        this.startMinimized.checked = settings.startMinimized;
        this.dnd.checked = !!settings.dnd;
        this.quietEnabled.checked = !!settings.quietEnabled;
        this.quietFrom.value = settings.quietFrom || "22:00";
        this.quietTo.value = settings.quietTo || "08:00";

        const events = settings.notifyEvents || {};

        this.notifyBoxes.forEach(box => {
            box.checked = events[box.dataset.notify] !== false;
        });

        // Всё, что хранится отдельно для каждого профиля
        const profileId = settings.activeProfileId || "default";

        this.timers.setProfile(profileId);
        this.journal.setStorageKey("journal:" + profileId);
        this.loadFilters();

        this.setLanguage(settings.language || "ru", { silent: true });

    }

    renderProfiles() {

        const profiles = this.settings.profiles || [];

        this.profileSelect.innerHTML = "";

        profiles.forEach(profile => {

            const option = document.createElement("option");

            option.value = profile.id;
            option.textContent = profile.name;

            if (profile.id === this.settings.activeProfileId)
                option.selected = true;

            this.profileSelect.appendChild(option);

        });

        const active = profiles.find(p => p.id === this.settings.activeProfileId);

        this.profileName.value = active ? active.name : "";
        this.profileRemoveBtn.disabled = profiles.length <= 1;

    }

    collectSettings() {

        const notifyEvents = {};

        this.notifyBoxes.forEach(box => {
            notifyEvents[box.dataset.notify] = box.checked;
        });

        return {

            serverUrl: this.serverUrl.value,
            apiKey: this.apiKey.value,
            allowSelfSigned: this.allowSelfSigned.checked,
            proxyUrl: this.proxyUrl.value.trim(),
            pollInterval: Number(this.pollInterval.value),
            maxIssues: Number(this.maxIssues.value),
            theme: this.themeSelect.value,
            startWithWindows: this.startWithWindows.checked,
            startMinimized: this.startMinimized.checked,
            quietEnabled: this.quietEnabled.checked,
            quietFrom: this.quietFrom.value || "22:00",
            quietTo: this.quietTo.value || "08:00",
            notifyEvents

        };

    }

    // Только сохранить (без синхронизации)
    async persist() {

        const data = this.collectSettings();

        await window.api.saveSettings(data);

        Object.assign(this.settings, data);

        await window.api.setLoginItemSettings(this.startWithWindows.checked);

    }

    async saveSettings() {

        await this.persist();

        // Название профиля
        const name = this.profileName.value.trim();
        const active = (this.settings.profiles || [])
            .find(p => p.id === this.settings.activeProfileId);

        if (name && active && name !== active.name) {

            const updated = await window.api.renameProfile(active.id, name);

            this.settings.profiles = updated.profiles;

            this.renderProfiles();

        }

        this.activities = null;

        this.connectionState = "saved";
        this.setStatusTitle("saved", "status.settingsSaved");
        this.statusUserName.innerText = "";
        this.statusUserInfo.innerText = "";

        if (this.isConfigured()) {
            await this.sync();
            this.startAutoSync();
        }

    }

    // ===================================================================== профили

    // Полный сброс состояния при смене сервера
    async applyProfile(settings) {

        this.epoch++;

        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }

        this.syncing = false;
        this.lastDashboard = null;
        this.closedStatuses = new Set();
        this.currentUser = null;
        this.activities = null;
        this.connectionState = null;
        this.connectionData = {};

        [this.assignedList, this.authoredList, this.watchedList].forEach(list => {
            list.innerHTML = "";
        });

        [
            this.assignedCount, this.authoredCount, this.watchedCount,
            this.assignedTotal, this.authoredTotal, this.watchedTotal, this.allCount
        ].forEach(el => { el.innerText = "0"; });

        this.statusUserName.innerText = "—";
        this.statusUserInfo.innerText = I18nService.t("common.noData");
        this.statusCard.className = "status-card";
        delete this.statusTitle.dataset.state;
        this.statusTitle.textContent = "";
        this.statusSync.innerText = "";

        window.api.setTrayStatus("");

        await this.loadSettings(settings);

        if (this.isConfigured()) {
            await this.sync();
            this.startAutoSync();
        }

    }

    // ===================================================================== фильтры

    filtersKey() {

        return "filters:" + (this.settings.activeProfileId || "default");

    }

    loadFilters() {

        try {

            const saved = JSON.parse(localStorage.getItem(this.filtersKey()) || "null");

            this.filters = Object.assign(
                { projectId: "", trackerId: "", statusId: "" },
                saved && typeof saved === "object" ? saved : {}
            );

        } catch (ex) {

            this.filters = { projectId: "", trackerId: "", statusId: "" };

        }

    }

    saveFilters() {

        try {
            localStorage.setItem(this.filtersKey(), JSON.stringify(this.filters));
        } catch (ex) {
            // не критично
        }

    }

    syncFilterControls() {

        this.issuesProject.value = this.filters.projectId;
        this.issuesTracker.value = this.filters.trackerId;
        this.issuesStatus.value = this.filters.statusId;

    }

    // Списки проектов, трекеров и статусов берём из загруженных задач
    updateFilterOptions(dashboard) {

        const { projects, trackers } = IssueFilterService.collectOptions(dashboard.all);

        const fill = (select, items, allKey, selected) => {

            select.innerHTML = "";

            const all = document.createElement("option");

            all.value = "";
            all.textContent = I18nService.t(allKey);
            select.appendChild(all);

            items.forEach(item => {

                const option = document.createElement("option");

                option.value = item.id;
                option.textContent = item.name;
                select.appendChild(option);

            });

            // Сохранённый фильтр мог устареть (проект пропал из списка)
            select.value = items.some(i => String(i.id) === String(selected)) ? selected : "";

        };

        fill(this.issuesProject, projects, "issues.allProjects", this.filters.projectId);
        fill(this.issuesTracker, trackers, "issues.allTrackers", this.filters.trackerId);

        const statuses = (dashboard.statuses || []).map(s => ({
            id: s.id,
            name: I18nService.status(s.name)
        }));

        fill(this.issuesStatus, statuses, "issues.allStatuses", this.filters.statusId);

        this.filters = {
            projectId: this.issuesProject.value,
            trackerId: this.issuesTracker.value,
            statusId: this.issuesStatus.value
        };

    }

    // ===================================================================== синхронизация

    async sync() {
        if (this.syncing) {
            return;
        }

        const epoch = this.epoch;

        if (!this.isConfigured()) {

            this.connectionState = "error";
            this.setStatusTitle("error", "status.error");
            this.statusUserName.innerText = I18nService.t("status.error");
            this.statusUserInfo.innerText = ErrorUtils.format({ message: "RC:NOT_CONFIGURED" });

            return;

        }

        this.syncing = true;

        this.connectionState = "connecting";
        this.setStatusTitle("connecting", "status.connecting");
        this.statusUserName.innerText = "";

        try {

            const data = await this.syncService.sync();

            if (epoch !== this.epoch)
                return;

            const info = data.serverInfo;
            const dashboard = data.dashboard;

            this.currentUser = info.user;

            this.closedStatuses = new Set(dashboard.statuses.filter(status => status.is_closed)
                .map(status => status.id)
            );

            this.lastDashboard = dashboard;

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

            this.updateFilterOptions(dashboard);
            this.renderIssues(dashboard);

            this.updateTrayStatus(dashboard);

            // ищем изменения
            await this.compareIssues(
                dashboard,
                epoch
            );

            // после проверки сохраняем новое состояние
            for (const issue of dashboard.all) {

                if (epoch !== this.epoch)
                    return;

                await this.history.update(issue);

            }

        }
        catch (ex) {

            if (epoch !== this.epoch)
                return;

            console.error("[sync]", ex);

            const message = ErrorUtils.format(ex);

            this.connectionState = "error";
            this.setStatusTitle("error", "status.error");
            this.statusUserName.innerText =
                I18nService.t("status.error");

            this.statusUserInfo.innerText =
                message;

            this.statusCard.className =
                "status-card error";

            window.api.setTrayStatus(
                I18nService.t("status.trayError", { msg: message })
            );

        } finally {

            if (epoch === this.epoch)
                this.syncing = false;

        }
    }

    // Подсказка у значка в трее: сколько задач назначено на меня
    updateTrayStatus(dashboard) {

        const open = dashboard.assigned.filter(
            issue => !this.closedStatuses.has(issue.status.id)
        ).length;

        window.api.setTrayStatus(
            I18nService.t("status.trayOk", { n: open })
        );

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

    // ===================================================================== отрисовка

    renderIssues(dashboard) {

        // Пока перерисовываем списки, запоминаем недописанные комментарии и открытые формы
        const saved = new Map();

        document.querySelectorAll(".issue-card").forEach(card => {
            saved.set(card.dataset.issueId, IssueRenderer.captureState(card));
        });

        const priorities = dashboard.priorities || [];

        const prepare = list => {

            list = IssueFilterService.filter(list, this.issueFilter, this.closedStatuses);
            list = IssueFilterService.filterByFields(list, this.filters);
            list = IssueSearchService.filterByQuery(list, this.searchQuery);

            return IssueSearchService.sort(list, this.sortKey, priorities);

        };

        const assigned = prepare([...dashboard.assigned]);
        const authored = prepare([...dashboard.authored]);
        const watched = prepare([...dashboard.watched]);

        this.assignedList.innerHTML = "";
        this.authoredList.innerHTML = "";
        this.watchedList.innerHTML = "";

        const renderOptions = {

            statuses: dashboard.statuses || [],
            priorities,
            currentUserId: this.currentUser ? this.currentUser.id : null,
            timers: this.timers,
            getActivities: () => this.getActivities(),
            onStatusChange: (issue, statusId) => this.handleStatusChange(issue, statusId),
            onUpdate: (issue, fields) => this.handleUpdate(issue, fields),
            onComment: (issue, text) => this.handleComment(issue, text),
            onLogTime: (issue, payload) => this.handleLogTime(issue, payload)

        };

        const shown = new Set();

        const append = (list, container) => {

            list.forEach(issue => {

                if (shown.has(issue.id))
                    return;

                const card = IssueRenderer.create(issue, renderOptions);

                container.appendChild(card);

                IssueRenderer.restoreState(card, saved.get(String(issue.id)), renderOptions);

                shown.add(issue.id);

            });

        };

        append(assigned, this.assignedList);
        append(authored, this.authoredList);
        append(watched, this.watchedList);

        // Верхние счетчики и счетчики секций

        this.assignedCount.innerText = assigned.length;
        this.authoredCount.innerText = authored.length;
        this.watchedCount.innerText = watched.length;

        this.assignedTotal.innerText = assigned.length;
        this.authoredTotal.innerText = authored.length;
        this.watchedTotal.innerText = watched.length;

        // Общее количество без дублей
        this.allCount.innerText = shown.size;

    }

    startAutoSync() {

        if (this.syncInterval) {

            clearInterval(this.syncInterval);

        }
        const seconds = Math.max(5, Number(this.pollInterval.value) || 60);

        this.syncInterval = setInterval(() => {
            this.sync();
        }, seconds * 1000);

    }

    // ===================================================================== изменения

    async compareIssues(dashboard, epoch) {

        const initialized = !!this.settings.historyInitialized;
        const changes = [];

        for (const issue of dashboard.all) {

            if (epoch !== this.epoch)
                return;

            const state =
                await this.history.get(issue.id);

            // Первый запуск
            if (!state) {
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

        const groups = this.groupChanges(changes);

        for (const issueChanges of groups.values()) {

            if (epoch !== this.epoch)
                return;

            await this.processIssueChanges(issueChanges);

            await this.history.update(

                issueChanges[0].issue

            );

        }

        if (!initialized && epoch === this.epoch) {

            this.settings.historyInitialized = true;

            // Сохраняем только этот флаг, а не все настройки целиком
            await window.api.saveSettings({ historyInitialized: true });

        }

    }

    groupChanges(changes) {

        const map = new Map();

        changes.forEach(change => {

            const id = change.issue.id;

            if (!map.has(id)) {

                map.set(id, []);

            }

            map.get(id).push(change);

        });

        return map;

    }

    async processIssueChanges(changes) {

        if (!changes || changes.length === 0)
            return;

        const issue = changes[0].issue;

        if (!issue)
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

                    // Отмечаем комментарий прочитанным, даже если уведомления о них выключены
                    await this.history.setLastJournal(
                        issue.id,
                        lastJournal.id
                    );

                }

            }

        }

        const events = this.settings.notifyEvents;

        // Убираем служебное изменение "updated" и то, о чём пользователь не просил уведомлять
        const visibleChanges = changes.filter(
            c => c.type !== "updated" &&
                 NotificationPolicy.allows(c.type, events)
        );

        if (journal && !NotificationPolicy.allows("comment", events))
            journal = null;

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

        // Тихие часы и "Не беспокоить" учитывает главный процесс
        window.api.showNotification(
            notification.title,
            notification.body,
            issue.id
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
