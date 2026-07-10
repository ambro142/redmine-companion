const { BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {

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

}

module.exports = {
    createWindow
};