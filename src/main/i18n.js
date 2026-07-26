const settings = require("../storage/SettingsService");
const RU = require("../locales/ru.js");
const EN = require("../locales/en.js");

function t(key) {

    const lang = settings.get("language") || "ru";
    const dict = lang === "en" ? EN : RU;

    return dict[key] || key;

}

module.exports = { t };
