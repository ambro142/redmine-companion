const { Notification } = require("electron");
const path = require("path");

const APP_ICON = path.join(__dirname, "../assets/icon.png");

class NotificationService {

    static show(title, body) {

        if (!Notification.isSupported()) {
            console.log("Notifications are not supported");
            return;
        }

        const notification = new Notification({

            title,
            body,
            icon: APP_ICON

        });

        notification.show();

    }

}

module.exports = NotificationService;