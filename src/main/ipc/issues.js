const { ipcMain } = require("electron");

const settings = require("../../storage/SettingsService");

const RedmineClient = require("../../api/RedmineClient");

const Logger = require("../../utils/Logger");

function registerIssuesIpc() {

    ipcMain.handle("issues:mine", async () => {

        Logger.info("Loading my issues");

        const client = new RedmineClient(

            settings.get("serverUrl"),

            settings.get("apiKey")

        );

        return await client.getMyIssues();

    });

}

module.exports = {

    registerIssuesIpc

};