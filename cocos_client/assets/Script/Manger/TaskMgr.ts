import { FinishedEvent } from "../Const/UserInfoDefine";
import TaskModel, { TaskAction, TaskActionType, TaskCondition, TaskConditionSatisfyType, TaskConditionType, TaskSatisfyCondition, TaskTalkCondition } from "../Const/TaskDefine";
import TaskConfig from "../Config/TaskConfig";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";

export default class TaskMgr {
    public talkSelected(talkId: string, talkSelectedIndex: number) {
        const con: TaskCondition = {
            type: TaskConditionType.Talk,
            talk: {
                talkId: talkId,
                talkSelectCanGetTaskIndex: talkSelectedIndex,
                cdTime: 0
            }
        }
        this._checkTask(con);
    }

    public getNpcTask(npcId: string): TaskModel | null {
        let useTask: TaskModel = null;
        for (const task of this._taskInfos) {
            if (task.preCon == null &&
                task.takeCon != null) {
                if (task.takeCon.satisfyType == TaskConditionSatisfyType.Any) {
                    for (const cond of task.takeCon.conditions) {
                        if (cond.type == TaskConditionType.Talk &&
                            cond.talk.talkId == npcId) {
                            useTask = task;
                            break;
                        }
                    }
                } else if (task.takeCon.satisfyType == TaskConditionSatisfyType.All) {
                    if (task.takeCon.conditions.length == 1 &&
                        task.takeCon.conditions[0].type == TaskConditionType.Talk &&
                        task.takeCon.conditions[0].talk.talkId == npcId) {
                        useTask = task;
                    }
                }
            }
            if (useTask != null) {
                break;
            }
        }
        return useTask;
    }

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

    private _checkTask(checkCon: TaskCondition) {
        for (const task of this._taskInfos) {
            if (task.isFinished) {
                continue;
            }
            if (task.isFailed) {
                continue;
            }
            if (!task.canGet) {
                continue;
            }
            if (task.failCon != null) {
                if (this._checkConditionIsSatisfy(task.failCon, checkCon)) {
                    task.isFailed = true;
                    task.failCon = null;
                    this._localSave();
                    NotificationMgr.triggerEvent(NotificationName.TASK_FAILED, task.taskId);
                    continue;
                }
            }
            if (task.closeCon != null) {
                if (this._checkConditionIsSatisfy(task.closeCon, checkCon)) {
                    task.canGet = false;
                    task.closeCon = null;
                    this._localSave();
                    NotificationMgr.triggerEvent(NotificationName.TASK_CANNOTGET, task.taskId);
                    continue;
                }
            }
            if (task.preCon != null) {
                if (this._checkConditionIsSatisfy(task.preCon, checkCon)) {
                    task.preCon = null;
                    this._localSave();
                    // do pre action
                    for (const action of task.preAction) {
                        this._doAction(action);
                    }
                    continue;
                }
            }
            if (task.takeCon != null) {
                if (this._checkConditionIsSatisfy(task.takeCon, checkCon)) {
                    task.takeCon = null;
                    this._localSave();
                    NotificationMgr.triggerEvent(NotificationName.TASK_GETTED_NEW, task.taskId);
                    continue;
                }
            }
        }
    }
    private _checkConditionIsSatisfy(satisfyCon: TaskSatisfyCondition, checkCon: TaskCondition) {
        let isSatisfy: boolean = false;
        for (let i = 0; i < satisfyCon.conditions.length; i++) {
            const temple = satisfyCon.conditions[i];
            if (temple.type == checkCon.type) {
                if (temple.type == TaskConditionType.Talk) {
                    if (temple.talk.talkId == checkCon.talk.talkId &&
                        (temple.talk.talkSelectCanGetTaskIndex == -1 || temple.talk.talkSelectCanGetTaskIndex == checkCon.talk.talkSelectCanGetTaskIndex)) {
                        isSatisfy = true;
                    }
                } else if (temple.type == TaskConditionType.Finish) {
                    if (temple.finish.type == checkCon.finish.type &&
                        temple.finish.taskId == checkCon.finish.taskId &&
                        temple.finish.taskResult == checkCon.finish.taskResult) {
                        temple.finish.finishTime -= 1;
                        this._localSave();
                        if (temple.finish.finishTime <= 0) {
                            isSatisfy = true;
                        }
                    }
                } else if (temple.type == TaskConditionType.Kill) {
                    let currentKillId: string = null;
                    if (checkCon.kill.enemyIds.length == 1) {
                        currentKillId = checkCon.kill.enemyIds[0];
                    }
                    if (currentKillId != null) {
                        if (temple.kill.enemyIds.indexOf(currentKillId) != -1) {
                            temple.kill.killTime -= 1;
                            this._localSave();
                            if (temple.kill.killTime <= 0) {
                                isSatisfy = true;
                            }
                        }
                    }
                } else if (temple.type == TaskConditionType.ShowHide) {
                    if (temple.showHide.type == checkCon.showHide.type &&
                        temple.showHide.id == checkCon.showHide.id &&
                        temple.showHide.status == checkCon.showHide.status) {
                        isSatisfy = true;
                    }
                }
            }
            if (isSatisfy) {
                satisfyCon.conditions.splice(i, 1);
                this._localSave();
                break;
            }
        }
        if (isSatisfy) {
            if (satisfyCon.satisfyType == TaskConditionSatisfyType.Any) {
                return true;
            } else if (satisfyCon.satisfyType == TaskConditionSatisfyType.All) {
                if (satisfyCon.conditions.length == 0) {
                    return true;
                }
            }
        }
        return false;
    }

    private _doAction(action: TaskAction) {
        if (action.type == TaskActionType.ShowHide) {
            NotificationMgr.triggerEvent(NotificationName.MAP_MEMBER_CHANGE_SHOW_HIDE, action.showHide);

        } else if (action.type == TaskActionType.Faction) {
            NotificationMgr.triggerEvent(NotificationName.MAP_MEMBER_CHANGE_FACTION, action.faction);

        } else if (action.type == TaskActionType.Talk) {
            NotificationMgr.triggerEvent(NotificationName.DIALOG_SHOW, action.talk);

        } else if (action.type == TaskActionType.GetProp) {
            ItemConfigDropTool.getItemByConfig([action.getProp]);

        } else if (action.type == TaskActionType.NpcGetNewTalk) {
            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_GET_NEW_TALK, action.npcGetNewTalk);
        
        }
    }

    private _localSave() {
        localStorage.setItem(this._localKey, JSON.stringify(this._taskInfos));
    }
}