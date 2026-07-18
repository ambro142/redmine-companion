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

            card.innerHTML = `

                <div class="journal-time">

                    ${entry.time}

                </div>

                <div class="journal-title">

                    📋 [${entry.project}] #${entry.id}

                    ${entry.subject}

                </div>

                <div class="journal-body">

                    ${entry.body.replace(/\n/g,"<br>")}

                </div>

            `;

            this.container.appendChild(card);

        });

    }

}

window.JournalService = JournalService;