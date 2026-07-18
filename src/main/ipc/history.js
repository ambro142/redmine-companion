const { ipcMain } = require("electron");

const history =
    require("../../storage/HistoryStorage");


function registerHistoryIpc(){


    ipcMain.handle(

        "history:get",

        (_, id)=>{

            return history.get(id);

        }

    );



    ipcMain.handle(

        "history:set",

        (_, id, data)=>{


            history.set(
                id,
                data
            );


            return true;

        }

    );


}


module.exports = {

    registerHistoryIpc

};