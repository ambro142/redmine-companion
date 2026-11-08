const { Tray, Menu, app, nativeImage } = require("electron");
const path = require("path");
const { t } = require("../i18n");

// Иконки пунктов меню: assets/tray/<name>.png (16px) и <name>@2x.png (32px).
// Electron сам берёт @2x на экранах с масштабом.
function menuIcon(name) {

    return nativeImage.createFromPath(
        path.join(__dirname, "../../assets/tray", name + ".png")
    );

}

class TrayManager {

    constructor(window) {

        this.window = window;
        this.tray = null;

    }

    create() {

        this.tray = new Tray(

            path.join(__dirname, "../../assets/icon.png")

        );

        this.tray.setToolTip("Redmine Companion");

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
                icon: menuIcon("folder"),

                click: () => {

                    this.window.show();

                    if (this.window.isMinimized())
                        this.window.restore();

                        this.window.focus();

                }

            },

            {
                label: t("tray.syncNow"),
                icon: menuIcon("sync"),

                click: () => {

                    this.window.webContents.send(

                        "tray:sync"

                    );

                }

            },

            {
                label: t("tray.exit"),
                icon: menuIcon("close"),

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
