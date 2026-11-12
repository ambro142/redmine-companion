// Цвета статусов и приоритетов. Название статуса зависит от языка Redmine и
// может быть любым, поэтому опираемся на данные из API (is_closed, порядок
// приоритетов), а названия используем только как запасной вариант.
class IssueMeta {

    static statusClass(status, statuses = []) {

        if (!status)
            return "status-default";

        const full = statuses.find(s => s.id === status.id);

        if (full && full.is_closed)
            return "status-closed";

        const name = String(status.name || "").toLowerCase();

        if (/(^|\s)(new|нов)/.test(name))
            return "status-new";

        if (/(progress|working|в работе|в\s?процессе|работ)/.test(name))
            return "status-progress";

        if (/(resolved|solved|done|решен|решён|готов|выполнен)/.test(name))
            return "status-solved";

        if (/(closed|rejected|закрыт|отклон)/.test(name))
            return "status-closed";

        return "status-default";

    }

    // Позиция приоритета в списке Redmine (0 = самый низкий). -1, если неизвестно.
    static priorityIndex(priority, priorities = []) {

        if (!priority)
            return -1;

        return priorities.findIndex(p => p.id === priority.id);

    }

    static priorityRank(priority, priorities = []) {

        const index = IssueMeta.priorityIndex(priority, priorities);

        return index >= 0 ? index : (priority?.id || 0);

    }

    static priorityClass(priority, priorities = []) {

        const index = IssueMeta.priorityIndex(priority, priorities);

        if (index >= 0 && priorities.length >= 2) {

            let defaultIndex = priorities.findIndex(p => p.is_default);

            if (defaultIndex < 0)
                defaultIndex = Math.floor((priorities.length - 1) / 2);

            const last = priorities.length - 1;

            if (index < defaultIndex)
                return "priority-low";

            if (index === defaultIndex)
                return "priority-normal";

            if (index === last)
                return "priority-urgent";

            return "priority-high";

        }

        const name = String(priority?.name || "").toLowerCase();

        if (/(low|низк)/.test(name))
            return "priority-low";

        if (/(urgent|immediate|срочн|немедлен)/.test(name))
            return "priority-urgent";

        if (/(high|высок)/.test(name))
            return "priority-high";

        return "priority-normal";

    }

}

window.IssueMeta = IssueMeta;
