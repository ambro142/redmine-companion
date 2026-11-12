// Какие события пользователь хочет видеть в уведомлениях.
class NotificationPolicy {

    // type: "new" | "comment" | "status" | "assigned" | "priority" | "due"
    static allows(type, events) {

        // Нет настройки - уведомляем обо всём (как раньше).
        if (!events || typeof events !== "object")
            return true;

        return events[type] !== false;

    }

}

window.NotificationPolicy = NotificationPolicy;
