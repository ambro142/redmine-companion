const { ipcMain } = require("electron");
const settings = require("../../storage/SettingsService");

const isString = v => typeof v === "string" && v.length > 0 && v.length < 100;

function registerProfilesIpc() {

    ipcMain.handle("profiles:add", (_, name) => {

        settings.addProfile(isString(name) ? name : "Redmine");

        return settings.getAll();

    });

    ipcMain.handle("profiles:switch", (_, id) => {

        if (!isString(id))
            throw new Error("Invalid profile");

        settings.switchProfile(id);

        return settings.getAll();

    });

    ipcMain.handle("profiles:rename", (_, id, name) => {

        if (!isString(id) || !isString(name))
            throw new Error("Invalid profile");

        settings.renameProfile(id, name);

        return settings.getAll();

    });

    ipcMain.handle("profiles:remove", (_, id) => {

        if (!isString(id))
            throw new Error("Invalid profile");

        settings.removeProfile(id);

        return settings.getAll();

    });

}

module.exports = {
    registerProfilesIpc
};
