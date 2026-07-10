class App {

    constructor() {

        this.serverUrl = document.getElementById("serverUrl");
        this.apiKey = document.getElementById("apiKey");

        this.saveBtn = document.getElementById("saveBtn");
        this.testBtn = document.getElementById("testBtn");

        this.status = document.getElementById("status");

        this.statusTimer = null;

    }

    async init() {

        await this.loadSettings();

        this.bindEvents();

        this.showStatus("Приложение готово");

    }

    bindEvents() {

        this.saveBtn.addEventListener("click", () => this.saveSettings());

        this.testBtn.addEventListener("click", () => this.testConnection());

    }

    async loadSettings() {

        try {

            const settings = await window.api.loadSettings();

            this.serverUrl.value = settings.serverUrl || "";

            this.apiKey.value = settings.apiKey || "";

        }
        catch (err) {

            this.showStatus("Ошибка загрузки настроек");

            console.error(err);

        }

    }

    async saveSettings() {

        try {

            await window.api.saveSettings({

                serverUrl: this.serverUrl.value.trim(),

                apiKey: this.apiKey.value.trim()

            });

            this.showStatus("✔ Настройки успешно сохранены", "success");

        }
        catch (err) {

            console.error(err);

            this.showStatus("Ошибка сохранения", "error");

        }

    }

    async testConnection() {

        this.showStatus("Проверяем подключение...", "info");

        try {

            const result = await window.api.testConnection();

            const user = result.user;

            this.showStatus(
                `✔ Подключение успешно. ${user.firstname} ${user.lastname}`,
                "success"
            );

        }
        catch (err) {

            console.error(err);

            this.showStatus(err.message, "error");

        }

    }

    showStatus(text, type = "info") {

        this.status.innerText = text;

        this.status.className = type;

        clearTimeout(this.statusTimer);

        this.statusTimer = setTimeout(() => {

            this.status.innerText = "";

            this.status.className = "";

        }, 4000);

    }

}

window.addEventListener("DOMContentLoaded", () => {

    const app = new App();

    app.init();

});