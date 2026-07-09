const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({

        width: 1000,

        height: 700,

        title: "Redmine Notifier 2",

        webPreferences: {

            nodeIntegration: true,

            contextIsolation: false

        }

    });

    mainWindow.loadFile(path.join(__dirname,"../renderer/index.html"));

}

app.whenReady().then(createWindow);