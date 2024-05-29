import { Vec2 } from "cc";
import CLog from "../../Utils/CLog";
import NetGlobalData from "./Data/NetGlobalData";

export class EraseShadowDataMgr {
    private _data: Vec2[];
    private _baseKey: string = "erase_shadow";
    private _key: string = "";

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

    public async saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
    }


    private _initData() {
        if (NetGlobalData.shadows == null) {
            return;
        }
        this._data = [];
        const shadows = NetGlobalData.shadows;
        for (let i = 0; i < shadows.length; i++) {
            this._data.push(new Vec2(shadows[i].x, shadows[i].y));
        }
    }
}
