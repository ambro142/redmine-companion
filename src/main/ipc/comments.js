const { ipcMain } = require("electron");
const RedmineClient = require("../../api/RedmineClient");
const settings = require("../../storage/SettingsService");

function registerCommentsIpc(){

    ipcMain.handle("issue:details", async (_, issueId)=>{

        const client = new RedmineClient(

            settings.get("serverUrl"),

            settings.get("apiKey")

        );

        return await client.getIssue(issueId);

    });

}

module.exports = {

    registerCommentsIpc

};