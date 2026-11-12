const test = require("node:test");
const assert = require("node:assert");
const { loadRenderer, plain } = require("./helpers");

const ctx = loadRenderer([
    "renderer/services/IssueMeta.js",
    "renderer/services/IssueFilterService.js",
    "renderer/services/IssueSearchService.js"
]);

const { IssueFilterService, IssueSearchService } = ctx;

const issues = [
    { id: 1, subject: "Алфавит", project: { id: 10, name: "Б" }, tracker: { id: 1, name: "Bug" }, status: { id: 1 }, priority: { id: 4 } },
    { id: 2, subject: "Борода", project: { id: 11, name: "А" }, tracker: { id: 2, name: "Task" }, status: { id: 2 }, priority: { id: 6 } },
    { id: 3, subject: "Вода", project: { id: 10, name: "Б" }, tracker: { id: 2, name: "Task" }, status: { id: 1 }, priority: { id: 3 } }
];

test("filterByFields: проект, трекер, статус и их сочетания", () => {

    const ids = f => plain(IssueFilterService.filterByFields(issues, f).map(i => i.id));

    assert.deepStrictEqual(ids({}), [1, 2, 3]);
    assert.deepStrictEqual(ids({ projectId: "10" }), [1, 3]);
    assert.deepStrictEqual(ids({ trackerId: 2 }), [2, 3]);
    assert.deepStrictEqual(ids({ statusId: "1", trackerId: "2" }), [3]);
    assert.deepStrictEqual(ids({ projectId: "999" }), []);

});

test("collectOptions: уникальные проекты и трекеры по алфавиту", () => {

    const { projects, trackers } = IssueFilterService.collectOptions(issues);

    assert.deepStrictEqual(plain(projects.map(p => p.name)), ["А", "Б"]);
    assert.deepStrictEqual(plain(trackers.map(t => t.name)), ["Bug", "Task"]);

});

test("сортировка по приоритету использует порядок приоритетов Redmine", () => {

    const priorities = [{ id: 3 }, { id: 4 }, { id: 6 }];

    const sorted = plain(IssueSearchService.sort(issues, "priority_desc", priorities).map(i => i.id));

    assert.deepStrictEqual(sorted, [2, 1, 3]);

});
