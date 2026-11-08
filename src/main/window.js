const { BrowserWindow } = require("electron");
const path = require("path");
const TrayManager = require("./tray/TrayManager");
const trayInstance = require("./tray/trayInstance");
let isQuiting = false;
let mainWindow;

function createWindow() {
    const settings = require("../storage/SettingsService");
    mainWindow = new BrowserWindow({

        width: 1100,

        height: 700,

        minWidth: 900,

        minHeight: 600,

        title: "Redmine Companion",

        icon: path.join(__dirname, "../assets/icon.png"),

        webPreferences: {

             preload: path.join(__dirname,"preload.js"),

             contextIsolation:true,

             nodeIntegration:false,

             backgroundThrottling:false

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
    trayInstance.set(tray);
    
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