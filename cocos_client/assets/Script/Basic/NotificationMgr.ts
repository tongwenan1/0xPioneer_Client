import { EventTarget } from 'cc';

export default class NotificationMgr {
    private static _eventTarget: EventTarget = new EventTarget();
    public static addListener<T extends (...any: any[]) => void>(ev: string, func: T, target: any) {
        console.log("exce >>", this._eventTarget);
        this._eventTarget.on(ev, func, target);
    }

    public static removeListener<T extends (...any: any[]) => void>(ev: string, func: T, target: any) {
        this._eventTarget.off(ev, func, target);
    }

    public static triggerEvent(ev: string, param: any = null) {
        this._eventTarget.emit(ev, param);
    }
}
