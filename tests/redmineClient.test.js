const test = require("node:test");
const assert = require("node:assert");
const { mockModules, freshRequire } = require("./helpers");

function load(handler) {

    const calls = [];
    let config = null;

    const http = {
        get: async (url, opts) => { calls.push({ method: "get", url, params: opts && opts.params }); return handler("get", url, opts); },
        put: async (url, body) => { calls.push({ method: "put", url, body }); return handler("put", url, body); },
        post: async (url, body) => { calls.push({ method: "post", url, body }); return handler("post", url, body); }
    };

    const restore = mockModules({
        axios: { create: c => { config = c; return http; } }
    });

    try {
        const RedmineClient = freshRequire("api/RedmineClient.js");
        return { RedmineClient, calls, getConfig: () => config };
    } finally {
        restore();
    }

}

test("адрес нормализуется, ключ уходит в заголовок", () => {

    const { RedmineClient, getConfig } = load(async () => ({ data: {} }));

    const client = new RedmineClient("redmine.example.com/", " KEY ");

    assert.strictEqual(client.serverUrl, "https://redmine.example.com");
    assert.strictEqual(getConfig().headers["X-Redmine-API-Key"], "KEY");

});

test("без адреса или ключа - ошибка NOT_CONFIGURED", () => {

    const { RedmineClient } = load(async () => ({ data: {} }));

    assert.throws(() => new RedmineClient("", "k"), /RC:NOT_CONFIGURED/);
    assert.throws(() => new RedmineClient("x", ""), /RC:NOT_CONFIGURED/);

});

test("самоподписанные сертификаты - только по явной настройке", () => {

    const a = load(async () => ({ data: {} }));
    new a.RedmineClient("https://x", "k");
    assert.strictEqual(a.getConfig().httpsAgent, undefined);

    const b = load(async () => ({ data: {} }));
    new b.RedmineClient("https://x", "k", { allowSelfSigned: true });
    assert.strictEqual(b.getConfig().httpsAgent.options.rejectUnauthorized, false);

    // для http агент не нужен
    const c = load(async () => ({ data: {} }));
    new c.RedmineClient("http://x", "k", { allowSelfSigned: true });
    assert.strictEqual(c.getConfig().httpsAgent, undefined);

});

test("parseProxy", () => {

    const { RedmineClient } = load(async () => ({ data: {} }));

    assert.deepStrictEqual(RedmineClient.parseProxy("http://u:p%40ss@proxy:3128"), {
        protocol: "http", host: "proxy", port: 3128, auth: { username: "u", password: "p@ss" }
    });
    assert.deepStrictEqual(RedmineClient.parseProxy("proxy:8080"), { protocol: "http", host: "proxy", port: 8080 });
    assert.strictEqual(RedmineClient.parseProxy(""), null);
    assert.strictEqual(RedmineClient.parseProxy("http://"), null);

});

test("постраничная загрузка собирает все страницы", async () => {

    const all = Array.from({ length: 250 }, (_, i) => ({ id: i + 1 }));

    const { RedmineClient, calls } = load(async (_m, _url, opts) => {
        const { offset, limit } = opts.params;
        return { data: { issues: all.slice(offset, offset + limit), total_count: all.length } };
    });

    const client = new RedmineClient("https://x", "k", { maxIssues: 1000 });
    const issues = await client.getAssignedIssues();

    assert.strictEqual(issues.length, 250);
    assert.deepStrictEqual(calls.map(c => c.params.offset), [0, 100, 200]);
    assert.strictEqual(calls[0].params.assigned_to_id, "me");
    assert.strictEqual(calls[0].params.sort, "updated_on:desc");

});

test("лимит задач ограничивает загрузку", async () => {

    const all = Array.from({ length: 1000 }, (_, i) => ({ id: i + 1 }));

    const { RedmineClient, calls } = load(async (_m, _url, opts) => {
        const { offset, limit } = opts.params;
        return { data: { issues: all.slice(offset, offset + limit), total_count: all.length } };
    });

    const client = new RedmineClient("https://x", "k", { maxIssues: 200 });
    const issues = await client.getAuthoredIssues();

    assert.strictEqual(issues.length, 200);
    assert.strictEqual(calls.length, 2);

});

test("пустая страница не зацикливает загрузку", async () => {

    const { RedmineClient, calls } = load(async () => ({ data: { issues: [], total_count: 500 } }));

    const client = new RedmineClient("https://x", "k");

    assert.deepStrictEqual(await client.getWatchedIssues(), []);
    assert.strictEqual(calls.length, 1);

});

test("ошибки HTTP превращаются в понятные коды", async () => {

    const cases = [
        [{ response: { status: 401 } }, "RC:AUTH"],
        [{ response: { status: 403 } }, "RC:FORBIDDEN"],
        [{ response: { status: 404 } }, "RC:NOT_FOUND"],
        [{ response: { status: 429 } }, "RC:RATE_LIMIT"],
        [{ response: { status: 422, data: { errors: ["Срок неверный", "Ещё"] } } }, "RC:VALIDATION|Срок неверный; Ещё"],
        [{ response: { status: 503 } }, "RC:SERVER|503"],
        [{ code: "ECONNABORTED" }, "RC:TIMEOUT"],
        [{ code: "ENOTFOUND" }, "RC:NETWORK|ENOTFOUND"],
        [{ code: "DEPTH_ZERO_SELF_SIGNED_CERT" }, "RC:CERT|DEPTH_ZERO_SELF_SIGNED_CERT"],
        [{ message: "что-то странное" }, "RC:UNKNOWN|что-то странное"]
    ];

    for (const [error, expected] of cases) {

        const { RedmineClient } = load(async () => { throw error; });

        const client = new RedmineClient("https://x", "k");

        await assert.rejects(() => client.getCurrentUser(), e => {
            assert.strictEqual(e.message, expected);
            return true;
        });

    }

});

test("изменение задачи, время и приоритеты", async () => {

    const { RedmineClient, calls } = load(async (method, url) => {
        if (url.includes("issue_priorities")) return { data: { issue_priorities: [{ id: 1 }] } };
        return { data: {} };
    });

    const client = new RedmineClient("https://x", "k");

    await client.updateIssue(5, { due_date: "2026-12-01" });
    await client.addTimeEntry(5, { hours: 1.5, activityId: 9, comments: "работа", spentOn: "2026-11-08" });
    await client.addTimeEntry(5, { hours: 2 });

    assert.deepStrictEqual(calls[0], { method: "put", url: "/issues/5.json", body: { issue: { due_date: "2026-12-01" } } });
    assert.deepStrictEqual(calls[1].body, {
        time_entry: { issue_id: 5, hours: 1.5, activity_id: 9, comments: "работа", spent_on: "2026-11-08" }
    });
    assert.deepStrictEqual(calls[2].body, { time_entry: { issue_id: 5, hours: 2 } });

    assert.deepStrictEqual(await client.getIssuePriorities(), [{ id: 1 }]);

});

test("справочник приоритетов недоступен - это не ошибка", async () => {

    const { RedmineClient } = load(async () => { throw { response: { status: 404 } }; });

    assert.deepStrictEqual(await new RedmineClient("https://x", "k").getIssuePriorities(), []);

});
