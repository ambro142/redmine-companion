const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {

    saveSettings(data) {
        return ipcRenderer.invoke('settings:save', data);
    },

    loadSettings() {
        return ipcRenderer.invoke('settings:load');
    }
    testConnection(){

         return ipcRenderer.invoke("redmine:test");

    }
});

