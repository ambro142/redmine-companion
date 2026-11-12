class ErrorUtils {

    // Электрон добавляет к тексту ошибки служебный префикс:
    //   "Error invoking remote method 'x': Error: ..."
    // А RedmineClient кладёт код в начало: "RC:AUTH|подробности".
    // Здесь превращаем это в понятный текст на языке интерфейса.
    static format(error) {

        let message = String((error && error.message) || error || "");

        message = message.replace(/^Error invoking remote method '[^']*':\s*/, "");
        message = message.replace(/^Error:\s*/, "");

        const match = /^RC:([A-Z_]+)(?:\|([\s\S]*))?$/.exec(message);

        if (!match)
            return message;

        const code = match[1];
        const detail = match[2] || "";

        const key = "error." + code;
        const text = I18nService.t(key, { detail });

        // Нет перевода - показываем хотя бы код
        if (text === key)
            return code + (detail ? ": " + detail : "");

        // Для отказа Redmine (422) добавляем причину, которую он вернул
        if (code === "VALIDATION" && detail)
            return text + ": " + detail;

        return text;

    }

}

window.ErrorUtils = ErrorUtils;
