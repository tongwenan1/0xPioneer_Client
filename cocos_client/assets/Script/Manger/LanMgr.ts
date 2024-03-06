import { resources } from "cc";
import { EventName } from "../Const/ConstDefine";
import EventMgr from "./EventMgr";

export default class LanMgr {

    private _language = "eng";

    public getLanById(id: string) {
        if (id in this._configs) {
            if (this._configs[id][this._language] != null) {
                return this._configs[id][this._language];    
            }
            console.log(`lan config error: id[${id}], lan[${this._language}]`);
            return id;
        }
        console.log(`lan config not exist: id[${id}], lan[${this._language}]`);
        return "";
    }

    public replaceLanById(id: string, args: any[]) {
        let lan = this.getLanById(id);
        for (let i = 0; i < args.length; i++) {
            lan = lan.replace("%s", args[i]);
        }
        return lan;
    }

    public changeLang(lang: string) {
        this._language = lang;
        EventMgr.emit(EventName.CHANGE_LANG);
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new LanMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private static _instance: LanMgr = null;
    private _configs: any = {};
    private async _initData() {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/lan", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        })
        this._configs = obj;
    }
}