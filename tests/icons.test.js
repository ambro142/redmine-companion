const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { build, OUTPUT } = require("../scripts/build-icons");

const SRC = path.join(__dirname, "..", "src");

test("icons.css актуален (после правки SVG запустите npm run icons)", () => {

    assert.strictEqual(
        fs.readFileSync(OUTPUT, "utf8").replace(/\r\n/g, "\n"),
        build().replace(/\r\n/g, "\n")
    );

});

test("все иконки, которые использует код, существуют", () => {

    const css = fs.readFileSync(OUTPUT, "utf8");

    const files = [
        "renderer/index.html",
        "renderer/Apps.js",
        ...fs.readdirSync(path.join(SRC, "renderer/services")).map(f => "renderer/services/" + f)
    ];

    const used = new Set();

    for (const file of files) {

        const text = fs.readFileSync(path.join(SRC, file), "utf8");

        for (const m of text.matchAll(/Icon\.html\("([a-z-]+)"\)/g)) used.add(m[1]);
        for (const m of text.matchAll(/add\(\s*"([a-z-]+)"\s*,/g)) used.add(m[1]);
        for (const m of text.matchAll(/class="[^"]*\bico-([a-z-]+)/g)) used.add(m[1]);

    }

    assert.ok(used.size >= 10, "иконки не найдены - проверьте регулярные выражения");

    for (const name of used)
        assert.ok(css.includes(`.ico-${name} `), "нет иконки: " + name);

});

test("в стилях нет ссылок на SVG по пути (они не работают по file://)", () => {

    const css = fs.readFileSync(path.join(SRC, "renderer/styles.css"), "utf8");

    assert.ok(!/url\(["']?\.\.\/assets\/icons/.test(css));

});
