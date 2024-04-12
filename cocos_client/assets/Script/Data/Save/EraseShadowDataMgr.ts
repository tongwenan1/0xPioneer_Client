import { Vec2 } from "cc";

export class EraseShadowDataMgr {
    private _data: Vec2[];
    private _key: string = "erase_shadow";

    public async loadObj() {
        if (this._data == null) {
            this._data = [];
            const data = localStorage.getItem(this._key);
            if (data) {
                for (const vec of JSON.parse(data)) {
                    this._data.push(new Vec2(vec.x, vec.y));
                }
            }
        }
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
}
