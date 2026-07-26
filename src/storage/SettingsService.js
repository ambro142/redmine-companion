const Store = require('electron-store');

class SettingsService {
    constructor() {
        this.store = new Store({
            name: 'settings',
            clearInvalidConfig: true,
            defaults: {
                serverUrl: '',
                apiKey: '',
                language: 'ru',
                pollInterval: 60,
                minimizeToTray: true,
                startWithWindows: false,
                showClosed: false,
                startMinimized: false,
                historyInitialized: false,
            }
        });
    }

    get(key) {
        return this.store.get(key);
    }

    set(key, value) {
        this.store.set(key, value);
    }

    getAll() {
        return this.store.store;
    }
}
module.exports = new SettingsService();