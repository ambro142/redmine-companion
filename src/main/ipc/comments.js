const { ipcMain } = require("electron");
const { createClient } = require("../clientFactory");

function assertId(value) {

    if (!Number.isInteger(value) || value <= 0)
        throw new Error("Invalid issue id");

}

function registerCommentsIpc() {

    ipcMain.handle("issue:details", async (_, issueId) => {

        assertId(issueId);

        return await createClient().getIssue(issueId);

    });

    ipcMain.handle("issue:comment", async (_, issueId, notes) => {

        assertId(issueId);

        if (typeof notes !== "string" || notes.trim() === "")
            throw new Error("Empty comment");

        return await createClient().addIssueComment(issueId, notes);

    });

}

module.exports = {
    registerCommentsIpc
};
