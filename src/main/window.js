const { BrowserWindow, shell } = require("electron");
const path = require("path");
const TrayManager = require("./tray/TrayManager");
const trayInstance = require("./tray/trayInstance");
let mainWindow = null;

function createWindow() {
    const settings = require("../storage/SettingsService");
    const startMinimized = !!settings.get("startMinimized");

    mainWindow = new BrowserWindow({

        width: 1100,

        height: 700,

        minWidth: 900,

        minHeight: 600,

        title: "Redmine Companion",

        icon: path.join(__dirname, "../assets/icon.png"),

        show: !startMinimized,

        webPreferences: {

             preload: path.join(__dirname,"preload.js"),

             contextIsolation:true,

             nodeIntegration:false,

             sandbox:true,

             backgroundThrottling:false

        }

    });

    mainWindow.loadFile(
        path.join(__dirname, "../renderer/index.html")
    );

    // Окно приложения не должно открывать чужие страницы внутри себя:
    // внешние ссылки уходят в браузер, всё остальное блокируется.
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {

        if (/^https?:\/\//i.test(url))
            shell.openExternal(url);

        return { action: "deny" };

    });

    mainWindow.webContents.on("will-navigate", (event, url) => {

        if (!url.startsWith("file://"))
            event.preventDefault();

    });

    const tray = new TrayManager(mainWindow);
    tray.create();
    trayInstance.set(tray);

    mainWindow.on("close", (event) => {

        if (mainWindow.isQuiting || !settings.get("minimizeToTray"))
            return;

        event.preventDefault();

        mainWindow.hide();

    });

    return mainWindow;
}

function getMainWindow() {

    return mainWindow;

}

function showMainWindow() {

    if (!mainWindow)
        return null;

    if (mainWindow.isMinimized())
        mainWindow.restore();

    mainWindow.show();
    mainWindow.focus();

    return mainWindow;

}

module.exports = {
    createWindow,
    getMainWindow,
    showMainWindow
};
