const { app, ipcMain } = require("electron");
const trayInstance = require("../tray/trayInstance");

function registerSystemIpc() {

    ipcMain.handle(
        "app:setLoginItemSettings",
        (_, enabled) => {

            // На Linux автозапуск через Electron не поддерживается.
            if (process.platform === "linux")
                return;

            app.setLoginItemSettings({
                openAtLogin: !!enabled
            });

        }
    );

    ipcMain.handle("app:version", () => app.getVersion());

    // Подсказка у иконки в трее: сколько задач / есть ли ошибка.
    ipcMain.handle("tray:status", (_, text) => {

        trayInstance.get()?.setStatus(String(text || ""));

    });

}

module.exports = {

    registerSystemIpc

};
