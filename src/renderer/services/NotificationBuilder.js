class NotificationBuilder {

    static build(issue, changes, journal) {

        const title =
            "[" + issue.project.name + "] #" +
            issue.id +
            " " +
            issue.subject;

        const lines = [];

        if (journal && journal.notes && journal.notes.trim() !== "") {

            lines.push("💬 " + journal.user.name + ": " +
            journal.notes);
        
        }

        for (const change of changes) {

            switch (change.type) {

                case "new":

                    lines.push(I18nService.t("notification.newIssue"));
                break;

                case "status":

                    lines.push(
                        "🔄" +
                        I18nService.status(change.oldValue) +
                        " → " +
                        I18nService.status(change.newValue)
                    );

                break;

                case "assigned":

                    lines.push(
                        "👤"+
                        change.newValue
                    );

                break;

                case "due":

                    lines.push(
                        "📅"+
                        (change.newValue || I18nService.t("common.notSet"))
                    );

                break;

                case "priority":

                    lines.push(
                        "⚡"+
                        I18nService.priority(change.oldValue) +
                        " → " +
                        I18nService.priority(change.newValue)
                    );

                break;

            }

            lines.push("");

        }

        return {

            title,

            body: lines.join("\n").trim()

        };

    }

}