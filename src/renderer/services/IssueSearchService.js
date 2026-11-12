class IssueSearchService {

    static filterByQuery(issues, query){

        if (!query)
            return issues;

        const q = query.trim().toLowerCase();

        if (!q)
            return issues;

        return issues.filter(issue => {

            const subject = (issue.subject || "").toLowerCase();
            const project = (issue.project?.name || "").toLowerCase();
            const id = String(issue.id);

            return subject.includes(q) ||
                   project.includes(q) ||
                   id.includes(q);

        });

    }

    static sort(issues, sortKey, priorities = []){

        const list = [...issues];

        switch (sortKey){

            case "priority_desc":

                list.sort((a, b) =>
                    IssueMeta.priorityRank(b.priority, priorities) -
                    IssueMeta.priorityRank(a.priority, priorities)
                );

                break;

            case "due_asc":

                list.sort((a, b) => {

                    if (!a.due_date && !b.due_date)
                        return 0;

                    if (!a.due_date)
                        return 1;

                    if (!b.due_date)
                        return -1;

                    return new Date(a.due_date) - new Date(b.due_date);

                });

                break;

            case "id_desc":

                list.sort((a, b) => b.id - a.id);

                break;

            case "id_asc":

                list.sort((a, b) => a.id - b.id);

                break;

            case "updated_desc":
            default:

                list.sort((a, b) =>
                    new Date(b.updated_on) - new Date(a.updated_on)
                );

                break;

        }

        return list;

    }

}

window.IssueSearchService = IssueSearchService;
