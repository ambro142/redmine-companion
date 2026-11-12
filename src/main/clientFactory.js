const settings = require("../storage/SettingsService");
const RedmineClient = require("../api/RedmineClient");

// Один способ создать клиента для активного профиля - вместо копипасты в каждом IPC.
function createClient() {

    return new RedmineClient(
        settings.get("serverUrl"),
        settings.get("apiKey"),
        {
            allowSelfSigned: !!settings.get("allowSelfSigned"),
            proxyUrl: settings.get("proxyUrl") || "",
            maxIssues: settings.get("maxIssues")
        }
    );

}

module.exports = { createClient };
