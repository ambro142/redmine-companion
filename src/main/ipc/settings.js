const { ipcMain, nativeTheme } = require("electron");
const settings = require("../../storage/SettingsService");
const Logger = require("../../utils/Logger");
const trayInstance = require("../tray/trayInstance");

function applyTheme(theme) {

    nativeTheme.themeSource =
        theme === "light" || theme === "dark" ? theme : "system";

}

function registerSettingsIpc() {

    ipcMain.handle("settings:load", () => {

        Logger.info("Loading settings");

        return settings.getAll();

    });

    ipcMain.handle("settings:save", (_, data) => {

        Logger.info("Saving settings");

        // В хранилище попадают только известные ключи (см. WRITABLE_KEYS).
        settings.setMany(data);

        // Меню трея зависит от языка и от состояния "Не беспокоить"
        if (data && ("language" in data || "dnd" in data)) {
            trayInstance.get()?.rebuild();
        }

        if (data && "theme" in data) {
            applyTheme(data.theme);
        }

        return true;

    });

}

module.exports = {
    registerSettingsIpc,
    applyTheme
};
