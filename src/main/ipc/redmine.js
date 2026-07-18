const { ipcMain } = require("electron");

const settings = require("../../storage/SettingsService");

const RedmineClient = require("../../api/RedmineClient");

const Logger = require("../../utils/Logger");

function registerRedmineIpc() {

    ipcMain.handle("redmine:test", async () => {

        Logger.info("Testing connection");

        const client = new RedmineClient(

            settings.get("serverUrl"),

            settings.get("apiKey")

        );

        return await client.getCurrentUser();

    });
    
    ipcMain.handle("redmine:info", async () => {

       Logger.info("Loading Server info");

       const client = new RedmineClient(

           settings.get("serverUrl"),

           settings.get("apiKey")

       );

       return await client.getServerInfo();

    });
}

module.exports = {
    registerRedmineIpc
};