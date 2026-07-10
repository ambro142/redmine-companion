const { app } = require("electron");
const { createWindow } = require("./window");

app.whenReady().then(() => {

    createWindow();

});

app.on("window-all-closed", () => {

    if (process.platform !== "darwin")
        app.quit();

});