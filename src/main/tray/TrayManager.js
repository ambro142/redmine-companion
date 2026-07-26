const { Tray, Menu, app } = require("electron");
const path = require("path");
const { t } = require("../i18n");

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

        this.tray.setContextMenu(this.buildMenu());

    }

    buildMenu() {

        return Menu.buildFromTemplate([

            {
                label: t("tray.open"),

                click: () => {

                    this.window.show();

                    if (this.window.isMinimized())
                        this.window.restore();

                        this.window.focus();

                }

            },

            {
                label: t("tray.syncNow"),

                click: () => {

                    this.window.webContents.send(

                        "tray:sync"

                    );

                }

            },

            {
                label: t("tray.exit"),

                click: () => {

                    this.window.isQuiting = true;

                      app.quit();

                }
            },

        ]);

    }

    rebuild() {

        if (!this.tray)
            return;

        this.tray.setContextMenu(this.buildMenu());

    }

}

module.exports = TrayManager;
