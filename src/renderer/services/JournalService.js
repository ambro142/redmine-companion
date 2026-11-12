class JournalService {

    constructor(container) {

        this.container = container;
        this.entries = [];
        this.storageKey = null;

    }

    // Журнал хранится отдельно для каждого профиля и переживает перезапуск.
    setStorageKey(key) {

        this.storageKey = key;

        try {

            const data = JSON.parse(localStorage.getItem(key) || "[]");

            this.entries = Array.isArray(data) ? data : [];

        } catch (ex) {

            this.entries = [];

        }

        this.render();

    }

    save() {

        if (!this.storageKey)
            return;

        try {

            localStorage.setItem(
                this.storageKey,
                JSON.stringify(this.entries)
            );

        } catch (ex) {
            // не критично: журнал просто не сохранится
        }

    }

    add(entry) {

        this.entries.unshift(entry);

        // Храним последние 200 записей
        this.entries = this.entries.slice(0, 200);

        this.save();

        this.render();

    }

    clear() {

        this.entries = [];
        this.save();
        this.render();

    }

    render() {

        this.container.innerHTML = "";

        this.entries.forEach(entry => {

            const card =
                document.createElement("div");

            card.className = "journal-card";

            // Экранируем весь пользовательский/серверный контент перед вставкой
            // в innerHTML. Если у записи есть строки с иконками - рисуем их,
            // иначе (старые записи) - просто текст с переносами.
            const safeBody =
                Array.isArray(entry.items) && entry.items.length
                    ? entry.items.map(item =>
                        '<div class="journal-line">' +
                            Icon.html(item.icon) +
                            '<span>' + HtmlUtils.escape(item.text) + '</span>' +
                        '</div>'
                    ).join("")
                    : HtmlUtils.escape(entry.body).replace(/\n/g,"<br>");

            card.innerHTML = `

                <div class="journal-time">

                    ${HtmlUtils.escape(entry.time)}

                </div>

                <div class="journal-title">

                    ${Icon.html("book")} [${HtmlUtils.escape(entry.project)}] #${HtmlUtils.escape(String(entry.id))}

                    ${HtmlUtils.escape(entry.subject)}

                </div>

                <div class="journal-body">

                    ${safeBody}

                </div>

            `;

            this.container.appendChild(card);

        });

    }

}

window.JournalService = JournalService;