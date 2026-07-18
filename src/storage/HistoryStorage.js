const Store = require("electron-store");


class HistoryStorage {


    constructor() {

        this.store = new Store({

            name: "history"

        });

    }


    get(issueId) {

        return this.store.get(
            String(issueId)
        );

    }


    set(issueId, data) {

        this.store.set(
            String(issueId),
            data
        );

    }


    clear() {

        this.store.clear();

    }

}


module.exports = new HistoryStorage();