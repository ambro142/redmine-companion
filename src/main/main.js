const { app } = require("electron");
const {Menu} = require("electron");
app.setAppUserModelId("Redmine Notifier")
const { createWindow } = require("./window");
const { registerSettingsIpc } = require("./ipc/settings");
const { registerRedmineIpc } = require("./ipc/redmine");
const Logger = require("../utils/Logger");
const { registerIssuesIpc } = require("./ipc/issues");
const { registerDashboardIpc } = require("./ipc/dashboard");
const { registerBrowserIpc } = require("./ipc/browser");
const {registerNotificationIpc} = require("./ipc/notifications");
const {registerCommentsIpc} = require("./ipc/comments");
const {registerHistoryIpc}=require("./ipc/history");
const TrayManager = require("./tray/TrayManager");
const { registerSystemIpc } = require("./ipc/SystemIpc");

app.whenReady().then(() => {
    
    Logger.info("Application started");
    registerSettingsIpc();
    registerRedmineIpc();
    registerIssuesIpc();
    registerDashboardIpc();
    registerBrowserIpc();
    registerNotificationIpc();
    registerCommentsIpc();
    registerHistoryIpc();
    registerSystemIpc();
    createWindow();
    Menu.setApplicationMenu(null);
});

app.on("window-all-closed", () => {

    if (process.platform !== "darwin")
        app.quit();

});

