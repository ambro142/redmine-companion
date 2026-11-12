const test = require("node:test");
const assert = require("node:assert");
const { isQuietNow, toMinutes } = require("../src/utils/QuietHours");

const at = (h, m = 0) => new Date(2026, 10, 8, h, m);

test("toMinutes разбирает время и отвергает мусор", () => {
    assert.strictEqual(toMinutes("08:30"), 510);
    assert.strictEqual(toMinutes("8:05"), 485);
    assert.strictEqual(toMinutes("24:00"), null);
    assert.strictEqual(toMinutes("abc"), null);
    assert.strictEqual(toMinutes(""), null);
});

test("режим 'Не беспокоить' работает всегда", () => {
    assert.strictEqual(isQuietNow({ dnd: true }, at(12)), true);
});

test("выключенные тихие часы ничего не блокируют", () => {
    assert.strictEqual(isQuietNow({ quietEnabled: false, quietFrom: "00:00", quietTo: "23:59" }, at(12)), false);
});

test("интервал внутри суток", () => {
    const cfg = { quietEnabled: true, quietFrom: "09:00", quietTo: "18:00" };
    assert.strictEqual(isQuietNow(cfg, at(8, 59)), false);
    assert.strictEqual(isQuietNow(cfg, at(9, 0)), true);
    assert.strictEqual(isQuietNow(cfg, at(17, 59)), true);
    assert.strictEqual(isQuietNow(cfg, at(18, 0)), false);
});

test("интервал через полночь (22:00-08:00)", () => {
    const cfg = { quietEnabled: true, quietFrom: "22:00", quietTo: "08:00" };
    assert.strictEqual(isQuietNow(cfg, at(23)), true);
    assert.strictEqual(isQuietNow(cfg, at(3)), true);
    assert.strictEqual(isQuietNow(cfg, at(7, 59)), true);
    assert.strictEqual(isQuietNow(cfg, at(8)), false);
    assert.strictEqual(isQuietNow(cfg, at(21, 59)), false);
});

test("одинаковые границы или кривое время не блокируют уведомления", () => {
    assert.strictEqual(isQuietNow({ quietEnabled: true, quietFrom: "10:00", quietTo: "10:00" }, at(10)), false);
    assert.strictEqual(isQuietNow({ quietEnabled: true, quietFrom: "xx", quietTo: "08:00" }, at(3)), false);
    assert.strictEqual(isQuietNow(null, at(3)), false);
});
