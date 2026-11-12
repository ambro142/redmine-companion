const { ipcMain } = require("electron");
const NotificationService = require("../../services/NotificationService");

function registerNotificationIpc() {

    ipcMain.handle(
        "notification:show",
        (_, title, body, issueId) => {

            return NotificationService.show(
                String(title || ""),
                String(body || ""),
                Number.isInteger(issueId) ? issueId : null
            );

        }
    );

}

module.exports = {
    registerNotificationIpc
};
