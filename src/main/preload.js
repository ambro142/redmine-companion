const { contextBridge, ipcRenderer } = require('electron');

// Подписка, которая возвращает функцию отписки (чтобы слушатели не копились).
function subscribe(channel, callback) {

    const handler = (_event, ...args) => callback(...args);

    ipcRenderer.on(channel, handler);

    return () => ipcRenderer.removeListener(channel, handler);

}

contextBridge.exposeInMainWorld('api', {

    saveSettings(data) {
        return ipcRenderer.invoke('settings:save', data);
    },

    loadSettings() {
        return ipcRenderer.invoke('settings:load');
    },

    // Профили (несколько серверов Redmine)
    addProfile(name) {
        return ipcRenderer.invoke('profiles:add', name);
    },

    switchProfile(id) {
        return ipcRenderer.invoke('profiles:switch', id);
    },

    renameProfile(id, name) {
        return ipcRenderer.invoke('profiles:rename', id, name);
    },

    removeProfile(id) {
        return ipcRenderer.invoke('profiles:remove', id);
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
        return ipcRenderer.invoke("browser:issue", id);
    },

    showNotification(title, body, issueId){
        return ipcRenderer.invoke("notification:show", title, body, issueId);
    },

    loadIssue(issueId){
        return ipcRenderer.invoke("issue:details", issueId);
    },

    getHistory(issueId){
        return ipcRenderer.invoke("history:get", issueId);
    },

    saveHistory(issueId,data){
        return ipcRenderer.invoke("history:set", issueId, data);
    },

    updateIssueStatus(issueId, statusId){
        return ipcRenderer.invoke("issue:updateStatus", issueId, statusId);
    },

    // fields: status_id, priority_id, assigned_to_id, due_date, done_ratio
    updateIssue(issueId, fields){
        return ipcRenderer.invoke("issue:update", issueId, fields);
    },

    addIssueComment(issueId, notes){
        return ipcRenderer.invoke("issue:comment", issueId, notes);
    },

    getTimeActivities(){
        return ipcRenderer.invoke("issue:activities");
    },

    logTime(issueId, payload){
        return ipcRenderer.invoke("issue:logTime", issueId, payload);
    },

    setLoginItemSettings(options){
        return ipcRenderer.invoke("app:setLoginItemSettings", options);
    },

    getAppVersion(){
        return ipcRenderer.invoke("app:version");
    },

    setTrayStatus(text){
        return ipcRenderer.invoke("tray:status", text);
    },

    onTraySync(callback){
        return subscribe("tray:sync", callback);
    },

    // Клик по системному уведомлению: окно просит открыть карточку задачи
    onNotificationOpen(callback){
        return subscribe("notification:open", callback);
    },

    // Настройка изменена снаружи (например, "Не беспокоить" из меню трея)
    onSettingsChanged(callback){
        return subscribe("settings:changed", callback);
    }

});
