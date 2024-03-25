import { EventTarget } from 'cc';

export default class NotificationMgr {

    public addListener<T extends (...any: any[]) => void>(ev: string, func: T, target: any) {
        this._eventTarget.on(ev, func, target);
    }

    public removeListener<T extends (...any: any[]) => void>(ev: string, func: T, target: any) {
        this._eventTarget.off(ev, func, target);
    }

    public triggerEvent(ev: string, param: any = null) {
        this._eventTarget.emit(ev, param);
    }

    private _eventTarget: EventTarget = null;
    public constructor() {
        this._eventTarget = new EventTarget();
    }
}
