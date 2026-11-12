const test = require("node:test");
const assert = require("node:assert");
const { loadRenderer } = require("./helpers");

const { TimeUtils } = loadRenderer(["renderer/services/TimeUtils.js"]);

test("parseHours: десятичные числа", () => {
    assert.strictEqual(TimeUtils.parseHours("1.5"), 1.5);
    assert.strictEqual(TimeUtils.parseHours("1,5"), 1.5);
    assert.strictEqual(TimeUtils.parseHours("2"), 2);
    assert.strictEqual(TimeUtils.parseHours(" 0.25 "), 0.25);
});

test("parseHours: формат ЧЧ:ММ", () => {
    assert.strictEqual(TimeUtils.parseHours("1:30"), 1.5);
    assert.strictEqual(TimeUtils.parseHours("0:45"), 0.75);
    assert.strictEqual(TimeUtils.parseHours("10:00"), 10);
});

test("parseHours: часы и минуты словами", () => {
    assert.strictEqual(TimeUtils.parseHours("1h30m"), 1.5);
    assert.strictEqual(TimeUtils.parseHours("2h"), 2);
    assert.strictEqual(TimeUtils.parseHours("90m"), 1.5);
    assert.strictEqual(TimeUtils.parseHours("1ч 30м"), 1.5);
    assert.strictEqual(TimeUtils.parseHours("45мин"), 0.75);
});

test("parseHours: мусор, ноль и больше суток отклоняются", () => {
    for (const bad of ["", "abc", "0", "-1", "25", "1:99", "1:", null, undefined, "h"])
        assert.strictEqual(TimeUtils.parseHours(bad), null, "должно быть null для " + bad);
});

test("formatElapsed и elapsedToHours", () => {
    assert.strictEqual(TimeUtils.formatElapsed(0), "00:00:00");
    assert.strictEqual(TimeUtils.formatElapsed(3723000), "01:02:03");
    assert.strictEqual(TimeUtils.elapsedToHours(1000), 0.05);          // минимум 0.05
    assert.strictEqual(TimeUtils.elapsedToHours(90 * 60 * 1000), 1.5);
    assert.strictEqual(TimeUtils.elapsedToHours(100 * 3600 * 1000), 24); // максимум сутки
});
