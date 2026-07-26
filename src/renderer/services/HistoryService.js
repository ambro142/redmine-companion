class HistoryService {

    async get(issueId) {

        return await window.api.getHistory(issueId);

    }

    async update(issue) {

        const old =
            await this.get(issue.id);

        await window.api.saveHistory(

            issue.id,

            {

                updatedOn:
                    issue.updated_on,
                known:
                    old?.known || false,

                status:
                    issue.status?.name || null,
                statusId:
                    issue.status?.id ?? null,

                assigned:
                    issue.assigned_to?.name  || null,
                assignedId:
                    issue.assigned_to?.id ?? null,

                priority:
                    issue.priority?.name  || null,
                priorityId:
                    issue.priority?.id ?? null,

                due:
                    issue.due_date || null,

                lastJournalId:
                    old?.lastJournalId || null

            }

        );

    }

    async setLastJournal(issueId, journalId) {

        const old =
            await this.get(issueId);

        await window.api.saveHistory(

            issueId,

            {

                ...old,

                lastJournalId:
                    journalId

            }

        );

    }

    async getLastJournal(issueId) {

        const state =
            await this.get(issueId);

        return state?.lastJournalId || null;

    }

}

window.HistoryService = HistoryService;