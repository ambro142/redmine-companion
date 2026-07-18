const { ipcMain } = require("electron");
const settings = require("../../storage/SettingsService");
const RedmineClient = require("../../api/RedmineClient");
const Logger = require("../../utils/Logger");

function registerDashboardIpc() {

    ipcMain.handle("dashboard:load", async () => {

        Logger.info("Loading dashboard");

        const client = new RedmineClient(
            settings.get("serverUrl"),
            settings.get("apiKey")
        );

        return await client.getDashboard();

    });

}

module.exports = {
    registerDashboardIpc
};