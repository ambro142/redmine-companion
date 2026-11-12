const axios = require("axios");
const https = require("https");

// Ошибка с кодом. Через IPC доезжает только message, поэтому код зашит в начало:
//   "RC:AUTH|подробности"
// Интерфейс по коду показывает понятный текст на нужном языке.
class RedmineError extends Error {

    constructor(code, detail = "", status = null) {

        super("RC:" + code + (detail ? "|" + detail : ""));

        this.code = code;
        this.detail = detail;
        this.status = status;

    }

}

const NETWORK_CODES = new Set([
    "ENOTFOUND", "ECONNREFUSED", "EAI_AGAIN", "ECONNRESET", "EHOSTUNREACH", "ENETUNREACH"
]);

const CERT_CODES = new Set([
    "DEPTH_ZERO_SELF_SIGNED_CERT",
    "SELF_SIGNED_CERT_IN_CHAIN",
    "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
    "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
    "CERT_HAS_EXPIRED",
    "ERR_TLS_CERT_ALTNAME_INVALID"
]);

function normalizeError(error) {

    if (error instanceof RedmineError)
        return error;

    const response = error && error.response;

    if (response) {

        const status = response.status;

        if (status === 401)
            return new RedmineError("AUTH", "", status);

        if (status === 403)
            return new RedmineError("FORBIDDEN", "", status);

        if (status === 404)
            return new RedmineError("NOT_FOUND", "", status);

        if (status === 429)
            return new RedmineError("RATE_LIMIT", "", status);

        if (status === 422) {

            const errors = response.data && response.data.errors;

            return new RedmineError(
                "VALIDATION",
                Array.isArray(errors) ? errors.join("; ") : "",
                status
            );

        }

        if (status >= 500)
            return new RedmineError("SERVER", String(status), status);

        return new RedmineError("HTTP", String(status), status);

    }

    const code = error && error.code;

    if (code === "ECONNABORTED" || code === "ETIMEDOUT")
        return new RedmineError("TIMEOUT");

    if (NETWORK_CODES.has(code))
        return new RedmineError("NETWORK", code);

    if (CERT_CODES.has(code))
        return new RedmineError("CERT", code);

    return new RedmineError("UNKNOWN", (error && error.message) || "");

}

class RedmineClient {

    constructor(serverUrl, apiKey, options = {}) {

        if (!serverUrl || !apiKey) {
            throw new RedmineError("NOT_CONFIGURED");
        }

        serverUrl = String(serverUrl).trim();
        apiKey = String(apiKey).trim();

        if (!/^https?:\/\//i.test(serverUrl)) {
            serverUrl = "https://" + serverUrl;
        }

        serverUrl = serverUrl.replace(/\/+$/, "");

        this.serverUrl = serverUrl;
        this.apiKey = apiKey;
        this.maxIssues = Math.max(100, Number(options.maxIssues) || 500);

        const config = {

            baseURL: this.serverUrl,

            timeout: 15000,

            headers: {

                "X-Redmine-API-Key": this.apiKey,

                "Content-Type": "application/json"

            }

        };

        // Самоподписанные / внутренние сертификаты - только по явной настройке.
        if (options.allowSelfSigned && /^https:/i.test(serverUrl))
            config.httpsAgent = new https.Agent({ rejectUnauthorized: false });

        const proxy = RedmineClient.parseProxy(options.proxyUrl);

        if (proxy)
            config.proxy = proxy;

        this.http = axios.create(config);

    }

    // "http://user:pass@host:3128" -> объект для axios. Пусто = использовать
    // переменные окружения HTTP_PROXY/HTTPS_PROXY (axios делает это сам).
    static parseProxy(value) {

        if (!value || !String(value).trim())
            return null;

        try {

            const url = new URL(/^[a-z]+:\/\//i.test(value) ? value : "http://" + value);

            const proxy = {
                protocol: url.protocol.replace(":", ""),
                host: url.hostname,
                port: Number(url.port) || (url.protocol === "https:" ? 443 : 80)
            };

            if (url.username)
                proxy.auth = {
                    username: decodeURIComponent(url.username),
                    password: decodeURIComponent(url.password)
                };

            return proxy;

        } catch (ex) {

            return null;

        }

    }

    async _request(fn) {

        try {

            return await fn();

        } catch (error) {

            throw normalizeError(error);

        }

    }

    async _get(path, params) {

        return this._request(() => this.http.get(path, { params }));

    }

    // Постраничная загрузка. Redmine отдаёт не больше 100 записей за запрос.
    async fetchAll(path, key, params = {}, maxItems = this.maxIssues) {

        const pageSize = 100;
        const items = [];

        let offset = 0;
        let total = Infinity;

        while (offset < total && items.length < maxItems) {

            const response = await this._get(path, {
                ...params,
                limit: pageSize,
                offset
            });

            const page = response.data[key] || [];

            items.push(...page);

            total = Number(response.data.total_count);

            if (!Number.isFinite(total))
                total = items.length;

            if (page.length === 0)
                break;

            offset += page.length;

        }

        return items.slice(0, maxItems);

    }

    async getCurrentUser() {

        const response = await this._get("/users/current.json");

        return response.data.user;

    }

    async testConnection() {

        await this.getCurrentUser();

        return true;

    }

    async getServerInfo() {

        const start = Date.now();

        const response = await this._get("/users/current.json");

        return {

            latency: Date.now() - start,
            user: response.data.user

        };

    }

    async getProjects() {

        return this.fetchAll("/projects.json", "projects", {}, 1000);

    }

    _issues(extra) {

        return this.fetchAll("/issues.json", "issues", {
            status_id: "*",
            sort: "updated_on:desc",
            ...extra
        });

    }

    async getMyIssues() {

        return this.getAssignedIssues();

    }

    async getAssignedIssues() {

        return this._issues({ assigned_to_id: "me" });

    }

    async getAuthoredIssues() {

        return this._issues({ author_id: "me" });

    }

    async getWatchedIssues() {

        return this._issues({ watcher_id: "me" });

    }

    async getDashboard() {

        const [
            assigned,
            authored,
            watched,
            statuses,
            priorities
        ] = await Promise.all([
            this.getAssignedIssues(),
            this.getAuthoredIssues(),
            this.getWatchedIssues(),
            this.getIssueStatuses(),
            this.getIssuePriorities()
        ]);

        return {

            assigned,
            authored,
            watched,
            statuses,
            priorities,
            all: [
                ...new Map(
                    [
                        ...assigned,
                        ...authored,
                        ...watched
                    ].map(issue => [issue.id, issue])
                ).values()
            ]

        };

    }

    async getIssue(issueId) {

        const response = await this._get(
            `/issues/${issueId}.json`,
            { include: "journals" }
        );

        return response.data.issue;

    }

    async getIssueStatuses() {

        const response = await this._get("/issue_statuses.json");

        return response.data.issue_statuses;

    }

    // Приоритеты приходят в порядке, заданном в Redmine (от низкого к высокому).
    async getIssuePriorities() {

        try {

            const response = await this._get("/enumerations/issue_priorities.json");

            return response.data.issue_priorities || [];

        } catch (ex) {

            // На старых версиях Redmine справочника может не быть - это не критично.
            return [];

        }

    }

    async getTimeEntryActivities() {

        const response = await this._get("/enumerations/time_entry_activities.json");

        return response.data.time_entry_activities || [];

    }

    async updateIssue(issueId, fields) {

        await this._request(() => this.http.put(
            `/issues/${issueId}.json`,
            { issue: fields }
        ));

        return true;

    }

    async updateIssueStatus(issueId, statusId) {

        return this.updateIssue(issueId, { status_id: statusId });

    }

    async addIssueComment(issueId, notes) {

        return this.updateIssue(issueId, { notes });

    }

    async addTimeEntry(issueId, { hours, activityId, comments, spentOn }) {

        const entry = {
            issue_id: issueId,
            hours
        };

        if (activityId)
            entry.activity_id = activityId;

        if (comments)
            entry.comments = comments;

        if (spentOn)
            entry.spent_on = spentOn;

        await this._request(() => this.http.post(
            "/time_entries.json",
            { time_entry: entry }
        ));

        return true;

    }

}

module.exports = RedmineClient;
module.exports.RedmineError = RedmineError;
module.exports.normalizeError = normalizeError;
