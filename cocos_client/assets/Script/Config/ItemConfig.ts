import { resources } from "cc";
import { ItemConfigData } from "../Const/Item";
import CLog from "../Utils/CLog";

export default class ItemConfig {
    private static _confs: { [index: string]: ItemConfigData } = {};

    public static async init(): Promise<boolean> {
        // read artifact config
        const obj = await new Promise((resolve) => {
            resources.load("data_local/artifact", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });

        if (!obj) {
            CLog.error("ItemConfig init error");
            return false;
        }

        // format config
        let jsonObj = obj as object;

        for (var id in jsonObj) {
            let jd = jsonObj[id];
            let d = new ItemConfigData();
            for (var key in jd) {
                if (!d.hasOwnProperty(key)) {
                    continue;
                }
                d[key] = jd[key];
            }
            d.configId = jd.id;
            this._confs[id] = d;
        }
        CLog.debug("ItemConfig init success", this._confs);
        return true;
    }

    public static getById(artifactConfigId: string): ItemConfigData | null {
        if (artifactConfigId in this._confs) {
            return this._confs[artifactConfigId];
        }
        CLog.error(`ItemConfig getById error, config[${artifactConfigId}] not exist`);
        return null;
    }
}
