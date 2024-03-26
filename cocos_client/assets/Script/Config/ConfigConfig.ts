import { resources } from "cc";
import { ConfigConfigData } from "../Const/Config";
import CLog from "../Utils/CLog";

export default class ConfigConfig {
    private static _confs: ConfigConfigData[] = [];

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/config", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("ConfigConfig init error");
            return false;
        }

        for (const key in obj) {
            this._confs.push(obj[key]);
        }
        CLog.debug("ConfigConfig init success", this._confs);
        return true;
    }

    public static getById(configId: string): ConfigConfigData | null {
        const findConf = this._confs.filter((conf) => {
            return conf.id === configId;
        });
        if (findConf.length > 0) {
            return findConf[0];
        }
        return null;
    }
}
