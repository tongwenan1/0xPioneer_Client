import { resources } from "cc";
import CLog from "../Utils/CLog";
import { ConfigInnerBuildingLevelUpData } from "../Const/BuildingDefine";

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
            let d = {};
            for (var key in jd) {
                d[key] = jd[key];
            }
            this._confs[id] = d as ConfigInnerBuildingLevelUpData;
        }
        CLog.debug("InnerBuildingLvlUpConfig init success", this._confs);
        return true;
    }

    public static getByLevel(level: number): ConfigInnerBuildingLevelUpData {
        if (level.toString() in this._confs) {
            return this._confs[level.toString()];
        };
        CLog.error(`InnerBuildingLvlUpConfig getByBuildingType error, config[${level.toString()}] not exist`);
        return null;
    }
}
