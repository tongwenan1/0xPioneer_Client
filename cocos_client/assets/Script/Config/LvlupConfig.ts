import { resources } from "cc";
import { LvlupConfigData } from "../Const/Lvlup";
import CLog from "../Utils/CLog";

export default class LvlupConfig {
    private static _confs: LvlupConfigData[] = [];
    private static _extras: { [index: string]: number } = {};
    private static _hpmaxs: { [index: string]: number } = {};
    private static _visions: { [index: string]: number } = {};

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/lvlup", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("LvlupConfig init error");
            return false;
        }

        for (const key in obj) {
            this._confs.push(obj[key]);
        }

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

            const conf = obj[lvlStr] as LvlupConfigData;
            this._extras[lvlStr] = conf.extra_res;
            this._hpmaxs[lvlStr] = conf.hp_max;
            this._visions[lvlStr] = conf.city_vision;

            if (Number(lvlStr) > 1) {
                let preLvStr = (Number(lvlStr) - 1).toString();
                this._extras[lvlStr] += this._extras[preLvStr];
                this._hpmaxs[lvlStr] += this._hpmaxs[preLvStr];
                this._visions[lvlStr] += this._visions[preLvStr];
            }
        }

        CLog.debug("LvlupConfig init success", this._confs);
        return true;
    }

    public static getById(lvlId: string): LvlupConfigData | null {
        const findConf = this._confs.filter((conf) => {
            return conf.id === lvlId;
        });
        if (findConf.length > 0) {
            return findConf[0];
        }
        return null;
    }

    public static getTotalExtraRateByLvl(lvl: number) {
        const lvlStr = lvl.toString();
        return this._extras[lvlStr] != undefined ? this._extras[lvlStr] : 0.0;
    }
    public static getTotalHpMaxByLvl(lvl: number) {
        const lvlStr = lvl.toString();
        return this._hpmaxs[lvlStr] != undefined ? this._hpmaxs[lvlStr] : 0;
    }
    public static getTotalVisionByLvl(lvl: number) {
        const lvlStr = lvl.toString();
        return this._visions[lvlStr] != undefined ? this._visions[lvlStr] : 0;
    }
}
