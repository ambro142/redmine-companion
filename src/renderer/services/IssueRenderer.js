class IssueRenderer {

    static getStatusColor(status){

        switch(status){

            case "Новая":
                return "#4caf50";

            case "В работе":
                return "#2196f3";

            case "Решена":
                return "#ff9800";

            case "Закрыта":
                return "#9e9e9e";

            default:
                return "#607d8b";

        }

    }

    static create(issue, options = {}){

        const statuses = options.statuses || [];
        const onStatusChange = options.onStatusChange || (() => {});
        const onComment = options.onComment || (() => {});

        const card = document.createElement("div");

        card.className = "issue-card";

        const assigned =
            issue.assigned_to
                ? issue.assigned_to.name
                : I18nService.t("common.unassigned");

        const due =
            issue.due_date
                ? issue.due_date
                : I18nService.t("common.noDueDate");

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

                <select class="status-tag issue-status-select ${this.getStatusClass(issue.status.name)}"></select>

                <span class="priority-tag ${this.getPriorityClass(issue.priority.name)}">

                    ${HtmlUtils.escape(I18nService.priority(issue.priority.name))}

                </span>

            </div>

            <div class="issue-actions">

                <button type="button" class="issue-reply-btn">

                    ${Icon.html("chat")} ${HtmlUtils.escape(I18nService.t("issues.reply"))}

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

            <div class="issue-action-feedback"></div>

        `;

        this.populateStatusSelect(card, issue, statuses);
        this.wireStatusSelect(card, issue, onStatusChange);
        this.wireReplyBox(card, issue, onComment);

        card.addEventListener("click", (event) => {

            if (event.target.closest(".issue-status-select, .issue-actions, .issue-reply-box"))
                return;

            window.api.openIssue(issue.id);

        });

        return card;

    }

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

    static wireStatusSelect(card, issue, onStatusChange){

        const select = card.querySelector(".issue-status-select");
        const feedback = card.querySelector(".issue-action-feedback");

        select.addEventListener("click", event => event.stopPropagation());

        select.addEventListener("change", async () => {

            const previousStatusId = issue.status.id;
            const newStatusId = Number(select.value);

            select.disabled = true;
            feedback.textContent = "";
            feedback.className = "issue-action-feedback";

            try {

                await onStatusChange(issue, newStatusId);

            } catch (ex) {

                select.value = String(previousStatusId);
                feedback.textContent = I18nService.t("issues.actionError") + ": " + ex.message;
                feedback.className = "issue-action-feedback error";

            } finally {

                select.disabled = false;

            }

        });

    }

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
            feedback.textContent = "";
            feedback.className = "issue-action-feedback";

            try {

                await onComment(issue, text);

                replyText.value = "";
                replyBox.hidden = true;

                feedback.textContent = I18nService.t("issues.commentSent");
                feedback.className = "issue-action-feedback success";

                setTimeout(() => {

                    feedback.textContent = "";
                    feedback.className = "issue-action-feedback";

                }, 4000);

            } catch (ex) {

                feedback.textContent = I18nService.t("issues.actionError") + ": " + ex.message;
                feedback.className = "issue-action-feedback error";

            } finally {

                sendBtn.disabled = false;

            }

        });

    }

    static getStatusClass(status){

        switch(status){

            case "Новая":
                return "status-new";

            case "В работе":
                return "status-progress";

            case "Решена":
                return "status-solved";

            case "Закрыта":
                return "status-closed";

            default:
                return "status-default";

        }

    }

    static getPriorityClass(priority){

        switch(priority){

            case "Низкий":
                return "priority-low";

            case "Нормальный":
                return "priority-normal";

            case "Высокий":
                return "priority-high";

            case "Срочно":
                return "priority-urgent";

            default:
                return "priority-normal";

        }

    }
}

window.IssueRenderer = IssueRenderer;
