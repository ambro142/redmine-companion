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
        "issues.commentSent": "Комментарий отправлен",
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

        "status.connecting": "Проверяем подключение...",
        "status.connected": "Подключено",
        "status.connectedInfo": "Подключение установлено",
        "status.error": "Ошибка подключения",
        "status.settingsSaved": "Настройки сохранены",

        "notification.status": "Статус",
        "notification.assigned": "Исполнитель",
        "notification.due": "Срок",
        "notification.priority": "Приоритет",
        "notification.newIssue": "Новая задача",

        "tray.open": "Открыть",
        "tray.syncNow": "Синхронизировать сейчас",
        "tray.exit": "Выход",

        "tray.dnd": "Не беспокоить",

        "status.trayOk": "Назначено мне: {n}",
        "status.trayError": "Ошибка: {msg}",

        "error.NOT_CONFIGURED": "Укажите адрес Redmine и API-ключ в настройках",
        "error.AUTH": "Неверный API-ключ или доступ по REST API выключен",
        "error.FORBIDDEN": "Нет прав на это действие",
        "error.NOT_FOUND": "Не найдено: проверьте адрес Redmine",
        "error.RATE_LIMIT": "Слишком много запросов, попробуйте позже",
        "error.VALIDATION": "Redmine не принял изменения",
        "error.SERVER": "Ошибка сервера Redmine ({detail})",
        "error.HTTP": "Ответ сервера: {detail}",
        "error.TIMEOUT": "Сервер не отвечает (таймаут)",
        "error.NETWORK": "Сервер недоступен ({detail})",
        "error.CERT": "Проблема с сертификатом ({detail}). Включите доверие к самоподписанному сертификату в настройках, если это ваш сервер",
        "error.UNKNOWN": "Неизвестная ошибка: {detail}",

        "issues.time": "Время",
        "issues.timeHours": "Часы: 1.5 или 1:30",
        "issues.timeComment": "Комментарий к времени (необязательно)",
        "issues.timeActivity": "Деятельность",
        "issues.timeLog": "Списать",
        "issues.timeSaved": "Время записано",
        "issues.timeInvalid": "Введите время, например 1.5 или 1:30",
        "issues.timerStart": "Запустить таймер",
        "issues.timerStop": "Остановить таймер",
        "issues.take": "Взять себе",
        "issues.taken": "Задача назначена на вас",
        "issues.edit": "Изменить",
        "issues.due": "Срок",
        "issues.doneRatio": "Готовность",
        "issues.save": "Сохранить",
        "issues.saved": "Сохранено",
        "issues.allProjects": "Все проекты",
        "issues.allTrackers": "Все трекеры",
        "issues.allStatuses": "Все статусы",
        "issues.resetFilters": "Сбросить",

        "settings.profile": "Профиль (сервер Redmine)",
        "settings.profileName": "Название профиля",
        "settings.profileNew": "Новый профиль",
        "settings.profileRemove": "Удалить профиль",
        "settings.profileRemoveConfirm": "Удалить профиль «{name}»?",
        "settings.profileDefaultName": "Redmine {n}",
        "settings.allowSelfSigned": "Доверять самоподписанному сертификату",
        "settings.proxy": "Прокси (необязательно)",
        "settings.proxyPlaceholder": "http://host:3128",
        "settings.maxIssues": "Максимум задач в списке",
        "settings.theme": "Тема оформления",
        "settings.themeSystem": "Как в системе",
        "settings.themeLight": "Светлая",
        "settings.themeDark": "Тёмная",
        "settings.notifications": "Уведомления",
        "settings.dnd": "Не беспокоить (без всплывающих окон)",
        "settings.quietHours": "Тихие часы",
        "settings.quietFrom": "с",
        "settings.quietTo": "до",
        "settings.events": "О чём уведомлять",
        "settings.eventNew": "Новые задачи",
        "settings.eventComment": "Комментарии",
        "settings.eventStatus": "Смена статуса",
        "settings.eventAssigned": "Смена исполнителя",
        "settings.eventPriority": "Смена приоритета",
        "settings.eventDue": "Смена срока",
        "settings.version": "Версия",

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
