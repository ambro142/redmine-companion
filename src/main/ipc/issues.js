const { ipcMain } = require("electron");
const { createClient } = require("../clientFactory");
const Logger = require("../../utils/Logger");

const isId = v => Number.isInteger(v) && v > 0;
const isDate = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

// Какие поля задачи можно менять из окна приложения и как их проверять.
const EDITABLE_FIELDS = {
    status_id: isId,
    priority_id: isId,
    assigned_to_id: isId,
    due_date: v => v === null || v === "" || isDate(v),
    done_ratio: v => Number.isInteger(v) && v >= 0 && v <= 100
};

function sanitizeFields(fields) {

    if (!fields || typeof fields !== "object")
        throw new Error("Invalid fields");

    const clean = {};

    for (const key of Object.keys(fields)) {

        const check = EDITABLE_FIELDS[key];

        if (!check || !check(fields[key]))
            throw new Error("Invalid field: " + key);

        // Пустая дата = сбросить срок
        clean[key] = key === "due_date" && fields[key] === null ? "" : fields[key];

    }

    if (Object.keys(clean).length === 0)
        throw new Error("Nothing to update");

    return clean;

}

function sanitizeTime(payload) {

    if (!payload || typeof payload !== "object")
        throw new Error("Invalid time entry");

    const hours = Number(payload.hours);

    if (!Number.isFinite(hours) || hours <= 0 || hours > 24)
        throw new Error("Invalid hours");

    const entry = { hours: Math.round(hours * 100) / 100 };

    if (payload.activityId !== undefined && payload.activityId !== null && payload.activityId !== "") {

        if (!isId(Number(payload.activityId)))
            throw new Error("Invalid activity");

        entry.activityId = Number(payload.activityId);

    }

    if (payload.comments)
        entry.comments = String(payload.comments).slice(0, 255);

    if (payload.spentOn) {

        if (!isDate(payload.spentOn))
            throw new Error("Invalid date");

        entry.spentOn = payload.spentOn;

    }

    return entry;

}

function registerIssuesIpc() {

    ipcMain.handle("issues:mine", async () => {

        Logger.info("Loading my issues");

        return await createClient().getMyIssues();

    });

    ipcMain.handle("issue:updateStatus", async (_, issueId, statusId) => {

        if (!isId(issueId) || !isId(statusId))
            throw new Error("Invalid arguments");

        Logger.info("Updating issue status " + issueId + " -> " + statusId);

        return await createClient().updateIssueStatus(issueId, statusId);

    });

    ipcMain.handle("issue:update", async (_, issueId, fields) => {

        if (!isId(issueId))
            throw new Error("Invalid issue id");

        const clean = sanitizeFields(fields);

        Logger.info("Updating issue " + issueId + ": " + Object.keys(clean).join(", "));

        return await createClient().updateIssue(issueId, clean);

    });

    ipcMain.handle("issue:activities", async () => {

        return await createClient().getTimeEntryActivities();

    });

    ipcMain.handle("issue:logTime", async (_, issueId, payload) => {

        if (!isId(issueId))
            throw new Error("Invalid issue id");

        const entry = sanitizeTime(payload);

        Logger.info("Logging " + entry.hours + "h on issue " + issueId);

        return await createClient().addTimeEntry(issueId, entry);

    });

}

module.exports = {
    registerIssuesIpc,
    sanitizeFields,
    sanitizeTime
};
