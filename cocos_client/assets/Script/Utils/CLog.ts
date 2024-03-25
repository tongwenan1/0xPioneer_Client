enum LOG_LEVEL {
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
}

export default class CLog {
    public static LOG_LEVEL = 1;

    public static debug(...data: any[]) {
        if (this.LOG_LEVEL <= LOG_LEVEL.DEBUG) console.log(...data);
    }

    public static info(...data: any[]) {
        if (this.LOG_LEVEL <= LOG_LEVEL.INFO) console.log(...data);
    }

    public static warn(...data: any[]) {
        if (this.LOG_LEVEL <= LOG_LEVEL.WARN) console.warn(...data);
    }

    public static error(...data: any[]) {
        if (this.LOG_LEVEL <= LOG_LEVEL.ERROR) console.error(...data);
    }
}
