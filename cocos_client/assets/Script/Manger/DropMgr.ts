import { resources } from "cc";

export default class DropMgr {

    public getDropById(dropId: string) {
        return this._drops.filter((drop)=> {
            return drop.id == dropId;
        });
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new DropMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private static _instance: DropMgr = null;
    private _drops: any[] = null;
    private async _initData() {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/drop", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        })
        this._drops = [];
        for (const key in obj) {
            this._drops.push(obj[key]);
        }
    }
}