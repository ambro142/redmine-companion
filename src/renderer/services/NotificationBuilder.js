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

                    lines.push("🆕 Новая задача");
                break;

                case "status":

                    lines.push(
                        "🔄" +
                        change.oldValue +
                        " → " +
                        change.newValue
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
                        (change.newValue || "Не указан")
                    );

                break;

                case "priority":

                    lines.push(
                        "⚡"+
                        change.oldValue +
                        " → " +
                        change.newValue
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