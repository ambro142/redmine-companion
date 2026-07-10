const { app } = require("electron");
const { createWindow } = require("./window");
const settings = require("../storage/SettingsService");
const { ipcMain } = require("electron");
const RedmineClient=require("../api/RedmineClient");
app.whenReady().then(() => {
    console.log(settings.getAll());
    createWindow();

});

app.on("window-all-closed", () => {

    if (process.platform !== "darwin")
        app.quit();

});

ipcMain.handle("settings:load", () => {

    return settings.getAll();

});

ipcMain.handle("settings:save", (_, data) => {

    for (const key in data){

        settings.set(key,data[key]);

    }

    return true;

});

ipcMain.handle("redmine:test", async () => {

    const client = new RedmineClient(

        settings.get("serverUrl"),

        settings.get("apiKey")

    );

    return await client.testConnection();

});