const { Notification } = require("electron");

class NotificationService {

    static show(title, body) {

        if (!Notification.isSupported()) {
            console.log("Notifications are not supported");
            return;
        }

        const notification = new Notification({

            title,
            body

        });

        notification.show();

    }

}

module.exports = NotificationService;