import { resources } from "cc";

export default class LvlupMgr {

    public getConfigByLvl(lvl: number) {
        return this._configs.filter((config)=> {
            return config.id == lvl.toString();
        });
    }
    public getTotalExtraRateByLvl(lvl: number) {
        const lvlStr = lvl.toString();
        return this._extras[lvlStr] != undefined ? this._extras[lvlStr] : 0.0;
    }
    public getTotalHpMaxByLvl(lvl: number) {
        const lvlStr = lvl.toString();
        return this._hpmaxs[lvlStr] != undefined ? this._hpmaxs[lvlStr] : 0;
    }
    public getTotalVisionByLvl(lvl: number) {
        const lvlStr = lvl.toString();
        return this._visions[lvlStr] != undefined ? this._visions[lvlStr] : 0;
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
    private _configs: any = [];
    private _extras: any = {};
    private _hpmaxs: any = {};
    private _visions: any = {};

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

        
        this._extras = {};
        this._hpmaxs = {};
        this._visions = {};
        const keys = Object.keys(obj);
        keys.sort((a, b) => {
            let na = Number(a);
            let nb = Number(b);
            if (na > nb) return 1;
            if (na < nb) return -1;
            return 0;
        });

        for (let i = 0; i < keys.length; i++) {
            const lvlStr = keys[i];
            
            const extra = obj[lvlStr].extra_res;
            const hpmax = obj[lvlStr].hp_max;
            const vision = obj[lvlStr].city_vision;

            this._extras[lvlStr] = extra;
            this._hpmaxs[lvlStr] = hpmax;
            this._visions[lvlStr] = vision;

            if (Number(lvlStr) > 1) {
                let preLvlStr = (Number(lvlStr) - 1).toString();
                this._extras[lvlStr] += this._extras[preLvlStr];
                this._hpmaxs[lvlStr] += this._hpmaxs[preLvlStr];
                this._visions[lvlStr] += this._visions[preLvlStr];
            }
        }


    }
}