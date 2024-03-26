import { resources } from "cc";
import { BoxInfoConfigData } from "../Const/BoxInfo";
import CLog from "../Utils/CLog";

export default class BoxInfoConfig {
    private static _confs: BoxInfoConfigData[] = [];

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/box_info", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("BoxInfoConfig init error");
            return false;
        }

        for (const key in obj) {
            this._confs.push(obj[key]);
        }
    }

    public static getById(boxId: string): BoxInfoConfigData | null {
        const findConf = this._confs.filter((conf) => {
            return conf.id === boxId;
        });
        if (findConf.length > 0) {
            return findConf[0];
        }
        return null;
    }

    public static getAllBox(): BoxInfoConfigData[] {
        return this._confs;
    }
}
