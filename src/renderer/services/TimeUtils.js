class TimeUtils {

    // "1.5", "1,5", "1:30", "1h30m", "1ч 30м", "90m", "45м", "2h" -> часы (число) или null
    static parseHours(input) {

        if (input === null || input === undefined)
            return null;

        const text = String(input).trim().toLowerCase().replace(",", ".");

        if (text === "")
            return null;

        let hours = null;

        let m;

        if ((m = /^(\d{1,3}):([0-5]?\d)$/.exec(text))) {

            hours = Number(m[1]) + Number(m[2]) / 60;

        } else if ((m = /^(?:(\d+(?:\.\d+)?)\s*(?:h|ч))?\s*(?:(\d+(?:\.\d+)?)\s*(?:m|м|min|мин))?$/.exec(text)) && (m[1] || m[2])) {

            hours = Number(m[1] || 0) + Number(m[2] || 0) / 60;

        } else if (/^\d+(?:\.\d+)?$/.test(text)) {

            hours = Number(text);

        }

        if (hours === null || !Number.isFinite(hours) || hours <= 0 || hours > 24)
            return null;

        return Math.round(hours * 100) / 100;

    }

    // Секунды -> "ЧЧ:ММ:СС"
    static formatElapsed(ms) {

        const total = Math.max(0, Math.floor(ms / 1000));

        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;

        const two = n => String(n).padStart(2, "0");

        return two(h) + ":" + two(m) + ":" + two(s);

    }

    // Затраченное время в часах с шагом 0.05 ч (3 минуты), минимум 0.05
    static elapsedToHours(ms) {

        const hours = ms / 3600000;

        return Math.min(24, Math.max(0.05, Math.round(hours * 20) / 20));

    }

}

window.TimeUtils = TimeUtils;
