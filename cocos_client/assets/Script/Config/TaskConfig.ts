import { resources } from "cc";
import CLog from "../Utils/CLog";
import { TaskConfigData } from "../Const/TaskDefine";

export default class TaskConfig {
    private static _confs: { [index: string]: TaskConfigData } = {};

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/task", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("TaskConfig init error");
            return false;
        }

        this._confs = obj;
        CLog.debug("TaskConfig init success", this._confs);
        return true;
    }

    public static getAll(): { [index: string]: TaskConfigData } {
        return this._confs;
    }
    public static getById(taskId: string): TaskConfigData | null {
        if (taskId in this._confs) {
            return this._confs[taskId];
        }
        CLog.error(`TaskConfig getById error, config[${taskId}] not exist`);
        return null;
    }
}
