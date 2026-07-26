let instance = null;

module.exports = {

    set(tray) {
        instance = tray;
    },

    get() {
        return instance;
    }

};
