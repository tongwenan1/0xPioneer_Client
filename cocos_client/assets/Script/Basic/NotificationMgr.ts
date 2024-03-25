export default class NotificationMgr {
    public registerNotificaiton(observer: any, notificationName: string, callback: Function) {
        if (this._observers.has(observer)) {
            this._observers.get(observer).push({ notificationName: notificationName, callback: callback });
        } else {
            this._observers.set(observer, [{ notificationName: notificationName, callback: callback }]);
        }
    }
    public removeNotificaition(observer: any, notificationName: string) {
        if (this._observers.has(observer)) {
            for (let i = 0; i < this._observers.get(observer).length; i++) {
                if (this._observers.get(observer)[i].notificationName == notificationName) {
                    this._observers.get(observer).splice(i, 1);
                    break;
                }
            }
            if (this._observers.get(observer).length == 0) {
                this._observers.delete(observer);
            }
        }
    }
    public removeAllNotificaition(observer: any) {
        if (this._observers.has(observer)) {
            this._observers.delete(observer);
        }
    }
    public notify(notificationName: string, data: any) {
        this._observers.forEach((value: { notificationName: string, callback: Function}[], key: any)=> {
            for (const temple of value) {
                if (temple.notificationName == notificationName) {
                    temple.callback.call(key, data);
                }
            }
        });
    }

    private _observers: Map<any, { notificationName: string, callback: Function}[]> = null;
    public constructor() {
        this._observers = new Map();
    }
}