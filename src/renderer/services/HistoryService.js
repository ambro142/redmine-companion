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

                assigned:
                    issue.assigned_to?.name  || null,

                priority:
                    issue.priority?.name  || null,

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

    async cleanup(activeIds){

        const all =
            await window.api.getAllHistory();


        for(const id of Object.keys(all)){

            if(!activeIds.has(Number(id))){

                await window.api.deleteHistory(id);

            }

        }

    }
}

window.HistoryService = HistoryService;