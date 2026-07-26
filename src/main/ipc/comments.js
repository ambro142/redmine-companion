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

    ipcMain.handle("issue:comment", async (_, issueId, notes)=>{

        const client = new RedmineClient(

            settings.get("serverUrl"),

            settings.get("apiKey")

        );

        return await client.addIssueComment(issueId, notes);

    });

}

module.exports = {

    registerCommentsIpc

};