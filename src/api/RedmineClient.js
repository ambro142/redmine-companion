const axios = require("axios");

class RedmineClient {

    constructor(serverUrl, apiKey) {

        this.serverUrl = serverUrl.replace(/\/$/, "");
        this.apiKey = apiKey;

        this.http = axios.create({

            baseURL: this.serverUrl,

            timeout: 10000,

            headers: {

                "X-Redmine-API-Key": this.apiKey,

                "Content-Type": "application/json"

            }

        });

    }

    async getCurrentUser() {

        const response = await this.http.get("/users/current.json");

        return response.data.user;

    }

    async getMyIssues(limit = 100) {

        const response = await this.http.get("/issues.json", {

            params: {

                assigned_to_id: "me",

                status_id: "*",

                limit

            }

        });

        return response.data.issues;

    }

    async testConnection() {

        await this.getCurrentUser();

        return true;

    }

       async getServerInfo() {

       const start = Date.now();

       const response = await this.http.get("/users/current.json");

       const latency = Date.now() - start;

       return {

           latency: latency,
           user: response.data.user

       };

   }

   async getMyIssues(limit = 100) {

        const response = await this.http.get("/issues.json", {

            params: {

                assigned_to_id: "me",
                status_id: "*",
                limit

            }

        });

        return response.data.issues;

    }
    
    async getProjects() {

        const response = await this.http.get("/projects.json");

        return response.data.projects;

    }

    async getAssignedIssues(limit = 100) {

        const response = await this.http.get("/issues.json", {

            params: {
                assigned_to_id: "me",
                status_id: "*",
                limit
            }

        });

        return response.data.issues;

    }

    async getAuthoredIssues(limit = 100) {

        const response = await this.http.get("/issues.json", {

            params: {
                author_id: "me",
                status_id: "*",
                limit
            }

        });

        return response.data.issues;

    }

    async getWatchedIssues(limit = 100) {

        const response = await this.http.get("/issues.json", {

            params: {
                watcher_id: "me",
                status_id: "*",
                limit
            }

        });

        return response.data.issues;

    }

    async getDashboard() {

        const [

            assigned,

            authored,

            watched,

            statuses

        ] = await Promise.all([

            this.getAssignedIssues(),

            this.getAuthoredIssues(),

            this.getWatchedIssues(),
            this.getIssueStatuses()

        ]);

        return {

            assigned,
            authored,
            watched,
            statuses,
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

    async getIssue(issueId){
        const response = await this.http.get(
            `/issues/${issueId}.json`,
            {
                params: {
                    include: "journals"
                }
            }
        );

        return response.data.issue;

    }

    async getIssueStatuses() {

        const response =
            await this.http.get(
                "/issue_statuses.json"
            );

        return response.data.issue_statuses;

    }
}

module.exports = RedmineClient;