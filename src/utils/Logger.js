class Logger{

    static info(...args){

        console.log("[INFO]",...args);

    }

    static error(...args){

        console.error("[ERROR]",...args);

    }

}
module.exports = Logger;