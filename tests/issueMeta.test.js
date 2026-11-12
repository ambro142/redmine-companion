const test = require("node:test");
const assert = require("node:assert");
const { loadRenderer } = require("./helpers");

const { IssueMeta } = loadRenderer(["renderer/services/IssueMeta.js"]);

const statuses = [
    { id: 1, name: "New", is_closed: false },
    { id: 2, name: "В работе", is_closed: false },
    { id: 5, name: "Что-то своё", is_closed: true }
];

test("закрытый статус определяется по is_closed, а не по названию", () => {
    assert.strictEqual(IssueMeta.statusClass({ id: 5, name: "Что-то своё" }, statuses), "status-closed");
});

test("запасной вариант по названию (ru/en)", () => {
    assert.strictEqual(IssueMeta.statusClass({ id: 1, name: "New" }, statuses), "status-new");
    assert.strictEqual(IssueMeta.statusClass({ id: 9, name: "Новая" }, []), "status-new");
    assert.strictEqual(IssueMeta.statusClass({ id: 2, name: "В работе" }, statuses), "status-progress");
    assert.strictEqual(IssueMeta.statusClass({ id: 9, name: "Решена" }, []), "status-solved");
    assert.strictEqual(IssueMeta.statusClass({ id: 9, name: "Странный" }, []), "status-default");
    assert.strictEqual(IssueMeta.statusClass(null, []), "status-default");
});

const priorities = [
    { id: 3, name: "Низкий" },
    { id: 4, name: "Нормальный", is_default: true },
    { id: 5, name: "Высокий" },
    { id: 6, name: "Срочный" },
    { id: 7, name: "Немедленный" }
];

test("приоритеты красятся по позиции в списке Redmine, а не по названию", () => {
    const klass = id => IssueMeta.priorityClass({ id }, priorities);
    assert.strictEqual(klass(3), "priority-low");
    assert.strictEqual(klass(4), "priority-normal");
    assert.strictEqual(klass(5), "priority-high");
    assert.strictEqual(klass(6), "priority-high");
    assert.strictEqual(klass(7), "priority-urgent");
});

test("нестандартные названия приоритетов тоже работают", () => {
    const custom = [{ id: 10, name: "Meh" }, { id: 11, name: "Ok", is_default: true }, { id: 12, name: "Fire" }];
    assert.strictEqual(IssueMeta.priorityClass({ id: 10 }, custom), "priority-low");
    assert.strictEqual(IssueMeta.priorityClass({ id: 12 }, custom), "priority-urgent");
});

test("без справочника приоритетов - запасной вариант по названию", () => {
    assert.strictEqual(IssueMeta.priorityClass({ id: 1, name: "Low" }, []), "priority-low");
    assert.strictEqual(IssueMeta.priorityClass({ id: 1, name: "Срочный" }, []), "priority-urgent");
    assert.strictEqual(IssueMeta.priorityClass({ id: 1, name: "Высокий" }, []), "priority-high");
    assert.strictEqual(IssueMeta.priorityClass({ id: 1, name: "???" }, []), "priority-normal");
});

test("priorityRank для сортировки", () => {
    assert.strictEqual(IssueMeta.priorityRank({ id: 6 }, priorities), 3);
    assert.strictEqual(IssueMeta.priorityRank({ id: 99 }, priorities), 99); // нет в списке - по id
    assert.strictEqual(IssueMeta.priorityRank(null, priorities), 0);
});
