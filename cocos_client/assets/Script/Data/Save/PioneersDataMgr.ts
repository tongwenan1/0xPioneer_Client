import { share } from "../../Net/msg/WebsocketMsg";

export class PioneersDataMgr {
    private _pioneers: share.Ipioneer_info[] = [];

    public get getAll() {
        return this._pioneers;
    }

    public add(pioneer: share.Ipioneer_info) {
        this._pioneers.push(pioneer);
    }
}
