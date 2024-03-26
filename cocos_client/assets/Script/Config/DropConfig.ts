import { resources } from "cc";
import { DropConfigData } from "../Const/Drop";
import CLog from "../Utils/CLog";

export default class DropConfig {
    private static _confs: DropConfigData[] = [];

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/drop", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("DropConfig init error");
            return false;
        }

        for (const key in obj) {
            this._confs.push(obj[key]);
        }
        CLog.debug("DropConfig init success", this._confs);
        return true;
    }

    public static getById(dropId: string): DropConfigData | null {
        const findConf = this._confs.filter((conf) => {
            return conf.id === dropId;
        });
        if (findConf.length > 0) {
            return findConf[0];
        }
        return null;
    }
}
