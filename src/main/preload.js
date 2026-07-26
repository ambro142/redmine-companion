const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

    saveSettings(data) {
        return ipcRenderer.invoke('settings:save', data);
    },

    loadSettings() {
        return ipcRenderer.invoke('settings:load');
    },
    
    testConnection() {
         return ipcRenderer.invoke("redmine:test");
    },

    serverInfo() {
       return ipcRenderer.invoke("redmine:info");
    },

    loadDashboard(){
        return ipcRenderer.invoke("dashboard:load");
    },

    openIssue(id){

        return ipcRenderer.invoke(
            "browser:issue",
            id
        );

    },

    showNotification(title,body){
        return ipcRenderer.invoke(
            "notification:show",
            title,
            body
        );
    },
    
    loadIssue(issueId){
        return ipcRenderer.invoke(
            "issue:details",
            issueId
        );
    },

    getHistory(issueId){

        return ipcRenderer.invoke(

            "history:get",

            issueId

        );

    },

    saveHistory(issueId,data){

        return ipcRenderer.invoke(

            "history:set",

            issueId,

            data

        );

    },

    updateIssueStatus(issueId, statusId){

        return ipcRenderer.invoke(
            "issue:updateStatus",
            issueId,
            statusId
        );

    },

    addIssueComment(issueId, notes){

        return ipcRenderer.invoke(
            "issue:comment",
            issueId,
            notes
        );

    },

    onTraySync: (callback) =>

        ipcRenderer.on(

            "tray:sync",

            callback

        ),
    setLoginItemSettings:

    (options)=>

    ipcRenderer.invoke(

    "app:setLoginItemSettings",

    options

    ),
        
});