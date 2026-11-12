const test = require("node:test");
const assert = require("node:assert");
const { loadRenderer, plain } = require("./helpers");

const ctx = loadRenderer([
    "locales/ru.js",
    "locales/en.js",
    "renderer/services/I18nService.js",
    "renderer/services/HtmlUtils.js",
    "renderer/services/Icon.js",
    "renderer/services/NotificationBuilder.js",
    "renderer/services/NotificationPolicy.js"
]);

const NotificationBuilder = ctx.get("NotificationBuilder");
const { NotificationPolicy, I18nService } = ctx;

const issue = { id: 42, subject: "Тест", project: { name: "Проект" } };

test("в тексте уведомлений нет смайликов, есть иконки для журнала", () => {

    I18nService.setLanguage("ru");

    const result = NotificationBuilder.build(issue, [
        { type: "new" },
        { type: "status", oldValue: "Новая", newValue: "В работе" },
        { type: "assigned", newValue: "Иван" },
        { type: "due", newValue: null },
        { type: "priority", oldValue: "Низкий", newValue: "Срочный" }
    ], { notes: "привет", user: { name: "Анна" } });

    assert.strictEqual(result.title, "[Проект] #42 Тест");
    assert.deepStrictEqual(plain(result.items.map(i => i.icon)), ["chat", "add", "sync", "person", "calendar", "flag"]);

    // только буквы, цифры, пробелы и обычная пунктуация (без emoji)
    assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(result.body), "emoji в теле уведомления");

    assert.match(result.body, /Анна: привет/);
    assert.match(result.body, /Статус: .+ → .+/);
    assert.match(result.body, /Исполнитель: Иван/);
    assert.match(result.body, /Приоритет:/);

});

test("английский язык", () => {

    I18nService.setLanguage("en");

    const result = NotificationBuilder.build(issue, [
        { type: "assigned", newValue: "John" }
    ], null);

    assert.strictEqual(result.body, "Assignee: John");
    assert.deepStrictEqual(plain(result.items), [{ icon: "person", text: "Assignee: John" }]);

});

test("NotificationPolicy: по умолчанию уведомляем обо всём", () => {

    assert.strictEqual(NotificationPolicy.allows("status", undefined), true);
    assert.strictEqual(NotificationPolicy.allows("status", {}), true);
    assert.strictEqual(NotificationPolicy.allows("status", { status: false }), false);
    assert.strictEqual(NotificationPolicy.allows("comment", { status: false }), true);

});

test("Icon.html даёт безопасную разметку", () => {

    assert.strictEqual(
        ctx.Icon.html("person"),
        '<span class="ico ico-person" aria-hidden="true"></span>'
    );

});
