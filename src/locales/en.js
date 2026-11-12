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

        "tray.dnd": "Do not disturb",

        "status.trayOk": "Assigned to me: {n}",
        "status.trayError": "Error: {msg}",

        "error.NOT_CONFIGURED": "Set the Redmine address and API key in settings",
        "error.AUTH": "Invalid API key, or the REST API is disabled",
        "error.FORBIDDEN": "You do not have permission for this action",
        "error.NOT_FOUND": "Not found: check the Redmine address",
        "error.RATE_LIMIT": "Too many requests, try again later",
        "error.VALIDATION": "Redmine rejected the changes",
        "error.SERVER": "Redmine server error ({detail})",
        "error.HTTP": "Server response: {detail}",
        "error.TIMEOUT": "The server is not responding (timeout)",
        "error.NETWORK": "Server unreachable ({detail})",
        "error.CERT": "Certificate problem ({detail}). If this is your own server, enable trusting self-signed certificates in settings",
        "error.UNKNOWN": "Unknown error: {detail}",

        "issues.time": "Time",
        "issues.timeHours": "Hours: 1.5 or 1:30",
        "issues.timeComment": "Time entry comment (optional)",
        "issues.timeActivity": "Activity",
        "issues.timeLog": "Log time",
        "issues.timeSaved": "Time logged",
        "issues.timeInvalid": "Enter time, e.g. 1.5 or 1:30",
        "issues.timerStart": "Start timer",
        "issues.timerStop": "Stop timer",
        "issues.take": "Assign to me",
        "issues.taken": "Issue assigned to you",
        "issues.edit": "Edit",
        "issues.due": "Due date",
        "issues.doneRatio": "Done",
        "issues.save": "Save",
        "issues.saved": "Saved",
        "issues.allProjects": "All projects",
        "issues.allTrackers": "All trackers",
        "issues.allStatuses": "All statuses",
        "issues.resetFilters": "Reset",

        "settings.profile": "Profile (Redmine server)",
        "settings.profileName": "Profile name",
        "settings.profileNew": "New profile",
        "settings.profileRemove": "Delete profile",
        "settings.profileRemoveConfirm": "Delete profile \"{name}\"?",
        "settings.profileDefaultName": "Redmine {n}",
        "settings.allowSelfSigned": "Trust self-signed certificate",
        "settings.proxy": "Proxy (optional)",
        "settings.proxyPlaceholder": "http://host:3128",
        "settings.maxIssues": "Maximum issues in lists",
        "settings.theme": "Theme",
        "settings.themeSystem": "Follow system",
        "settings.themeLight": "Light",
        "settings.themeDark": "Dark",
        "settings.notifications": "Notifications",
        "settings.dnd": "Do not disturb (no pop-ups)",
        "settings.quietHours": "Quiet hours",
        "settings.quietFrom": "from",
        "settings.quietTo": "to",
        "settings.events": "Notify about",
        "settings.eventNew": "New issues",
        "settings.eventComment": "Comments",
        "settings.eventStatus": "Status changes",
        "settings.eventAssigned": "Assignee changes",
        "settings.eventPriority": "Priority changes",
        "settings.eventDue": "Due date changes",
        "settings.version": "Version",

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
