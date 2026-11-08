class NotificationBuilder {

    // Возвращает:
    //   title - заголовок системного уведомления
    //   body  - обычный текст для системного уведомления (там иконки невозможны)
    //   items - те же строки со ссылкой на иконку, ими пользуется журнал в окне приложения
    static build(issue, changes, journal) {

        const title =
            "[" + issue.project.name + "] #" +
            issue.id +
            " " +
            issue.subject;

        const items = [];

        const add = (icon, text) => items.push({ icon, text });

        if (journal && journal.notes && journal.notes.trim() !== "") {

            add("chat", journal.user.name + ": " + journal.notes);

        }

        for (const change of changes) {

            switch (change.type) {

                case "new":

                    add("add", I18nService.t("notification.newIssue"));

                break;

                case "status":

                    add(
                        "sync",
                        I18nService.t("notification.status") + ": " +
                        I18nService.status(change.oldValue) +
                        " → " +
                        I18nService.status(change.newValue)
                    );

                break;

                case "assigned":

                    add(
                        "person",
                        I18nService.t("notification.assigned") + ": " +
                        change.newValue
                    );

                break;

                case "due":

                    add(
                        "calendar",
                        I18nService.t("notification.due") + ": " +
                        (change.newValue || I18nService.t("common.notSet"))
                    );

                break;

                case "priority":

                    add(
                        "flag",
                        I18nService.t("notification.priority") + ": " +
                        I18nService.priority(change.oldValue) +
                        " → " +
                        I18nService.priority(change.newValue)
                    );

                break;

            }

        }

        return {

            title,

            body: items.map(item => item.text).join("\n").trim(),

            items

        };

    }

}
