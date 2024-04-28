import { resources } from "cc";
import CLog from "../Utils/CLog";
import { WorldBoxConfigData } from "../Const/WorldBoxDefine";

export default class WorldBoxConfig {
    private static _confs: WorldBoxConfigData[] = [];

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/world_box", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("WorldBoxConfig init error");
            return false;
        }

        for (const key in obj) {
            this._confs.push(obj[key]);
        }
        CLog.debug("WorldBoxConfig init success", this._confs);
        return true;
    }

    public static getByDayAndRank(day: number, rank: number): WorldBoxConfigData[] {
        return this._confs.filter((conf) => conf.day === day && conf.rank === rank);
    }
}
