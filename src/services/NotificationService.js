const { Notification } = require("electron");
const path = require("path");
const settings = require("../storage/SettingsService");
const { isQuietNow } = require("../utils/QuietHours");

const APP_ICON = path.join(__dirname, "../assets/icon.png");

// Держим ссылки, иначе Windows может "съесть" уведомление до клика.
const active = new Set();

class NotificationService {

    // Возвращает true, если уведомление показано.
    static show(title, body, issueId = null) {

        if (!Notification.isSupported()) {
            console.log("Notifications are not supported");
            return false;
        }

        // Тихие часы / "Не беспокоить": запись в журнал остаётся, звука и всплывашки нет.
        if (isQuietNow({
            dnd: settings.get("dnd"),
            quietEnabled: settings.get("quietEnabled"),
            quietFrom: settings.get("quietFrom"),
            quietTo: settings.get("quietTo")
        }))
            return false;

        const notification = new Notification({

            title,
            body,
            icon: APP_ICON

        });

        notification.on("click", () => {

            // require внутри, чтобы не получить циклическую зависимость при старте
            const { showMainWindow } = require("../main/window");

            const win = showMainWindow();

            if (win && issueId)
                win.webContents.send("notification:open", issueId);

        });

        notification.on("close", () => active.delete(notification));

        active.add(notification);

        notification.show();

        return true;

    }

}

module.exports = NotificationService;
