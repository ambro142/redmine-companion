class I18nService {

    static lang = "ru";

    static dicts = {
        ru: window.LOCALE_RU,
        en: window.LOCALE_EN
    };

    static setLanguage(lang) {

        if (lang !== "ru" && lang !== "en")
            lang = "ru";

        this.lang = lang;
        document.documentElement.lang = lang;
        this.apply();

    }

    static getLanguage() {

        return this.lang;

    }

    static t(key, params) {

        const dict = this.dicts[this.lang] || {};
        let text = dict[key];

        if (text === undefined)
            text = key;

        if (params) {

            for (const paramKey in params) {

                text = text.replace(
                    "{" + paramKey + "}",
                    params[paramKey]
                );

            }

        }

        return text;

    }

    static status(name) {

        const dict = this.dicts[this.lang] || {};
        const map = dict.statusNames || {};

        return map[name] || name;

    }

    static priority(name) {

        const dict = this.dicts[this.lang] || {};
        const map = dict.priorityNames || {};

        return map[name] || name;

    }

    static apply(root) {

        const scope = root || document;

        scope.querySelectorAll("[data-i18n]").forEach(el => {

            el.textContent = this.t(el.dataset.i18n);

        });

        scope.querySelectorAll("[data-i18n-placeholder]").forEach(el => {

            el.placeholder = this.t(el.dataset.i18nPlaceholder);

        });

        scope.querySelectorAll("[data-i18n-title]").forEach(el => {

            el.title = this.t(el.dataset.i18nTitle);

        });

    }

}

window.I18nService = I18nService;
