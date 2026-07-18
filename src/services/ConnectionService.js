class ConnectionService {

    async test() {

        return await window.api.testConnection();

    }

}

module.exports = new ConnectionService();