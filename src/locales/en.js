(function () {

    const EN = {

        "app.title": "Redmine Companion",

        "header.lastSync": "Last sync:",
        "header.lastSyncValue": "Last sync: {value}",

        "tabs.overview": "Overview",
        "tabs.issues": "My Issues",
        "tabs.journal": "Journal",
        "tabs.settings": "Settings",

        "dashboard.assigned": "Assigned",
        "dashboard.authored": "Created",
        "dashboard.watched": "Watched",
        "dashboard.total": "Total",

        "issues.filterActive": "Active",
        "issues.filterAll": "All",
        "issues.assignedToMe": "Assigned to me",
        "issues.createdByMe": "Created by me",
        "issues.watched": "Watched",

        "issues.reply": "Reply",
        "issues.commentPlaceholder": "Comment...",
        "issues.send": "Send",
        "issues.cancel": "Cancel",
        "issues.commentSent": "Comment sent",
        "issues.actionError": "Error",

        "issues.searchPlaceholder": "Search issues...",
        "issues.sortUpdated": "By last update",
        "issues.sortPriority": "By priority",
        "issues.sortDue": "By due date",
        "issues.sortIdDesc": "By ID (desc.)",
        "issues.sortIdAsc": "By ID (asc.)",

        "journal.title": "Journal",
        "journal.clearTooltip": "Clear journal",

        "settings.serverUrl": "Redmine address",
        "settings.serverUrlPlaceholder": "https://redmine.company.com",
        "settings.apiKey": "API Key",
        "settings.apiKeyPlaceholder": "Your API Key",
        "settings.save": "Save",
        "settings.sync": "Sync now",
        "settings.pollInterval": "Sync interval",
        "settings.interval30": "30 seconds",
        "settings.interval60": "1 minute",
        "settings.interval120": "2 minutes",
        "settings.interval300": "5 minutes",
        "settings.interval600": "10 minutes",
        "settings.startWithWindows": "Launch with Windows",
        "settings.startMinimized": "Launch minimized",

        "common.unassigned": "Unassigned",
        "common.noDueDate": "No due date",
        "common.noProject": "No project",
        "common.notSet": "Not set",
        "common.noData": "No data",

        "status.connecting": "Checking connection...",
        "status.connected": "Connected",
        "status.connectedInfo": "Connection established",
        "status.error": "Connection error",
        "status.settingsSaved": "Settings saved",

        "notification.status": "Status",
        "notification.assigned": "Assignee",
        "notification.due": "Due date",
        "notification.priority": "Priority",
        "notification.newIssue": "New issue",

        "tray.open": "Open",
        "tray.syncNow": "Sync now",
        "tray.exit": "Exit",

        "statusNames": {
            "Новая": "New",
            "В работе": "In Progress",
            "Решена": "Resolved",
            "Закрыта": "Closed"
        },

        "priorityNames": {
            "Низкий": "Low",
            "Нормальный": "Normal",
            "Высокий": "High",
            "Срочно": "Urgent"
        }

    };

    if (typeof module !== "undefined" && module.exports) {
        module.exports = EN;
    } else {
        window.LOCALE_EN = EN;
    }

})();
