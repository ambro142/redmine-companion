const { Tray, Menu, app } = require("electron");
const path = require("path");

class TrayManager {

    constructor(window) {

        this.window = window;
        this.tray = null;

    }

    create() {

        this.tray = new Tray(

            path.join(__dirname, "../../assets/icon.png")

        );

        this.tray.setToolTip("Redmine Notifier");

        this.tray.on("double-click", () => {

            this.window.show();

            this.window.focus();

        });

        this.tray.setContextMenu(

            Menu.buildFromTemplate([
                
                {
                    label: "📂 Открыть",

                    click: () => {

                        this.window.show();

                        if (this.window.isMinimized())
                            this.window.restore();

                            this.window.focus();

                    }

                },

                {
                    label: "🔄 Синхронизировать сейчас",

                    click: () => {

                        this.window.webContents.send(

                            "tray:sync"

                        );

                    }

                },

                {
                    label: "❌ Выход",

                    click: () => {

                        this.window.isQuiting = true;

                          app.quit();

                    }
                },

            ])

        );

    }

}

module.exports = TrayManager;