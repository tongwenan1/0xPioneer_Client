import { resources } from "cc";
import CLog from "../Utils/CLog";
import { ConfigInnerBuildingLevelUpData, InnerBuildingPsycData, InnerBuildingType } from "../Const/BuildingDefine";

export default class InnerBuildingLvlUpConfig {
    private static _confs: { [index: string]: ConfigInnerBuildingLevelUpData } = {};

    public static async init(): Promise<boolean> {
        // read artifact config
        const obj = await new Promise((resolve) => {
            resources.load("data_local/inner_lvlup", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });

        if (!obj) {
            CLog.error("InnerBuildingLvlUpConfig init error");
            return false;
        }

        // format config
        let jsonObj = obj as object;

        for (var id in jsonObj) {
            let jd = jsonObj[id];
            let d: any = {};
            for (var key in jd) {
                d[key] = jd[key];
            }
            if (d.prefab_energy == null) {
                d.prefab_energy = "";
            }
            this._confs[id] = d as ConfigInnerBuildingLevelUpData;
        }
        return true;
    }

    public static getBuildingLevelData(level: number, key: string): any {
        if (level.toString() in this._confs) {
            const temple = this._confs[level.toString()];
            if (key in temple) {
                return temple[key];
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    public static getEnergyLevelData(level: number): InnerBuildingPsycData {
        if (level.toString() in this._confs) {
            const temple = this._confs[level.toString()];
            return {
                output: temple.psyc_output,
                storage: temple.psyc_storage,
                convert: temple.psyc_convert,
            }
        } else {
            return null;
        }
    }
}
