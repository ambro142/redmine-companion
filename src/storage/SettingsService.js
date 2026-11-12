const Store = require("electron-store");

// safeStorage есть только внутри Electron (после app.ready). В тестах его нет.
let safeStorage = null;

try {
    safeStorage = require("electron").safeStorage || null;
} catch (ex) {
    safeStorage = null;
}

// Эти ключи относятся к конкретному серверу Redmine (профилю).
const PROFILE_KEYS = [
    "serverUrl",
    "apiKey",
    "historyInitialized",
    "allowSelfSigned",
    "proxyUrl"
];

const DEFAULT_NOTIFY_EVENTS = {
    new: true,
    comment: true,
    status: true,
    assigned: true,
    priority: true,
    due: true
};

const GLOBAL_DEFAULTS = {
    language: "ru",
    theme: "system",
    pollInterval: 60,
    maxIssues: 500,
    minimizeToTray: true,
    startWithWindows: false,
    showClosed: false,
    startMinimized: false,
    dnd: false,
    quietEnabled: false,
    quietFrom: "22:00",
    quietTo: "08:00",
    notifyEvents: DEFAULT_NOTIFY_EVENTS
};

// Что разрешено менять из окна приложения (renderer).
const WRITABLE_KEYS = new Set([
    ...Object.keys(GLOBAL_DEFAULTS),
    ...PROFILE_KEYS
]);

const DEFAULT_PROFILE_ID = "default";

function emptyProfile(id, name) {

    return {
        id,
        name,
        serverUrl: "",
        apiKey: "",
        historyInitialized: false,
        allowSelfSigned: false,
        proxyUrl: ""
    };

}

class SettingsService {

    constructor() {

        this.store = new Store({
            name: "settings",
            clearInvalidConfig: true,
            defaults: {
                ...GLOBAL_DEFAULTS,
                profiles: [],
                activeProfileId: null
            }
        });

        this._migrate();

    }

    // ---------------------------------------------------------- миграция

    // Раньше serverUrl/apiKey лежали в корне settings.json.
    // Теперь они живут внутри профиля, а старые значения переносятся в профиль "default".
    _migrate() {

        let profiles = this.store.get("profiles");

        if (Array.isArray(profiles) && profiles.length > 0) {

            if (!this.store.get("activeProfileId"))
                this.store.set("activeProfileId", profiles[0].id);

            return;

        }

        const profile = emptyProfile(DEFAULT_PROFILE_ID, "Redmine");

        for (const key of PROFILE_KEYS) {

            const legacy = this.store.get(key);

            if (legacy !== undefined && legacy !== null)
                profile[key] = legacy;

            this.store.delete(key);

        }

        this.store.set("profiles", [profile]);
        this.store.set("activeProfileId", profile.id);

    }

    // ---------------------------------------------------------- шифрование ключа

    _canEncrypt() {

        try {
            return !!safeStorage && safeStorage.isEncryptionAvailable();
        } catch (ex) {
            return false;
        }

    }

    _encrypt(plain) {

        if (!plain)
            return "";

        if (this._canEncrypt()) {

            try {
                return "enc:" + safeStorage.encryptString(plain).toString("base64");
            } catch (ex) {
                // падаем обратно на открытый вид, чтобы не потерять ключ
            }

        }

        return "plain:" + plain;

    }

    _decrypt(stored) {

        if (!stored)
            return "";

        if (stored.startsWith("enc:")) {

            try {
                return safeStorage.decryptString(
                    Buffer.from(stored.slice(4), "base64")
                );
            } catch (ex) {
                return "";
            }

        }

        if (stored.startsWith("plain:"))
            return stored.slice(6);

        // Старый формат: ключ без префикса.
        return stored;

    }

    // ---------------------------------------------------------- профили

    _profiles() {

        return this.store.get("profiles") || [];

    }

    getActiveProfileId() {

        return this.store.get("activeProfileId");

    }

    _active() {

        const profiles = this._profiles();
        const id = this.getActiveProfileId();

        return profiles.find(p => p.id === id) || profiles[0];

    }

    _saveProfile(profile) {

        const profiles = this._profiles().map(
            p => p.id === profile.id ? profile : p
        );

        this.store.set("profiles", profiles);

    }

    listProfiles() {

        return this._profiles().map(p => ({
            id: p.id,
            name: p.name,
            serverUrl: p.serverUrl
        }));

    }

    addProfile(name) {

        const profiles = this._profiles();

        let id;

        do {
            id = "p" + Math.random().toString(36).slice(2, 8);
        } while (profiles.some(p => p.id === id));

        const profile = emptyProfile(id, String(name || "Redmine").trim() || "Redmine");

        this.store.set("profiles", [...profiles, profile]);
        this.store.set("activeProfileId", id);

        return id;

    }

    switchProfile(id) {

        if (!this._profiles().some(p => p.id === id))
            throw new Error("Unknown profile");

        this.store.set("activeProfileId", id);

    }

    renameProfile(id, name) {

        const profiles = this._profiles().map(
            p => p.id === id ? { ...p, name: String(name).trim() || p.name } : p
        );

        this.store.set("profiles", profiles);

    }

    removeProfile(id) {

        const profiles = this._profiles();

        if (profiles.length <= 1)
            throw new Error("Cannot remove the last profile");

        const left = profiles.filter(p => p.id !== id);

        this.store.set("profiles", left);

        if (this.getActiveProfileId() === id)
            this.store.set("activeProfileId", left[0].id);

    }

    // ---------------------------------------------------------- чтение / запись

    get(key) {

        if (PROFILE_KEYS.includes(key)) {

            const profile = this._active();

            if (key === "apiKey") {

                const stored = profile.apiKey || "";

                // Старый открытый ключ перешифровываем при первом чтении.
                if (stored && !stored.startsWith("enc:") && this._canEncrypt()) {

                    const plain = this._decrypt(stored);

                    this._saveProfile({ ...profile, apiKey: this._encrypt(plain) });

                    return plain;

                }

                return this._decrypt(stored);

            }

            return profile[key];

        }

        return this.store.get(key);

    }

    set(key, value) {

        if (!WRITABLE_KEYS.has(key))
            return false;

        if (PROFILE_KEYS.includes(key)) {

            const profile = this._active();

            this._saveProfile({
                ...profile,
                [key]: key === "apiKey" ? this._encrypt(String(value || "").trim()) : value
            });

            return true;

        }

        this.store.set(key, value);

        return true;

    }

    // Сохраняем только разрешённые ключи (остальное из renderer игнорируем).
    setMany(data) {

        for (const key of Object.keys(data || {}))
            this.set(key, data[key]);

    }

    getAll() {

        const profile = this._active();

        const all = {};

        for (const key of Object.keys(GLOBAL_DEFAULTS))
            all[key] = this.store.get(key);

        for (const key of PROFILE_KEYS)
            all[key] = this.get(key);

        all.profiles = this.listProfiles();
        all.activeProfileId = profile.id;

        return all;

    }

}

module.exports = new SettingsService();
module.exports.SettingsService = SettingsService;
module.exports.PROFILE_KEYS = PROFILE_KEYS;
module.exports.DEFAULT_NOTIFY_EVENTS = DEFAULT_NOTIFY_EVENTS;
