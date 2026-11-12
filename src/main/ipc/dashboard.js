const { ipcMain } = require("electron");
const { createClient } = require("../clientFactory");
const Logger = require("../../utils/Logger");

function registerDashboardIpc() {

    ipcMain.handle("dashboard:load", async () => {

        Logger.info("Loading dashboard");

        return await createClient().getDashboard();

    });

}

module.exports = {
    registerDashboardIpc
};
