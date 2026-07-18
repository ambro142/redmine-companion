const { app, ipcMain } = require("electron");

function registerSystemIpc() {

    ipcMain.handle(

        "app:setLoginItemSettings",

        (_, enabled) => {

            app.setLoginItemSettings({

                openAtLogin: enabled

            });

        }

    );

}

module.exports = {

    registerSystemIpc

};