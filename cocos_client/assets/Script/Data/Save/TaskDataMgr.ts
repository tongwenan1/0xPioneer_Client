import NotificationMgr from "../../Basic/NotificationMgr";
import TaskConfig from "../../Config/TaskConfig";
import TaskStepConfig from "../../Config/TaskStepConfig";
import { GetPropData, MapMemberTargetType } from "../../Const/ConstDefine";
import { NotificationName } from "../../Const/Notification";
import {
    TaskAction,
    TaskActionType,
    TaskCondition,
    TaskConditionSatisfyType,
    TaskConditionType,
    TaskConfigData,
    TaskFactionAction,
    TaskFinishCondition,
    TaskFinishResultType,
    TaskKillCondition,
    TaskNpcGetNewTalkAction,
    TaskObject,
    TaskParentChildType,
    TaskSatisfyCondition,
    TaskShowHideAction,
    TaskShowHideCondition,
    TaskShowHideStatus,
    TaskStepConfigData,
    TaskStepObject,
    TaskTalkAction,
    TaskTalkCondition,
} from "../../Const/TaskDefine";

export default class TaskDataMgr {
    private _baseKey: string = "local_task";
    private _key: string = "";

    private _data: TaskObject[] = [];
    private _taskStepMap: Map<string, TaskStepObject> = new Map();
    public constructor() {}
    //--------------------------------
    public loadObj(walletAddr: string) {
        this._key = walletAddr + "|" + this._baseKey;
        this._initData();
    }
    public saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
    }
    //--------------------------------
    public getAll(): TaskObject[] {
        return this._data;
    }
    public getAllGettedTasks(): TaskObject[] {
        return this._data.filter((task) => task.isGetted);
    }
    public getTask(taskId: string): TaskObject | null {
        const models = this._data.filter((temple) => temple.taskId == taskId);
        if (models.length > 0) {
            return models[0];
        }
        return null;
    }
    public getTaskStep(taskStepId: string): TaskStepObject | null {
        if (this._taskStepMap.has(taskStepId)) {
            return this._taskStepMap.get(taskStepId);
        }
        const config: TaskStepConfigData = TaskStepConfig.getById(taskStepId);
        if (config == null) {
            return null;
        }
        return this._convertTaskStepConfigToObject(config);
    }
    //--------------------------------
    public talkSelected(talkId: string, talkSelectedIndex: number) {
        const con: TaskCondition = {
            type: TaskConditionType.Talk,
            talk: {
                talkId: talkId,
                talkSelectCanGetTaskIndex: talkSelectedIndex,
            },
        };
        this._checkTask(con);
    }
    public finishStatusChanged(type: TaskParentChildType, id: string, result: TaskFinishResultType) {
        this._checkTask({
            type: TaskConditionType.Finish,
            finish: {
                type: type,
                taskId: id,
                taskResult: result,
                finishTime: 1,
            },
        });
    }
    public pioneerKilled(pioneerId: string) {
        this._checkTask({
            type: TaskConditionType.Kill,
            kill: {
                target: MapMemberTargetType.pioneer,
                enemyIds: [pioneerId],
                killTime: 1,
            },
        });
    }
    public showHideChanged(target: MapMemberTargetType, id: string, status: TaskShowHideStatus) {
        this._checkTask({
            type: TaskConditionType.ShowHide,
            showHide: {
                type: target,
                id: id,
                status: status,
            },
        });
    }
    public gameStarted() {
        this._checkTask({ type: TaskConditionType.GameStart });
    }
    //--------------------------------
    private _initData() {
        const localDataString = localStorage.getItem(this._key);
        if (localDataString == null) {
            const config = TaskConfig.getAll();
            for (const key in config) {
                if (Object.prototype.hasOwnProperty.call(config, key)) {
                    const element = config[key];
                    this._data.push(this._convertTaskConfigToObject(element));
                }
            }
            this.saveObj();
        } else {
            this._data = JSON.parse(localDataString);
        }
    }
    private _convertTaskConfigToObject(config: TaskConfigData): TaskObject {
        const preAction: TaskAction[] = [];
        if (config.pre_action != null) {
            for (const action of config.pre_action) {
                preAction.push(this._convertActionConfigToObject(action));
            }
        }
        return {
            taskId: config.id,
            name: config.name,
            type: config.type,
            preCon: this._convertConditionConfigToObject(config.pre_con),
            preAction: preAction,
            closeCon: this._convertConditionConfigToObject(config.close_con),
            takeCon: this._convertConditionConfigToObject(config.take_con),
            failCon: this._convertConditionConfigToObject(config.fail_con),
            steps: config.steps,
            stepIndex: 0,
            isFinished: false,
            isFailed: false,
            canGet: true,
            isGetted: false,
        };
    }
    private _convertConditionConfigToObject(conditionConfig: any[]): TaskSatisfyCondition {
        if (conditionConfig == null || conditionConfig.length <= 0) {
            return null;
        }
        const satisfyType = conditionConfig[0];
        const conditions: TaskCondition[] = [];
        if (conditionConfig.length > 1) {
            for (let i = 1; i < conditionConfig.length; i++) {
                const temple = conditionConfig[i];
                const conditionType = temple[0];

                let talk: TaskTalkCondition = null;
                let finish: TaskFinishCondition = null;
                let kill: TaskKillCondition = null;
                let showHide: TaskShowHideCondition = null;
                if (conditionType == TaskConditionType.Talk) {
                    talk = {
                        talkId: temple[1],
                        talkSelectCanGetTaskIndex: temple[2],
                    };
                } else if (conditionType == TaskConditionType.Finish) {
                    finish = {
                        type: temple[1],
                        taskId: temple[2],
                        taskResult: temple[3],
                        finishTime: temple[4],
                    };
                } else if (conditionType == TaskConditionType.Kill) {
                    kill = {
                        target: temple[1],
                        enemyIds: temple[2],
                        killTime: temple[3],
                    };
                } else if (conditionType == TaskConditionType.ShowHide) {
                    showHide = {
                        type: temple[1],
                        id: temple[2],
                        status: temple[3],
                    };
                }
                conditions.push({
                    type: conditionType,
                    isSatisfied: false,
                    talk: talk,
                    finish: finish,
                    kill: kill,
                    showHide: showHide,
                });
            }
        }
        return {
            satisfyType: satisfyType,
            conditions: conditions,
        };
    }
    private _convertActionConfigToObject(actionConfig: any[]): TaskAction {
        const actionType: TaskActionType = actionConfig[0];

        let showHide: TaskShowHideAction = null;
        let faction: TaskFactionAction = null;
        let talk: TaskTalkAction = null;
        let getProp: GetPropData = null;
        let npcGetNewTalk: TaskNpcGetNewTalkAction = null;
        if (actionType == TaskActionType.ShowHide) {
            showHide = {
                type: actionConfig[1],
                id: actionConfig[2],
                status: actionConfig[3],
                delayTime: actionConfig[4],
            };
        } else if (actionType == TaskActionType.Faction) {
            faction = {
                type: actionConfig[1],
                id: actionConfig[2],
                faction: actionConfig[3],
            };
        } else if (actionType == TaskActionType.Talk) {
            talk = {
                talkId: actionConfig[1],
            };
        } else if (actionType == TaskActionType.GetProp) {
            getProp = {
                type: actionConfig[1],
                propId: actionConfig[2],
                num: actionConfig[3],
            };
        } else if (actionType == TaskActionType.NpcGetNewTalk) {
            npcGetNewTalk = {
                talkId: actionConfig[1],
                npcId: actionConfig[2],
                delayTime: actionConfig[3],
            };
        }

        return {
            type: actionType,
            showHide: showHide,
            faction: faction,
            talk: talk,
            getProp: getProp,
            npcGetNewTalk: npcGetNewTalk,
        };
    }
    private _convertTaskStepConfigToObject(config: TaskStepConfigData): TaskStepObject {
        const startAction: TaskAction[] = [];
        if (config.start_action != null) {
            for (const action of config.start_action) {
                startAction.push(this._convertActionConfigToObject(action));
            }
        }

        const completeAction: TaskAction[] = [];
        if (config.complete_action != null) {
            for (const action of config.complete_action) {
                completeAction.push(this._convertActionConfigToObject(action));
            }
        }

        return {
            id: config.id,
            name: config.name,
            startAction: startAction,
            completeCon: this._convertConditionConfigToObject(config.complete_con),
            completeAction: completeAction,
            quitCon: this._convertConditionConfigToObject(config.quit_con),
            progress: config.progress,
            exp: config.exp,
            completeIndex: 0,
        };
    }

    private _checkTask(checkCon: TaskCondition) {
        for (const task of this._data) {
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
                    // task failed
                    task.isFailed = true;
                    task.failCon = null;
                    this.saveObj();
                    NotificationMgr.triggerEvent(NotificationName.TASK_FAILED, task.taskId);

                    this.finishStatusChanged(TaskParentChildType.Parent, task.taskId, TaskFinishResultType.Fail);
                    continue;
                }
            }
            if (task.closeCon != null) {
                if (this._checkConditionIsSatisfy(task.closeCon, checkCon)) {
                    // task closed
                    task.canGet = false;
                    task.closeCon = null;
                    this.saveObj();
                    NotificationMgr.triggerEvent(NotificationName.TASK_CANNOTGET, task.taskId);
                    continue;
                }
            }
            if (task.preCon != null) {
                if (this._checkConditionIsSatisfy(task.preCon, checkCon)) {
                    task.preCon = null;
                    this.saveObj();
                    // do pre action
                    for (const action of task.preAction) {
                        this._doAction(action);
                    }
                }
            }
            if (task.takeCon != null) {
                if (this._checkConditionIsSatisfy(task.takeCon, checkCon)) {
                    task.takeCon = null;
                    task.isGetted = true;
                    this.saveObj();
                    NotificationMgr.triggerEvent(NotificationName.TASK_NEW_GETTED, task.taskId);

                    const takeStep = this.getTaskStep(task.steps[task.stepIndex]);
                    for (const action of takeStep.startAction) {
                        this._doAction(action);
                    }
                }
            }
            if (task.isGetted) {
                const currentStep = this.getTaskStep(task.steps[task.stepIndex]);
                if (currentStep.quitCon != null) {
                    // step fail lead to task failed
                    if (this._checkConditionIsSatisfy(currentStep.quitCon, checkCon)) {
                        currentStep.quitCon = null;
                        task.isFailed = true;
                        this.saveObj();
                        NotificationMgr.triggerEvent(NotificationName.TASK_FAILED, task.taskId);
                        this.finishStatusChanged(TaskParentChildType.Child, currentStep.id, TaskFinishResultType.Fail);
                        continue;
                    }
                }
                if (currentStep.completeCon != null) {
                    if (this._checkConditionIsSatisfy(currentStep.completeCon, checkCon)) {
                        currentStep.completeCon = null;
                        task.stepIndex += 1;
                        this.saveObj();
                        for (const action of currentStep.completeAction) {
                            this._doAction(action);
                        }
                        NotificationMgr.triggerEvent(NotificationName.TASK_STEP_FINISHED, task.taskId);
                        this.finishStatusChanged(TaskParentChildType.Child, currentStep.id, TaskFinishResultType.Success);

                        if (task.stepIndex >= task.steps.length) {
                            // step finished lead to task finished
                            task.isFinished = true;
                            this.saveObj();
                            NotificationMgr.triggerEvent(NotificationName.TASK_FINISHED, task.taskId);

                            this.finishStatusChanged(TaskParentChildType.Parent, task.taskId, TaskFinishResultType.Success);
                            continue;
                        }
                    }
                }
            }
        }
    }
    private _checkConditionIsSatisfy(satisfyCon: TaskSatisfyCondition, checkCon: TaskCondition) {
        let isSatisfy: boolean = false;
        for (let i = 0; i < satisfyCon.conditions.length; i++) {
            const temple = satisfyCon.conditions[i];
            if (temple.isSatisfied) {
                continue;
            }
            if (temple.type == checkCon.type) {
                if (temple.type == TaskConditionType.Talk) {
                    if (
                        temple.talk.talkId == checkCon.talk.talkId &&
                        (temple.talk.talkSelectCanGetTaskIndex == -1 || temple.talk.talkSelectCanGetTaskIndex == checkCon.talk.talkSelectCanGetTaskIndex)
                    ) {
                        isSatisfy = true;
                    }
                } else if (temple.type == TaskConditionType.Finish) {
                    if (
                        temple.finish.type == checkCon.finish.type &&
                        temple.finish.taskId == checkCon.finish.taskId &&
                        temple.finish.taskResult == checkCon.finish.taskResult
                    ) {
                        temple.finish.finishTime -= 1;
                        this.saveObj();
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
                            this.saveObj();
                            if (temple.kill.killTime <= 0) {
                                isSatisfy = true;
                            }
                        }
                    }
                } else if (temple.type == TaskConditionType.ShowHide) {
                    if (
                        temple.showHide.type == checkCon.showHide.type &&
                        temple.showHide.id == checkCon.showHide.id &&
                        temple.showHide.status == checkCon.showHide.status
                    ) {
                        isSatisfy = true;
                    }
                } else if (temple.type == TaskConditionType.GameStart) {
                    isSatisfy = true;
                }
            }
            if (isSatisfy) {
                temple.isSatisfied = true;
                this.saveObj();
                break;
            }
        }
        if (isSatisfy) {
            if (satisfyCon.satisfyType == TaskConditionSatisfyType.Any) {
                return true;
            } else if (satisfyCon.satisfyType == TaskConditionSatisfyType.All) {
                for (const condition of satisfyCon.conditions) {
                    if (!condition.isSatisfied) {
                        return false;
                    }
                }
                return true;
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
            NotificationMgr.triggerEvent(NotificationName.TASK_PROP_TO_GET, { prop: action.getProp });
        } else if (action.type == TaskActionType.NpcGetNewTalk) {
            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_GET_NEW_TALK, action.npcGetNewTalk);
        }
    }
}
