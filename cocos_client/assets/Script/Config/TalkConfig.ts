import { resources } from "cc";
import { TalkConfigData } from "../Const/Talk";
import CLog from "../Utils/CLog";

export default class TalkConfig {
    private static _confs: { [index: string]: TalkConfigData } = {};

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/talk", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("TalkConfig init error");
            return false;
        }

        this._confs = obj;
        CLog.debug("TalkConfig init success", this._confs);
        return true;
    }

    public static getById(talkId: string): TalkConfigData | null {
        if (talkId in this._confs) {
            return this._confs[talkId];
        }
        CLog.error(`TalkConfig getById error, config[${talkId}] not exist`);
        return null;
    }
}
