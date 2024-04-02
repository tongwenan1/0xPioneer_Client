import { resources } from "cc";
import CLog from "../Utils/CLog";
import { TaskConfigData, TaskStepConfigData } from "../Const/TaskDefine";

export default class TaskStepConfig {
    private static _confs: { [index: string]: TaskStepConfigData } = {};

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/task_steps", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("TaskStepConfig init error");
            return false;
        }

        this._confs = obj;
        CLog.debug("TaskStepConfig init success", this._confs);
        return true;
    }

    public static getById(taskStepId: string): TaskStepConfigData | null {
        if (taskStepId in this._confs) {
            return this._confs[taskStepId];
        }
        CLog.error(`TaskStepConfig getById error, config[${taskStepId}] not exist`);
        return null;
    }
}
