const Store = require("electron-store");
const settings = require("./SettingsService");

// История изменений хранится отдельно для каждого профиля (сервера),
// чтобы номера задач с разных серверов не перемешивались.
// Профиль "default" сохраняет прежнее имя файла history.json.

class HistoryStorage {

    constructor() {

        this.stores = new Map();

    }

    _store() {

        const id = settings.getActiveProfileId() || "default";

        if (!this.stores.has(id)) {

            this.stores.set(id, new Store({
                name: id === "default" ? "history" : "history-" + id,
                clearInvalidConfig: true
            }));

        }

        return this.stores.get(id);

    }

    get(issueId) {

        return this._store().get(String(issueId));

    }

    set(issueId, data) {

        this._store().set(String(issueId), data);

    }

    clear() {

        this._store().clear();

    }

}

module.exports = new HistoryStorage();
