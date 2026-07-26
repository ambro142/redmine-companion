class JournalService {

    constructor(container) {

        this.container = container;
        this.entries = [];

    }

    add(entry) {

        this.entries.unshift(entry);

        this.render();

    }

    clear() {

        this.entries = [];
        this.render();

    }

    render() {

        this.container.innerHTML = "";

        this.entries.forEach(entry => {

            const card =
                document.createElement("div");

            card.className = "journal-card";

            // Экранируем весь пользовательский/серверный контент перед вставкой
            // в innerHTML, переносы строк добавляем уже после экранирования.
            const safeBody =
                HtmlUtils.escape(entry.body).replace(/\n/g,"<br>");

            card.innerHTML = `

                <div class="journal-time">

                    ${HtmlUtils.escape(entry.time)}

                </div>

                <div class="journal-title">

                    📋 [${HtmlUtils.escape(entry.project)}] #${HtmlUtils.escape(String(entry.id))}

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