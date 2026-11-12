const { app } = require("electron");
const {Menu} = require("electron");
// Должен совпадать с appId в package.json - иначе Windows не привяжет уведомления к приложению
app.setAppUserModelId("com.redmine.companion")
const { createWindow, showMainWindow } = require("./window");
const { registerSettingsIpc, applyTheme } = require("./ipc/settings");
const { registerRedmineIpc } = require("./ipc/redmine");
const Logger = require("../utils/Logger");
const { registerDashboardIpc } = require("./ipc/dashboard");
const { registerBrowserIpc } = require("./ipc/browser");
const {registerNotificationIpc} = require("./ipc/notifications");
const {registerCommentsIpc} = require("./ipc/comments");
const {registerHistoryIpc}=require("./ipc/history");
const { registerIssuesIpc } = require("./ipc/issues");
const { registerProfilesIpc } = require("./ipc/profiles");
const { registerSystemIpc } = require("./ipc/SystemIpc");

// Приложение живёт в трее - второй запуск просто показывает уже открытое окно.
if (!app.requestSingleInstanceLock()) {

    app.quit();

} else {

    app.on("second-instance", () => {
        showMainWindow();
    });

    app.whenReady().then(() => {

        Logger.info("Application started");
        registerSettingsIpc();
        registerRedmineIpc();
        registerDashboardIpc();
        registerBrowserIpc();
        registerNotificationIpc();
        registerCommentsIpc();
        registerHistoryIpc();
        registerIssuesIpc();
        registerProfilesIpc();
        registerSystemIpc();

        applyTheme(require("../storage/SettingsService").get("theme"));

        createWindow();
        Menu.setApplicationMenu(null);

        initAutoUpdate();
    });

}

app.on("window-all-closed", () => {

    if (process.platform !== "darwin")
        app.quit();

});

// Автообновление через GitHub Releases (только в собранном приложении).
// Для portable-сборки оно не работает - нужен установщик NSIS / AppImage / dmg.
function initAutoUpdate() {

    if (!app.isPackaged)
        return;

    let autoUpdater;

    try {
        ({ autoUpdater } = require("electron-updater"));
    } catch (ex) {
        Logger.error("electron-updater is not installed", ex.message);
        return;
    }

    autoUpdater.on("error", (error) => {
        Logger.error("Auto update:", error && error.message);
    });

    const check = () => {
        autoUpdater.checkForUpdatesAndNotify().catch(() => {});
    };

    check();

    setInterval(check, 6 * 60 * 60 * 1000);

}
