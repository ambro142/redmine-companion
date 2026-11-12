const test = require("node:test");
const assert = require("node:assert");
const { loadRenderer } = require("./helpers");

const { ErrorUtils, I18nService } = loadRenderer([
    "locales/ru.js",
    "locales/en.js",
    "renderer/services/I18nService.js",
    "renderer/services/ErrorUtils.js"
]);

test("убирает служебный префикс Electron и переводит код ошибки", () => {

    I18nService.setLanguage("ru");

    const text = ErrorUtils.format(new Error("Error invoking remote method 'redmine:test': Error: RC:AUTH"));

    assert.match(text, /API-ключ/);

});

test("подставляет подробности", () => {

    I18nService.setLanguage("ru");

    assert.match(ErrorUtils.format({ message: "RC:NETWORK|ENOTFOUND" }), /ENOTFOUND/);
    assert.match(ErrorUtils.format({ message: "RC:VALIDATION|Срок неверный" }), /Срок неверный/);

});

test("обычные ошибки остаются как есть", () => {

    assert.strictEqual(ErrorUtils.format(new Error("boom")), "boom");

});

test("неизвестный код показывается без падения", () => {

    assert.match(ErrorUtils.format({ message: "RC:WAT|x" }), /WAT/);

});

test("английский перевод ошибок", () => {

    I18nService.setLanguage("en");

    assert.match(ErrorUtils.format({ message: "RC:TIMEOUT" }), /not responding/);

});
