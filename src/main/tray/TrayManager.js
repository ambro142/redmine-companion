const { Tray, Menu, app, nativeImage } = require("electron");
const path = require("path");
const { t } = require("../i18n");
const settings = require("../../storage/SettingsService");

const TRAY_DIR = path.join(__dirname, "../../assets/tray");

// Иконки: assets/tray/<name>.png (16px) и <name>@2x.png (32px).
// Electron сам берёт @2x на экранах с масштабом.
function trayImage(name) {

    return nativeImage.createFromPath(path.join(TRAY_DIR, name + ".png"));

}

class TrayManager {

    constructor(window) {

        this.window = window;
        this.tray = null;
        this.statusText = "";

    }

    create() {

        this.tray = new Tray(trayImage("app"));

        this.updateTooltip();

        const open = () => {

            if (this.window.isMinimized())
                this.window.restore();

            this.window.show();

            this.window.focus();

        };

        this.tray.on("click", open);
        this.tray.on("double-click", open);

        this.tray.setContextMenu(this.buildMenu());

    }

    updateTooltip() {

        if (!this.tray)
            return;

        this.tray.setToolTip(
            this.statusText
                ? "Redmine Companion\n" + this.statusText
                : "Redmine Companion"
        );

    }

    setStatus(text) {

        this.statusText = text;

        this.updateTooltip();

    }

    buildMenu() {

        return Menu.buildFromTemplate([

            {
                label: t("tray.open"),

                icon: trayImage("folder"),

                click: () => {

                    if (this.window.isMinimized())
                        this.window.restore();

                    this.window.show();

                    this.window.focus();

                }

            },

            {
                label: t("tray.syncNow"),

                icon: trayImage("sync"),

                click: () => {

                    this.window.webContents.send("tray:sync");

                }

            },

            {
                label: t("tray.dnd"),

                type: "checkbox",

                checked: !!settings.get("dnd"),

                click: (item) => {

                    settings.set("dnd", item.checked);

                    // Окно должно знать, что галочка поменялась
                    this.window.webContents.send(
                        "settings:changed",
                        { dnd: item.checked }
                    );

                }

            },

            { type: "separator" },

            {
                label: t("tray.exit"),

                icon: trayImage("close"),

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
