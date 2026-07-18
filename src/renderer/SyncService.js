class SyncService{

    async sync(){

        const serverInfo =
            await window.api.serverInfo();

        const dashboard =
            await window.api.loadDashboard();

        return{

            serverInfo,

            dashboard

        };

    }

}

window.SyncService=SyncService;