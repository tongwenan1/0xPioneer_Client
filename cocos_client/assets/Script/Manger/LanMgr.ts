import { resources } from "cc";
import { EventName } from "../Const/ConstDefine";
import NotificationMgr from "../Basic/NotificationMgr";

export default class LanMgr {

    private _language = "eng";

    public getLanById(id: string) {
        if (id in this._configs) {
            if (this._configs[id][this._language] != null) {
                return this._configs[id][this._language];    
            }
            console.log(`lan config error: id[${id}], lan[${this._language}]`);
            return "LanguageErr: language or text is missing =>" + id;
        }
        console.log(`lan config not exist: id[${id}], lan[${this._language}]`);
        return "LanguageErr: id does not exist =>" + id;
    }

    public replaceLanById(id: string, args: any[]) {
        let lan = this.getLanById(id);
        for (let i = 0; i < args.length; i++) {
            lan = lan.replace("%s", args[i]);
        }
        return lan;
    }

    public getLang(): string {
        return this._language;
    }
    public changeLang(lang: string) {
        this._language = lang;
        localStorage.setItem(this._localLanKey, lang);
        NotificationMgr.triggerEvent(EventName.CHANGE_LANG);
    }

    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private _configs: any = {};
    private _localLanKey: string = "local_lan";
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
        
        this._language = localStorage.getItem(this._localLanKey) == null ? "eng" : localStorage.getItem(this._localLanKey);
    }
}