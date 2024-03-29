import { EventTarget } from "cc";
import { NotificationName } from "../Const/Notification";

export default class NotificationMgr {
    private static _eventTarget: EventTarget = new EventTarget();
    public static addListener<T extends (...any: any[]) => void>(ev: NotificationName, func: T, target: any) {
        this._eventTarget.on(ev, func, target);
    }

    public static removeListener<T extends (...any: any[]) => void>(ev: NotificationName, func: T, target: any) {
        this._eventTarget.off(ev, func, target);
    }

    public static triggerEvent(ev: NotificationName, param: any = null) {
        this._eventTarget.emit(ev, param);
    }
}
