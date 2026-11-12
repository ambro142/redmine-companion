class IssueRenderer {

    // Обратная совместимость: цвета теперь считает IssueMeta по данным API
    static getStatusClass(status, statuses = []) {

        return IssueMeta.statusClass(status, statuses);

    }

    static getPriorityClass(priority, priorities = []) {

        return IssueMeta.priorityClass(priority, priorities);

    }

    // options:
    //   statuses, priorities    - справочники Redmine
    //   currentUserId           - для кнопки "Взять себе"
    //   timers                  - TimerService
    //   getActivities()         - Promise со списком видов деятельности
    //   onStatusChange(issue, statusId)
    //   onUpdate(issue, fields)         - приоритет, срок, готовность, исполнитель
    //   onComment(issue, text)
    //   onLogTime(issue, { hours, activityId, comments })
    static create(issue, options = {}){

        const statuses = options.statuses || [];
        const priorities = options.priorities || [];

        const card = document.createElement("div");

        card.className = "issue-card";
        card.dataset.issueId = String(issue.id);

        const assigned =
            issue.assigned_to
                ? issue.assigned_to.name
                : I18nService.t("common.unassigned");

        const due =
            issue.due_date
                ? issue.due_date
                : I18nService.t("common.noDueDate");

        const canTake =
            !!options.currentUserId &&
            issue.assigned_to?.id !== options.currentUserId;

        card.innerHTML = `

            <div class="issue-project">

                ${HtmlUtils.escape(issue.project.name)}

                <span class="issue-id">

                    #${issue.id}

                </span>

            </div>

            <div class="issue-subject">

                ${HtmlUtils.escape(issue.subject)}

            </div>

            <div class="issue-meta">

                <span>

                    ${Icon.html("person")} ${HtmlUtils.escape(assigned)}

                </span>

                <span>

                    ${Icon.html("calendar")} ${HtmlUtils.escape(due)}

                </span>

            </div>

            <div class="issue-tags">

                <select class="status-tag issue-status-select ${IssueMeta.statusClass(issue.status, statuses)}"></select>

                <select class="priority-tag issue-priority-select ${IssueMeta.priorityClass(issue.priority, priorities)}"></select>

            </div>

            <div class="issue-actions">

                <button type="button" class="issue-reply-btn">

                    ${Icon.html("chat")} ${HtmlUtils.escape(I18nService.t("issues.reply"))}

                </button>

                <button type="button" class="issue-time-btn">

                    ${Icon.html("schedule")} ${HtmlUtils.escape(I18nService.t("issues.time"))}

                </button>

                <button type="button" class="issue-edit-btn">

                    ${Icon.html("edit")} ${HtmlUtils.escape(I18nService.t("issues.edit"))}

                </button>

                <button type="button" class="issue-take-btn" ${canTake ? "" : "hidden"}>

                    ${Icon.html("person")} ${HtmlUtils.escape(I18nService.t("issues.take"))}

                </button>

            </div>

            <div class="issue-reply-box" hidden>

                <textarea
                    class="issue-reply-text"
                    placeholder="${HtmlUtils.escape(I18nService.t("issues.commentPlaceholder"))}"
                ></textarea>

                <div class="issue-reply-buttons">

                    <button type="button" class="issue-reply-send primary-button">
                        ${HtmlUtils.escape(I18nService.t("issues.send"))}
                    </button>

                    <button type="button" class="issue-reply-cancel">
                        ${HtmlUtils.escape(I18nService.t("issues.cancel"))}
                    </button>

                </div>

            </div>

            <div class="issue-time-box" hidden>

                <div class="issue-box-row">

                    <input
                        type="text"
                        class="issue-time-hours"
                        placeholder="${HtmlUtils.escape(I18nService.t("issues.timeHours"))}">

                    <button type="button" class="issue-timer-btn"></button>

                    <select class="issue-time-activity" title="${HtmlUtils.escape(I18nService.t("issues.timeActivity"))}"></select>

                </div>

                <input
                    type="text"
                    class="issue-time-comment"
                    maxlength="255"
                    placeholder="${HtmlUtils.escape(I18nService.t("issues.timeComment"))}">

                <div class="issue-reply-buttons">

                    <button type="button" class="issue-time-send primary-button">
                        ${HtmlUtils.escape(I18nService.t("issues.timeLog"))}
                    </button>

                    <button type="button" class="issue-time-cancel">
                        ${HtmlUtils.escape(I18nService.t("issues.cancel"))}
                    </button>

                </div>

            </div>

            <div class="issue-edit-box" hidden>

                <div class="issue-box-row">

                    <label class="issue-field">

                        <span>${HtmlUtils.escape(I18nService.t("issues.due"))}</span>

                        <input type="date" class="issue-edit-due">

                    </label>

                    <label class="issue-field">

                        <span>${HtmlUtils.escape(I18nService.t("issues.doneRatio"))}</span>

                        <select class="issue-edit-done"></select>

                    </label>

                </div>

                <div class="issue-reply-buttons">

                    <button type="button" class="issue-edit-save primary-button">
                        ${HtmlUtils.escape(I18nService.t("issues.save"))}
                    </button>

                    <button type="button" class="issue-edit-cancel">
                        ${HtmlUtils.escape(I18nService.t("issues.cancel"))}
                    </button>

                </div>

            </div>

            <div class="issue-action-feedback"></div>

        `;

        this.populateStatusSelect(card, issue, statuses);
        this.populatePrioritySelect(card, issue, priorities);
        this.populateEditBox(card, issue);
        this.wireSelect(card, ".issue-status-select", issue, newId =>
            options.onStatusChange(issue, newId), () => issue.status.id);
        this.wireSelect(card, ".issue-priority-select", issue, newId =>
            options.onUpdate(issue, { priority_id: newId }), () => issue.priority?.id);
        this.wireReplyBox(card, issue, options.onComment || (() => {}));
        this.wireTimeBox(card, issue, options);
        this.wireEditBox(card, issue, options.onUpdate || (() => {}));
        this.wireTake(card, issue, options);

        card.addEventListener("click", (event) => {

            if (event.target.closest(
                ".issue-status-select, .issue-priority-select, .issue-actions, " +
                ".issue-reply-box, .issue-time-box, .issue-edit-box"
            ))
                return;

            window.api.openIssue(issue.id);

        });

        this.updateTimerUi(card, issue.id, options.timers);

        return card;

    }

    // ----------------------------------------------------------------- селекты

    static populateStatusSelect(card, issue, statuses){

        const select = card.querySelector(".issue-status-select");

        const list = statuses.length
            ? statuses
            : [{ id: issue.status.id, name: issue.status.name }];

        list.forEach(status => {

            const option = document.createElement("option");

            option.value = status.id;
            option.textContent = I18nService.status(status.name);

            if (status.id === issue.status.id)
                option.selected = true;

            select.appendChild(option);

        });

        select.disabled = statuses.length === 0;

    }

    static populatePrioritySelect(card, issue, priorities){

        const select = card.querySelector(".issue-priority-select");

        const current = issue.priority;

        // Показываем активные приоритеты и текущий (даже если его отключили)
        const list = priorities.filter(p => p.active !== false || p.id === current?.id);

        if (list.length === 0 && current)
            list.push({ id: current.id, name: current.name });

        list.forEach(priority => {

            const option = document.createElement("option");

            option.value = priority.id;
            option.textContent = I18nService.priority(priority.name);

            if (priority.id === current?.id)
                option.selected = true;

            select.appendChild(option);

        });

        select.disabled = priorities.length === 0;

    }

    static populateEditBox(card, issue){

        card.querySelector(".issue-edit-due").value = issue.due_date || "";

        const done = card.querySelector(".issue-edit-done");

        for (let value = 0; value <= 100; value += 10) {

            const option = document.createElement("option");

            option.value = value;
            option.textContent = value + "%";

            if (value === (issue.done_ratio || 0))
                option.selected = true;

            done.appendChild(option);

        }

    }

    // Общая логика "поменяли значение в селекте -> отправили в Redmine -> при ошибке откатили"
    static wireSelect(card, selector, issue, apply, getPrevious){

        const select = card.querySelector(selector);
        const feedback = card.querySelector(".issue-action-feedback");

        select.addEventListener("click", event => event.stopPropagation());

        select.addEventListener("change", async () => {

            const previous = getPrevious();
            const next = Number(select.value);

            select.disabled = true;
            this.clearFeedback(feedback);

            try {

                await apply(next);

            } catch (ex) {

                select.value = String(previous);
                this.showError(feedback, ex);

            } finally {

                select.disabled = false;

            }

        });

    }

    // ----------------------------------------------------------------- обратная связь

    static clearFeedback(feedback){

        feedback.textContent = "";
        feedback.className = "issue-action-feedback";

    }

    static showError(feedback, ex){

        feedback.textContent =
            I18nService.t("issues.actionError") + ": " + ErrorUtils.format(ex);
        feedback.className = "issue-action-feedback error";

    }

    static showSuccess(feedback, key){

        feedback.textContent = I18nService.t(key);
        feedback.className = "issue-action-feedback success";

        setTimeout(() => this.clearFeedback(feedback), 4000);

    }

    // ----------------------------------------------------------------- ответ

    static wireReplyBox(card, issue, onComment){

        const replyBtn = card.querySelector(".issue-reply-btn");
        const replyBox = card.querySelector(".issue-reply-box");
        const replyText = card.querySelector(".issue-reply-text");
        const sendBtn = card.querySelector(".issue-reply-send");
        const cancelBtn = card.querySelector(".issue-reply-cancel");
        const feedback = card.querySelector(".issue-action-feedback");

        replyBox.addEventListener("click", event => event.stopPropagation());

        replyBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            replyBox.hidden = !replyBox.hidden;

            if (!replyBox.hidden)
                replyText.focus();

        });

        cancelBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            replyBox.hidden = true;
            replyText.value = "";

        });

        sendBtn.addEventListener("click", async (event) => {

            event.stopPropagation();

            const text = replyText.value.trim();

            if (!text)
                return;

            sendBtn.disabled = true;
            this.clearFeedback(feedback);

            try {

                await onComment(issue, text);

                replyText.value = "";
                replyBox.hidden = true;

                this.showSuccess(feedback, "issues.commentSent");

            } catch (ex) {

                this.showError(feedback, ex);

            } finally {

                sendBtn.disabled = false;

            }

        });

    }

    // ----------------------------------------------------------------- время

    static wireTimeBox(card, issue, options){

        const timeBtn = card.querySelector(".issue-time-btn");
        const box = card.querySelector(".issue-time-box");
        const hours = card.querySelector(".issue-time-hours");
        const comment = card.querySelector(".issue-time-comment");
        const activity = card.querySelector(".issue-time-activity");
        const timerBtn = card.querySelector(".issue-timer-btn");
        const sendBtn = card.querySelector(".issue-time-send");
        const cancelBtn = card.querySelector(".issue-time-cancel");
        const feedback = card.querySelector(".issue-action-feedback");

        const timers = options.timers;

        box.addEventListener("click", event => event.stopPropagation());

        timeBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            box.hidden = !box.hidden;

            if (!box.hidden) {

                this.populateActivities(card, options);

                hours.focus();

            }

        });

        cancelBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            box.hidden = true;

        });

        timerBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            if (!timers)
                return;

            if (timers.isRunning(issue.id)) {

                const ms = timers.stop(issue.id);

                hours.value = String(TimeUtils.elapsedToHours(ms));

            } else {

                timers.start(issue.id);

            }

            this.updateTimerUi(card, issue.id, timers);

        });

        sendBtn.addEventListener("click", async (event) => {

            event.stopPropagation();

            const value = TimeUtils.parseHours(hours.value);

            if (value === null) {

                feedback.textContent = I18nService.t("issues.timeInvalid");
                feedback.className = "issue-action-feedback error";

                return;

            }

            sendBtn.disabled = true;
            this.clearFeedback(feedback);

            try {

                await options.onLogTime(issue, {
                    hours: value,
                    activityId: activity.value ? Number(activity.value) : null,
                    comments: comment.value.trim()
                });

                hours.value = "";
                comment.value = "";
                box.hidden = true;

                this.showSuccess(feedback, "issues.timeSaved");

            } catch (ex) {

                this.showError(feedback, ex);

            } finally {

                sendBtn.disabled = false;

            }

        });

    }

    // Виды деятельности грузим один раз при первом открытии формы
    static async populateActivities(card, options){

        const select = card.querySelector(".issue-time-activity");

        if (select.dataset.loaded === "1" || !options.getActivities)
            return;

        select.dataset.loaded = "1";

        let list = [];

        try {
            list = await options.getActivities();
        } catch (ex) {
            select.dataset.loaded = "";
        }

        select.innerHTML = "";

        // Пустой вариант: Redmine сам подставит деятельность по умолчанию
        const empty = document.createElement("option");

        empty.value = "";
        empty.textContent = I18nService.t("issues.timeActivity");
        select.appendChild(empty);

        list.forEach(item => {

            const option = document.createElement("option");

            option.value = item.id;
            option.textContent = item.name;

            if (item.is_default)
                option.selected = true;

            select.appendChild(option);

        });

        if (select.dataset.pending) {

            select.value = select.dataset.pending;

            delete select.dataset.pending;

        }

    }

    static updateTimerUi(card, issueId, timers){

        const timeBtn = card.querySelector(".issue-time-btn");
        const timerBtn = card.querySelector(".issue-timer-btn");

        const running = !!timers && timers.isRunning(issueId);

        timeBtn.classList.toggle("running", running);
        timerBtn.classList.toggle("running", running);

        if (running) {

            const started = timers.startedAt(issueId);

            timerBtn.innerHTML =
                Icon.html("stop") +
                ' <span class="issue-timer-elapsed" data-start="' + started + '">' +
                TimeUtils.formatElapsed(Date.now() - started) +
                "</span>";

            timerBtn.title = I18nService.t("issues.timerStop");

            this.startTicker();

        } else {

            timerBtn.innerHTML = Icon.html("play");
            timerBtn.title = I18nService.t("issues.timerStart");

        }

    }

    // Один общий таймер на все карточки - обновляет бегущие секундомеры
    static startTicker(){

        if (this._ticker)
            return;

        this._ticker = setInterval(() => {

            document.querySelectorAll(".issue-timer-elapsed").forEach(el => {

                el.textContent = TimeUtils.formatElapsed(
                    Date.now() - Number(el.dataset.start)
                );

            });

        }, 1000);

    }

    // ----------------------------------------------------------------- правка полей

    static wireEditBox(card, issue, onUpdate){

        const editBtn = card.querySelector(".issue-edit-btn");
        const box = card.querySelector(".issue-edit-box");
        const due = card.querySelector(".issue-edit-due");
        const done = card.querySelector(".issue-edit-done");
        const saveBtn = card.querySelector(".issue-edit-save");
        const cancelBtn = card.querySelector(".issue-edit-cancel");
        const feedback = card.querySelector(".issue-action-feedback");

        box.addEventListener("click", event => event.stopPropagation());

        editBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            box.hidden = !box.hidden;

        });

        cancelBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            box.hidden = true;

            due.value = issue.due_date || "";
            done.value = String(issue.done_ratio || 0);

        });

        saveBtn.addEventListener("click", async (event) => {

            event.stopPropagation();

            const fields = {};

            if ((due.value || null) !== (issue.due_date || null))
                fields.due_date = due.value || null;

            if (Number(done.value) !== (issue.done_ratio || 0))
                fields.done_ratio = Number(done.value);

            if (Object.keys(fields).length === 0) {

                box.hidden = true;

                return;

            }

            saveBtn.disabled = true;
            this.clearFeedback(feedback);

            try {

                await onUpdate(issue, fields);

                box.hidden = true;

                this.showSuccess(feedback, "issues.saved");

            } catch (ex) {

                this.showError(feedback, ex);

            } finally {

                saveBtn.disabled = false;

            }

        });

    }

    static wireTake(card, issue, options){

        const takeBtn = card.querySelector(".issue-take-btn");
        const feedback = card.querySelector(".issue-action-feedback");

        takeBtn.addEventListener("click", async (event) => {

            event.stopPropagation();

            takeBtn.disabled = true;
            this.clearFeedback(feedback);

            try {

                await options.onUpdate(issue, { assigned_to_id: options.currentUserId });

                this.showSuccess(feedback, "issues.taken");

            } catch (ex) {

                this.showError(feedback, ex);

            } finally {

                takeBtn.disabled = false;

            }

        });

    }

    // ----------------------------------------------------------------- состояние при перерисовке

    // Карточки пересоздаются при каждой синхронизации. Чтобы не терять
    // недописанный комментарий и открытые формы, запоминаем их и возвращаем.
    static captureState(card){

        const q = selector => card.querySelector(selector);

        return {

            reply: {
                open: !q(".issue-reply-box").hidden,
                text: q(".issue-reply-text").value
            },

            time: {
                open: !q(".issue-time-box").hidden,
                hours: q(".issue-time-hours").value,
                comment: q(".issue-time-comment").value,
                activity: q(".issue-time-activity").value
            },

            edit: {
                open: !q(".issue-edit-box").hidden,
                due: q(".issue-edit-due").value,
                done: q(".issue-edit-done").value
            }

        };

    }

    static restoreState(card, state, options = {}){

        if (!state)
            return;

        const q = selector => card.querySelector(selector);

        if (state.reply.open || state.reply.text) {

            q(".issue-reply-box").hidden = !state.reply.open;
            q(".issue-reply-text").value = state.reply.text;

        }

        if (state.time.open || state.time.hours || state.time.comment) {

            q(".issue-time-box").hidden = !state.time.open;
            q(".issue-time-hours").value = state.time.hours;
            q(".issue-time-comment").value = state.time.comment;

            if (state.time.activity)
                q(".issue-time-activity").dataset.pending = state.time.activity;

            if (state.time.open)
                this.populateActivities(card, options);

        }

        if (state.edit.open) {

            q(".issue-edit-box").hidden = false;
            q(".issue-edit-due").value = state.edit.due;
            q(".issue-edit-done").value = state.edit.done;

        }

    }

    // Подсветка карточки (например, после клика по уведомлению)
    static flash(card){

        card.classList.add("flash");

        setTimeout(() => card.classList.remove("flash"), 2500);

    }

}

window.IssueRenderer = IssueRenderer;
