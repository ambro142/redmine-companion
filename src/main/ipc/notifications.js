const { ipcMain } = require("electron");
const NotificationService = require("../../services/NotificationService");

function registerNotificationIpc(){

    ipcMain.handle(

        "notification:show",

        (_,title,body)=>{

            NotificationService.show(

                title,

                body

            );

        }

    );

}

module.exports={

    registerNotificationIpc

};