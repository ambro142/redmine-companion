const { ipcMain } = require("electron");
const settings = require("../../storage/SettingsService");
const Logger = require("../../utils/Logger");
function registerSettingsIpc() {

    ipcMain.handle("settings:load", () => {

        Logger.info("Loading settings");

        return settings.getAll();

    });

    ipcMain.handle("settings:save", (_, data) => {

        Logger.info("Saving settings");

        for (const key in data) {

            settings.set(key, data[key]);

        }

        return true;

    });

}

module.exports = {
    registerSettingsIpc
};