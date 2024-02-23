import { resources } from "cc";

export default class BoxMgr {

    public getAllBox() {
        return this._boxData;
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new BoxMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private static _instance: BoxMgr = null;
    private _boxData: any[] = null;
    private async _initData() {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/box_info", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        })
        this._boxData = [];
        for (const key in obj) {
            this._boxData.push(obj[key]);
        }
    }
}