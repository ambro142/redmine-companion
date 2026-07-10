const axios = require("axios");

class RedmineClient {

    constructor(serverUrl, apiKey){

        this.serverUrl = serverUrl.replace(/\/$/, "");

        this.apiKey = apiKey;

        this.http = axios.create({

            baseURL: this.serverUrl,

            headers:{

                "X-Redmine-API-Key":this.apiKey

            },

            timeout:10000

        });

    }

    async testConnection(){

        const response = await this.http.get("/users/current.json");

        return response.data;

    }

}

module.exports = RedmineClient;