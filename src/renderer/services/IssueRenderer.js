class IssueRenderer {

    static getStatusColor(status){

        switch(status){

            case "Новая":
                return "#4caf50";

            case "В работе":
                return "#2196f3";

            case "Решена":
                return "#ff9800";

            case "Закрыта":
                return "#9e9e9e";

            default:
                return "#607d8b";

        }

    }

    static create(issue){

        const card=document.createElement("div");

        card.className="issue-card";

        card.style.borderLeft=
            "6px solid "+
            this.getStatusColor(issue.status.name);

        const assigned=
            issue.assigned_to
                ? issue.assigned_to.name
                : "Не назначен";

        const due=
            issue.due_date
                ? issue.due_date
                : "—";

        card.innerHTML=`

            <div class="issue-subject">

                [${issue.project.name}]
                #${issue.id}

                ${issue.subject}

            </div>

            <div class="issue-info">

                👤 ${assigned}

                &nbsp;&nbsp;

                📅 ${due}

            </div>

            <div class="issue-info">

                📌 ${issue.status.name}

                &nbsp;&nbsp;

                ⚡ ${issue.priority.name}

            </div>

        `;

        card.addEventListener("click",()=>{

            window.api.openIssue(issue.id);

        });

        return card;

    }

}