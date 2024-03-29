import { resources } from "cc";
import { EventConfigData } from "../Const/Event";
import CLog from "../Utils/CLog";

export default class EventConfig {
    private static _confs: EventConfigData[] = [];

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/event", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("EventConfig init error");
            return false;
        }

        for (const key in obj) {
            this._confs.push(obj[key]);
        }
        CLog.debug("EventConfig init success", this._confs);
        return true;
    }

    public static getById(dropId: string): EventConfigData | null {
        const findConf = this._confs.filter((conf) => {
            return conf.id === dropId;
        });
        if (findConf.length > 0) {
            return findConf[0];
        }
        return null;
    }

    public static getRewards(eventId: string): { id: string; num: number }[] {
        const event: { reward: any } = this._confs.find((event) => event.id == eventId);
        if (!event.reward) {
            return [];
        }

        return event.reward
            .filter((item: any) => item != null)
            .filter(([type, _id, _num]) => type == 1)
            .map(([_type, id, num]) => ({ id: id, num: num }));
    }
}
