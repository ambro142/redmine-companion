const { ipcMain } = require("electron");
const { createClient } = require("../clientFactory");
const Logger = require("../../utils/Logger");

function registerRedmineIpc() {

    ipcMain.handle("redmine:test", async () => {

        Logger.info("Testing connection");

        return await createClient().getCurrentUser();

    });

    ipcMain.handle("redmine:info", async () => {

        Logger.info("Loading Server info");

        return await createClient().getServerInfo();

    });

}

module.exports = {
    registerRedmineIpc
};
