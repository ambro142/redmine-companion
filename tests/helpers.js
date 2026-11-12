const fs = require("fs");
const path = require("path");
const vm = require("vm");
const Module = require("module");

const SRC = path.join(__dirname, "..", "src");

// Загружает скрипты renderer (они пишут классы в window) в изолированный контекст.
function loadRenderer(files, globals = {}) {

    const context = {
        console,
        document: { documentElement: {}, querySelectorAll: () => [] },
        localStorage: (() => {
            const data = new Map();
            return {
                getItem: k => (data.has(k) ? data.get(k) : null),
                setItem: (k, v) => data.set(k, String(v)),
                removeItem: k => data.delete(k)
            };
        })(),
        ...globals
    };

    context.window = context;

    vm.createContext(context);

    // class X {} на верхнем уровне не становится свойством window - достаём по имени
    context.get = name => vm.runInContext(name, context);

    for (const file of files) {

        const full = path.join(SRC, file);

        vm.runInContext(fs.readFileSync(full, "utf8"), context, { filename: full });

    }

    return context;

}

// Подменяет require() для указанных модулей (electron, electron-store, axios...)
function mockModules(mocks) {

    const original = Module._load;

    Module._load = function (request, parent, isMain) {

        if (Object.prototype.hasOwnProperty.call(mocks, request))
            return mocks[request];

        return original.call(this, request, parent, isMain);

    };

    return () => { Module._load = original; };

}

// Свежая загрузка модуля из src (без кэша)
function freshRequire(rel) {

    const full = require.resolve(path.join(SRC, rel));

    delete require.cache[full];

    return require(full);

}

class FakeStore {

    constructor(options = {}) {

        const initial = FakeStore.initial || {};

        this.data = { ...(options.defaults || {}), ...initial };

        FakeStore.initial = null;

    }

    get(key) { return this.data[key]; }

    set(key, value) { this.data[key] = value; }

    delete(key) { delete this.data[key]; }

    clear() { this.data = {}; }

}

FakeStore.initial = null;

// Объекты из vm-контекста имеют другие прототипы - для сравнения приводим к обычным
const plain = value => JSON.parse(JSON.stringify(value));

module.exports = { plain, loadRenderer, mockModules, freshRequire, FakeStore, SRC };
