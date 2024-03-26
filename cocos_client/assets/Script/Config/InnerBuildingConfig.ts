import { resources } from "cc";
import CLog from "../Utils/CLog";
import { ConfigInnerBuildingData, InnerBuildingType } from "../Const/BuildingDefine";

export default class InnerBuildingConfig {
    private static _confs: { [index: string]: ConfigInnerBuildingData } = {};

    public static async init(): Promise<boolean> {
        // read artifact config
        const obj = await new Promise((resolve) => {
            resources.load("data_local/inner_building", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });

        if (!obj) {
            CLog.error("InnerBuildingConfig init error");
            return false;
        }

        // format config
        let jsonObj = obj as object;

        for (var id in jsonObj) {
            let jd = jsonObj[id];
            let d = {};
            for (var key in jd) {
                if (!d.hasOwnProperty(key)) {
                    continue;
                }
                d[key] = jd[key];
            }
            this._confs[id] = d as ConfigInnerBuildingData;
        }
        CLog.debug("InnerBuildingConfig init success", this._confs);
        return true;
    }

    public static getByBuildingType(type: InnerBuildingType): ConfigInnerBuildingData {
        if (type in this._confs) {
            return this._confs[type];
        }
        CLog.error(`InnerBuildingConfig getByBuildingType error, config[${type}] not exist`);
        return null;
    }
}
