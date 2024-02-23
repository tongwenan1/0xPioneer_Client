import { resources } from "cc";
import { FinishedEvent } from "./UserInfoMgr";

export default class TaskMgr {

    public getTasks(taskIds: string[]): any[] {
        const taskInfos = [];
        for (const temple of this._taskInfos) {
            if (taskIds.indexOf(temple.id) != -1) {
                taskInfos.push(temple);
            }
        }
        return taskInfos;
    }
    public getTaskById(id: string) {
        for (const task of this._taskInfos) {
            if (task.id == id) {
                return task;
            }
        }
        return null;
    }
    public getTaskByBuilding(buildingId: string, gettedTaskIds: string[], finishedEvents: FinishedEvent[]): void {
        for (const task of this._taskInfos) {
            if (gettedTaskIds.indexOf(task.id) != -1) {
                continue;
            }
            if (task.entrypoint == null) {
                continue;
            }
            const entry = task.entrypoint.type.split("|");
            if (entry.length == 2 &&
                entry[0] === "talkwithbuilding" &&
                entry[1] === buildingId) {
                let meetCond: boolean = true;
                for (const cond of task.condshow) {
                    if (finishedEvents.indexOf(cond) == -1) {
                        meetCond = false;
                        break;
                    }
                }
                if (task.condhide != null) {
                    // force hide task
                    for (const cond of task.condhide) {
                        if (finishedEvents.indexOf(cond) != -1) {
                            meetCond = false;
                            break;
                        }
                    }
                }
                if (meetCond) {
                    return task;
                }
            }
        }
        return null;
    }
    public getTaskByNpcId(npcid: string, npcIsFriend: boolean, npcHideTaskIds: string[], gettedTaskIds: string[], finishedEvents: FinishedEvent[]) {
        if (!npcIsFriend) {
            return null;
        }
        for (const task of this._taskInfos) {
            if (npcHideTaskIds.indexOf(task.id) != -1) {
                continue;
            }
            if (gettedTaskIds.indexOf(task.id) != -1) {
                continue;
            }
            if (task.entrypoint == null) {
                continue;
            }
            const entry = task.entrypoint.type.split("|");
            if (entry.length == 2 &&
                entry[0] === "talkwithnpc" &&
                entry[1] === npcid) {
                let meetCond: boolean = true;
                for (const cond of task.condshow) {
                    if (finishedEvents.indexOf(cond) == -1) {
                        meetCond = false;
                        break;
                    }
                }
                if (task.condhide != null) {
                    // force hide task
                    for (const cond of task.condhide) {
                        if (finishedEvents.indexOf(cond) != -1) {
                            meetCond = false;
                            break;
                        }
                    }
                }
                if (meetCond) {
                    return task;
                }
            }
        }
        return null;
    }


    public static get Instance() {
        if (!this._instance) {
            this._instance = new TaskMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private static _instance: TaskMgr = null;
    private _taskInfos: any[] = [];
    private async _initData() {
        const obj = await new Promise((resolve) => {
            resources.load("data_local/task_info", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        })
        if (obj != null) {
            this._taskInfos = obj as [];
        }
    }
}