// Простой таймер для списания времени. Запущенные таймеры переживают перезапуск
// приложения (хранятся в localStorage отдельно для каждого профиля).
class TimerService {

    constructor(profileId = "default") {

        this.setProfile(profileId);

    }

    setProfile(profileId) {

        this.key = "timers:" + profileId;
        this.timers = this._load();

    }

    _load() {

        try {

            const data = JSON.parse(localStorage.getItem(this.key) || "{}");

            return data && typeof data === "object" ? data : {};

        } catch (ex) {

            return {};

        }

    }

    _save() {

        try {
            localStorage.setItem(this.key, JSON.stringify(this.timers));
        } catch (ex) {
            // не критично
        }

    }

    isRunning(issueId) {

        return this.timers[issueId] !== undefined;

    }

    startedAt(issueId) {

        return this.timers[issueId] || null;

    }

    start(issueId) {

        if (!this.isRunning(issueId)) {

            this.timers[issueId] = Date.now();
            this._save();

        }

    }

    // Останавливает таймер и возвращает прошедшее время в миллисекундах
    stop(issueId) {

        const started = this.timers[issueId];

        if (started === undefined)
            return 0;

        delete this.timers[issueId];
        this._save();

        return Date.now() - started;

    }

    cancel(issueId) {

        delete this.timers[issueId];
        this._save();

    }

}

window.TimerService = TimerService;
