import { Vec2 } from "cc";
import CLog from "../../Utils/CLog";
import NetGlobalData from "./Data/NetGlobalData";

export class EraseShadowDataMgr {
    private _data: Vec2[];

    public constructor() {}

    public async loadObj() {
        this._initData();
    }

    public getObj() {
        return this._data;
    }

    public addObj(data: Vec2) {
        this._data.push(data);
    }

    private _initData() {
        this._data = [];
        if (NetGlobalData.shadows == null) {
            return;
        }
        const shadows = NetGlobalData.shadows;
        for (let i = 0; i < shadows.length; i++) {
            this._data.push(new Vec2(shadows[i].x, shadows[i].y));
        }
    }
}
