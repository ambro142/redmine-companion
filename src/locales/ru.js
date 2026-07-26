(function () {

    const RU = {

        "app.title": "Redmine Companion",

        "header.lastSync": "Последняя синхронизация:",
        "header.lastSyncValue": "Последняя синхронизация: {value}",

        "tabs.overview": "Обзор",
        "tabs.issues": "Мои задачи",
        "tabs.journal": "Журнал",
        "tabs.settings": "Настройки",

        "dashboard.assigned": "Назначено",
        "dashboard.authored": "Создано",
        "dashboard.watched": "Под наблюдением",
        "dashboard.total": "Всего",

        "issues.filterActive": "Активные",
        "issues.filterAll": "Все",
        "issues.assignedToMe": "Назначены мне",
        "issues.createdByMe": "Созданы мной",
        "issues.watched": "Под наблюдением",

        "issues.reply": "Ответить",
        "issues.commentPlaceholder": "Комментарий...",
        "issues.send": "Отправить",
        "issues.cancel": "Отмена",
        "issues.commentSent": "✔ Комментарий отправлен",
        "issues.actionError": "Ошибка",

        "issues.searchPlaceholder": "Поиск по задачам...",
        "issues.sortUpdated": "По дате обновления",
        "issues.sortPriority": "По приоритету",
        "issues.sortDue": "По сроку",
        "issues.sortIdDesc": "По номеру (убыв.)",
        "issues.sortIdAsc": "По номеру (возр.)",

        "journal.title": "Журнал",
        "journal.clearTooltip": "Очистить журнал",

        "settings.serverUrl": "Адрес Redmine",
        "settings.serverUrlPlaceholder": "https://redmine.company.ru",
        "settings.apiKey": "API Key",
        "settings.apiKeyPlaceholder": "Ваш API Key",
        "settings.save": "Сохранить",
        "settings.sync": "Синхронизировать",
        "settings.pollInterval": "Синхронизация",
        "settings.interval30": "30 секунд",
        "settings.interval60": "1 минута",
        "settings.interval120": "2 минуты",
        "settings.interval300": "5 минут",
        "settings.interval600": "10 минут",
        "settings.startWithWindows": "Запускать вместе с Windows",
        "settings.startMinimized": "Запускать свернутым",

        "common.unassigned": "Не назначен",
        "common.noDueDate": "Без срока",
        "common.noProject": "Без проекта",
        "common.notSet": "Не указан",
        "common.noData": "Нет данных",

        "status.connecting": "⏳ Проверяем подключение...",
        "status.connected": "🟢 Подключено",
        "status.connectedInfo": "Подключение установлено",
        "status.error": "🔴 Ошибка подключения",
        "status.settingsSaved": "💾 Настройки сохранены",

        "notification.newIssue": "🆕 Новая задача",

        "tray.open": "📂 Открыть",
        "tray.syncNow": "🔄 Синхронизировать сейчас",
        "tray.exit": "❌ Выход",

        "statusNames": {
            "Новая": "Новая",
            "В работе": "В работе",
            "Решена": "Решена",
            "Закрыта": "Закрыта"
        },

        "priorityNames": {
            "Низкий": "Низкий",
            "Нормальный": "Нормальный",
            "Высокий": "Высокий",
            "Срочно": "Срочно"
        }

    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = RU;
    } else {
        window.LOCALE_RU = RU;
    }

})();
