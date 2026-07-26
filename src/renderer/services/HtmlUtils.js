class HtmlUtils {

    static escape(value) {

        if (value === null || value === undefined)
            return "";

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    }

}

window.HtmlUtils = HtmlUtils;
