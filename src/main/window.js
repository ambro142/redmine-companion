const { BrowserWindow } = require("electron");
const path = require("path");
const TrayManager = require("./tray/TrayManager");
let isQuiting = false;
let mainWindow;

function createWindow() {
    const settings = require("../storage/SettingsService");
    mainWindow = new BrowserWindow({

        width: 1100,

        height: 700,

        minWidth: 900,

        minHeight: 600,

        title: "Redmine Notifier 2",

        webPreferences: {

             preload: path.join(__dirname,"preload.js"),

             contextIsolation:true,

             nodeIntegration:false

        }

    });

    mainWindow.loadFile(
        path.join(__dirname, "../renderer/index.html")
    );
    
    if (
        settings.get("startMinimized")
    ) {
        mainWindow.hide();

    }

    const tray = new TrayManager(mainWindow);
    tray.create();
    
    mainWindow.on("close", (event) => {

        if (mainWindow.isQuiting)
            return;

        event.preventDefault();

        mainWindow.hide();

    });
}

module.exports = {
    createWindow
};