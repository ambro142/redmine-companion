const test = require("node:test");
const assert = require("node:assert");
const { mockModules, freshRequire, FakeStore } = require("./helpers");

const fakeSafeStorage = {
    isEncryptionAvailable: () => true,
    encryptString: s => Buffer.from("X" + s),
    decryptString: b => b.toString().slice(1)
};

function load({ initial = null, safeStorage = fakeSafeStorage } = {}) {

    FakeStore.initial = initial;

    const restore = mockModules({
        "electron-store": FakeStore,
        electron: { safeStorage }
    });

    try {
        return freshRequire("storage/SettingsService.js");
    } finally {
        restore();
    }

}

test("старые настройки переезжают в профиль default", () => {

    const settings = load({
        initial: { serverUrl: "https://old", apiKey: "secret", historyInitialized: true }
    });

    assert.strictEqual(settings.getActiveProfileId(), "default");
    assert.strictEqual(settings.get("serverUrl"), "https://old");
    assert.strictEqual(settings.get("apiKey"), "secret");
    assert.strictEqual(settings.get("historyInitialized"), true);

    // в корне хранилища их больше нет
    assert.strictEqual(settings.store.data.serverUrl, undefined);
    assert.strictEqual(settings.store.data.apiKey, undefined);

});

test("старый открытый ключ перешифровывается при первом чтении", () => {

    const settings = load({ initial: { serverUrl: "https://x", apiKey: "plain-key" } });

    assert.strictEqual(settings.get("apiKey"), "plain-key");

    const stored = settings.store.data.profiles[0].apiKey;

    assert.ok(stored.startsWith("enc:"), "ключ должен храниться зашифрованным");
    assert.ok(!stored.includes("plain-key"));

});

test("новый ключ сохраняется зашифрованным и читается обратно", () => {

    const settings = load();

    settings.set("apiKey", "  abc123  ");

    assert.strictEqual(settings.get("apiKey"), "abc123");
    assert.ok(settings.store.data.profiles[0].apiKey.startsWith("enc:"));

});

test("без safeStorage ключ не теряется", () => {

    const settings = load({ safeStorage: null });

    settings.set("apiKey", "abc");

    assert.strictEqual(settings.get("apiKey"), "abc");
    assert.ok(settings.store.data.profiles[0].apiKey.startsWith("plain:"));

});

test("из окна приложения можно менять только известные настройки", () => {

    const settings = load();

    settings.setMany({
        language: "en",
        profiles: [],               // нельзя
        activeProfileId: "hacked",  // нельзя
        __proto__x: 1,              // мусор
        evil: "x"                   // неизвестный ключ
    });

    assert.strictEqual(settings.get("language"), "en");
    assert.notStrictEqual(settings.getActiveProfileId(), "hacked");
    assert.ok(settings.store.data.profiles.length === 1);
    assert.strictEqual(settings.store.data.evil, undefined);

});

test("getAll не отдаёт ключи других профилей и содержит список профилей", () => {

    const settings = load();

    settings.set("serverUrl", "https://one");
    settings.set("apiKey", "k1");

    const second = settings.addProfile("Второй");

    settings.set("serverUrl", "https://two");
    settings.set("apiKey", "k2");

    const all = settings.getAll();

    assert.strictEqual(all.serverUrl, "https://two");
    assert.strictEqual(all.apiKey, "k2");
    assert.strictEqual(all.activeProfileId, second);
    assert.deepStrictEqual(all.profiles.map(p => p.name), ["Redmine", "Второй"]);
    assert.ok(all.profiles.every(p => !("apiKey" in p)));

    settings.switchProfile("default");

    assert.strictEqual(settings.get("serverUrl"), "https://one");
    assert.strictEqual(settings.get("apiKey"), "k1");

});

test("профили: переименование и удаление", () => {

    const settings = load();

    const id = settings.addProfile("Тест");

    settings.renameProfile(id, "Новое имя");

    assert.strictEqual(settings.listProfiles().find(p => p.id === id).name, "Новое имя");

    settings.removeProfile(id);

    assert.strictEqual(settings.getActiveProfileId(), "default");

    assert.throws(() => settings.removeProfile("default"), /last profile/);
    assert.throws(() => settings.switchProfile("nope"), /Unknown profile/);

});
