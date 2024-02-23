import { resources } from "cc";

export default class ConfigMgr {

    public getConfigById(configId: string) {
        return this._configs.filter((config)=> {
            return config.id == configId;
        });
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new ConfigMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private static _instance: ConfigMgr = null;
    private _configs: any = {};
    private async _initData() {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/config", (err: Error, data: any) => {
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