import { resources } from "cc";
import { FinishedEvent } from "../Const/UserInfoDefine";
import TaskModel from "../Const/TaskDefine";
import TaskConfig from "../Config/TaskConfig";

export default class TaskMgr {

    public getTasks(taskIds: string[]): any[] {
        // const taskInfos = [];
        // for (const temple of this._taskInfos) {
        //     if (taskIds.indexOf(temple.id) != -1) {
        //         taskInfos.push(temple);
        //     }
        // }
        // return taskInfos;
        return [];
    }
    public getTaskById(id: string) {
        // for (const task of this._taskInfos) {
        //     if (task.id == id) {
        //         return task;
        //     }
        // }
        return null;
    }
    public getTaskByBuilding(buildingId: string, gettedTaskIds: string[], finishedEvents: FinishedEvent[]): void {
        // for (const task of this._taskInfos) {
        //     if (gettedTaskIds.indexOf(task.id) != -1) {
        //         continue;
        //     }
        //     if (task.entrypoint == null) {
        //         continue;
        //     }
        //     const entry = task.entrypoint.type.split("|");
        //     if (entry.length == 2 &&
        //         entry[0] === "talkwithbuilding" &&
        //         entry[1] === buildingId) {
        //         let meetCond: boolean = true;
        //         for (const cond of task.condshow) {
        //             if (finishedEvents.indexOf(cond) == -1) {
        //                 meetCond = false;
        //                 break;
        //             }
        //         }
        //         if (task.condhide != null) {
        //             // force hide task
        //             for (const cond of task.condhide) {
        //                 if (finishedEvents.indexOf(cond) != -1) {
        //                     meetCond = false;
        //                     break;
        //                 }
        //             }
        //         }
        //         if (meetCond) {
        //             return task;
        //         }
        //     }
        // }
        return null;
    }
    public getTaskByNpcId(npcid: string, npcIsFriend: boolean, npcHideTaskIds: string[], gettedTaskIds: string[], finishedEvents: FinishedEvent[]) {
        // if (!npcIsFriend) {
        //     return null;
        // }
        // for (const task of this._taskInfos) {
        //     if (npcHideTaskIds.indexOf(task.id) != -1) {
        //         continue;
        //     }
        //     if (gettedTaskIds.indexOf(task.id) != -1) {
        //         continue;
        //     }
        //     if (task.entrypoint == null) {
        //         continue;
        //     }
        //     const entry = task.entrypoint.type.split("|");
        //     if (entry.length == 2 &&
        //         entry[0] === "talkwithnpc" &&
        //         entry[1] === npcid) {
        //         let meetCond: boolean = true;
        //         for (const cond of task.condshow) {
        //             if (finishedEvents.indexOf(cond) == -1) {
        //                 meetCond = false;
        //                 break;
        //             }
        //         }
        //         if (task.condhide != null) {
        //             // force hide task
        //             for (const cond of task.condhide) {
        //                 if (finishedEvents.indexOf(cond) != -1) {
        //                     meetCond = false;
        //                     break;
        //                 }
        //             }
        //         }
        //         if (meetCond) {
        //             return task;
        //         }
        //     }
        // }
        return null;
    }


    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private _localKey: string = "local_task";
    private _taskInfos: TaskModel[] = [];
    private async _initData() {
        let localData = null;
        if (localStorage.getItem(this._localKey) != null) {
            localData = JSON.parse(localStorage.getItem(this._localKey));
        }
        if (localData != null) {
            for (const temple of localData) {
                const model = new TaskModel();
                model.convertLocalDataToModel(temple);
                this._taskInfos.push(model);
            }
        } else {
            const config = TaskConfig.getAll();
            for (const key in config) {
                if (Object.prototype.hasOwnProperty.call(config, key)) {
                    const element = config[key];
                    const model = new TaskModel();
                    model.convertConfigToModel(element);
                    this._taskInfos.push(model);
                }
            }
        }
        console.log("exce taskData:", this._taskInfos);
    }
}