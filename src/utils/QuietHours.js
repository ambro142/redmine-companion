// Тихие часы и режим "Не беспокоить". Чистая функция без Electron - легко тестировать.

function toMinutes(value) {

    const m = /^(\d{1,2}):(\d{2})$/.exec(String(value || "").trim());

    if (!m)
        return null;

    const h = Number(m[1]);
    const min = Number(m[2]);

    if (h > 23 || min > 59)
        return null;

    return h * 60 + min;

}

// cfg: { dnd, quietEnabled, quietFrom, quietTo }
function isQuietNow(cfg, date = new Date()) {

    if (!cfg)
        return false;

    if (cfg.dnd)
        return true;

    if (!cfg.quietEnabled)
        return false;

    const from = toMinutes(cfg.quietFrom);
    const to = toMinutes(cfg.quietTo);

    if (from === null || to === null || from === to)
        return false;

    const now = date.getHours() * 60 + date.getMinutes();

    // Обычный интервал (09:00-18:00) и интервал через полночь (22:00-08:00)
    return from < to
        ? now >= from && now < to
        : now >= from || now < to;

}

module.exports = { isQuietNow, toMinutes };
