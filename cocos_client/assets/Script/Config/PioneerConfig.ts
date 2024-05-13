import { resources } from "cc";
import CLog from "../Utils/CLog";
import { PioneerConfigData } from "../Const/PioneerDefine";

export default class PioneerConfig {
    public static getAll(): PioneerConfigData[] {
        const items: PioneerConfigData[] = [];
        for (const key in this._confs) {
            items.push(this._confs[key]);
        }
        return items;
    }
    public static getById(id: string): PioneerConfigData {
        if (this._confs[id] == null) {
            return null;
        }
        return this._confs[id];
    }

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/map_pioneer", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("PioneerConfig init error");
            return false;
        }

        this._confs = obj;
        CLog.debug("PioneerConfig init success", this._confs);
        return true;
    }
    private static _confs: { [index: string]: PioneerConfigData } = {};
}
