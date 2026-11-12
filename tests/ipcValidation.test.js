const test = require("node:test");
const assert = require("node:assert");
const { mockModules, freshRequire } = require("./helpers");

const restore = mockModules({
    electron: { ipcMain: { handle() {} } },
    "electron-store": class { get() {} set() {} delete() {} },
    axios: { create: () => ({}) }
});

let issuesIpc;

try {
    issuesIpc = freshRequire("main/ipc/issues.js");
} finally {
    restore();
}

const { sanitizeFields, sanitizeTime } = issuesIpc;

test("разрешены только известные поля задачи", () => {

    assert.deepStrictEqual(
        sanitizeFields({ priority_id: 3, done_ratio: 40, due_date: "2026-12-31" }),
        { priority_id: 3, done_ratio: 40, due_date: "2026-12-31" }
    );

    assert.throws(() => sanitizeFields({ subject: "взлом" }), /Invalid field/);
    assert.throws(() => sanitizeFields({ done_ratio: 101 }), /Invalid field/);
    assert.throws(() => sanitizeFields({ priority_id: "3" }), /Invalid field/);
    assert.throws(() => sanitizeFields({ due_date: "завтра" }), /Invalid field/);
    assert.throws(() => sanitizeFields({}), /Nothing to update/);
    assert.throws(() => sanitizeFields(null), /Invalid fields/);

});

test("сброс срока превращается в пустую строку", () => {

    assert.deepStrictEqual(sanitizeFields({ due_date: null }), { due_date: "" });

});

test("запись времени проверяется", () => {

    assert.deepStrictEqual(
        sanitizeTime({ hours: "1.234", activityId: "9", comments: "ок", spentOn: "2026-11-08" }),
        { hours: 1.23, activityId: 9, comments: "ок", spentOn: "2026-11-08" }
    );

    assert.deepStrictEqual(sanitizeTime({ hours: 2, activityId: null }), { hours: 2 });

    assert.throws(() => sanitizeTime({ hours: 0 }), /Invalid hours/);
    assert.throws(() => sanitizeTime({ hours: 25 }), /Invalid hours/);
    assert.throws(() => sanitizeTime({ hours: "abc" }), /Invalid hours/);
    assert.throws(() => sanitizeTime({ hours: 1, activityId: -3 }), /Invalid activity/);
    assert.throws(() => sanitizeTime({ hours: 1, spentOn: "вчера" }), /Invalid date/);
    assert.throws(() => sanitizeTime(null), /Invalid time entry/);

    // слишком длинный комментарий обрезается до 255 символов
    assert.strictEqual(sanitizeTime({ hours: 1, comments: "я".repeat(400) }).comments.length, 255);

});
