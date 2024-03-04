import { resources } from "cc";

export default class LvlupMgr {

    public getConfigByLvl(lvl: number) {
        return this._configs.filter((config)=> {
            return config.id == lvl.toString();
        });
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new LvlupMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private static _instance: LvlupMgr = null;
    private _configs: any = {};
    private async _initData() {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/lvlup", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        })
        this._configs = [];
        for (const key in obj) {
            this._configs.push(obj[key]);
        }
    }
}