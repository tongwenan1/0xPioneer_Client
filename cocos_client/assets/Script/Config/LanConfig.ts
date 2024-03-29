import { resources } from "cc";
import { LanConfigData } from "../Const/Lan";
import CLog from "../Utils/CLog";

export default class LanConfig {
    private static _confs: { [index: string]: LanConfigData } = {};

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/lan", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("LanConfig init error");
            return false;
        }

        this._confs = obj;
        CLog.debug("LanConfig init success", this._confs);
        return true;
    }

    public static getById(lanId: string): LanConfigData | null {
        if (lanId in this._confs) {
            return this._confs[lanId];
        }
        console.error(`LanConfig getById error, config[${lanId}] not exist`);
        return null;
    }
}
