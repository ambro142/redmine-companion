// Собирает src/renderer/icons.css из SVG-файлов в src/assets/icons.
//
// Зачем: иконки рисуются через CSS mask-image, а Chromium запрещает (CORS) грузить
// маски по file:// - в Electron при loadFile они бы просто не отобразились.
// Data-URI таких ограничений не имеет, поэтому SVG встраиваются прямо в CSS.
//
// Запуск после добавления или изменения иконок:  npm run icons

const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.join(__dirname, "..", "src", "assets", "icons");
const OUTPUT = path.join(__dirname, "..", "src", "renderer", "icons.css");

function dataUri(svg) {

    const compact = svg
        .replace(/\s+/g, " ")
        .replace(/> </g, "><")
        .trim();

    return "data:image/svg+xml," + encodeURIComponent(compact)
        .replace(/'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");

}

function build() {

    const names = fs.readdirSync(ICONS_DIR)
        .filter(file => file.endsWith(".svg"))
        .map(file => file.slice(0, -4))
        .sort();

    let css =
        "/* ФАЙЛ СОЗДАЁТСЯ АВТОМАТИЧЕСКИ: npm run icons (scripts/build-icons.js).\n" +
        "   Исходники иконок - src/assets/icons/*.svg, править этот файл руками не нужно. */\n\n";

    css += ":root {\n";

    for (const name of names) {

        const svg = fs.readFileSync(path.join(ICONS_DIR, name + ".svg"), "utf8");

        css += `    --i-${name}: url("${dataUri(svg)}");\n`;

    }

    css += "}\n\n";

    for (const name of names)
        css += `.ico-${name} { --ico: var(--i-${name}); }\n`;

    return css;

}

if (require.main === module) {

    fs.writeFileSync(OUTPUT, build());

    console.log("icons.css: " + fs.readdirSync(ICONS_DIR).filter(f => f.endsWith(".svg")).length + " icons");

}

module.exports = { build, OUTPUT };
