import TaskModel, { TaskAction, TaskActionType, TaskCondition, TaskConditionSatisfyType, TaskConditionType, TaskFinishResultType, TaskParentChildType, TaskSatisfyCondition, TaskShowHideStatus, TaskStepConfigData, TaskStepModel, TaskTalkCondition,  } from "../Const/TaskDefine";
import TaskConfig from "../Config/TaskConfig";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";
import TaskStepConfig from "../Config/TaskStepConfig";
import { MapMemberTargetType } from "../Const/ConstDefine";

export default class TaskMgr {

    public talkSelected(talkId: string, talkSelectedIndex: number) {
        const con: TaskCondition = {
            type: TaskConditionType.Talk,
            talk: {
                talkId: talkId,
                talkSelectCanGetTaskIndex: talkSelectedIndex,
            }
        }
        this._checkTask(con);
    }
    public finishStatusChanged(type: TaskParentChildType, id: string, result: TaskFinishResultType) {
        this._checkTask({
            type: TaskConditionType.Finish,
            finish: {
                type: type,
                taskId: id,
                taskResult: result,
                finishTime: 1
            }
        });
    }
    public pioneerKilled(pioneerId: string) {
        this._checkTask({
            type: TaskConditionType.Kill,
            kill: {
                target: MapMemberTargetType.pioneer,
                enemyIds: [pioneerId],
                killTime: 1,
            }
        });
    }
    public showHideChanged(target: MapMemberTargetType, id: string, status: TaskShowHideStatus) {
        this._checkTask({
            type: TaskConditionType.ShowHide,
            showHide: {
                type: target,
                id: id,
                status: status
            }
        });
    }
    public gameStarted() {
        this._checkTask({ type: TaskConditionType.GameStart });
    }


    public getAllTasks(): TaskModel[] {
        return this._taskInfos;
    }
    public getAllGettedTasks(): TaskModel[] {
        return this._taskInfos.filter(task => task.isGetted);
    }
    public getTask(taskId: string): TaskModel | null {
        const models = this._taskInfos.filter(temple => temple.taskId == taskId);
        if (models.length > 0) {
            return models[0];
        }
        return null;
    }
    public getTaskStep(taskStepId: string): TaskStepModel | null {
        let step: TaskStepModel = null;
        if (this._taskStepMap.has(taskStepId)) {
            step = this._taskStepMap.get(taskStepId);
        }
        if (step == null) {
            const config: TaskStepConfigData = TaskStepConfig.getById(taskStepId);
            if (config != null) {
                step = new TaskStepModel();
                step.convertConfigToModel(config);
            }
        }
        return step;
    }

    public async initData() {
        await this._initData();
    }
    
    public constructor() {

    }

    private _localKey: string = "local_task";
    private _taskInfos: TaskModel[] = [];
    private _taskStepMap: Map<string, TaskStepModel> = new Map();
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
                    // task failed
                    task.isFailed = true;
                    task.failCon = null;
                    this._localSave();
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
                }
            }
            if (task.takeCon != null) {
                if (this._checkConditionIsSatisfy(task.takeCon, checkCon)) {
                    task.takeCon = null;
                    task.isGetted = true;
                    this._localSave();
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
                        this._localSave();
                        NotificationMgr.triggerEvent(NotificationName.TASK_FAILED, task.taskId);
                        this.finishStatusChanged(TaskParentChildType.Child, currentStep.id, TaskFinishResultType.Fail);
                        continue;
                    }
                }
                if (currentStep.completeCon != null) {
                    if (this._checkConditionIsSatisfy(currentStep.completeCon, checkCon)) {
                        currentStep.completeCon = null;
                        task.stepIndex += 1;
                        this._localSave();
                        for (const action of currentStep.completeAction) {
                            this._doAction(action);
                        }
                        NotificationMgr.triggerEvent(NotificationName.TASK_STEP_FINISHED, task.taskId);
                        this.finishStatusChanged(TaskParentChildType.Child, currentStep.id, TaskFinishResultType.Success);

                        if (task.stepIndex >= task.steps.length) {
                            // step finished lead to task finished
                            task.isFinished = true;
                            this._localSave();
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
                } else if (temple.type == TaskConditionType.GameStart) {
                    isSatisfy = true;
                }
            }
            if (isSatisfy) {
                temple.isSatisfied = true;
                this._localSave();
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
            ItemConfigDropTool.getItemByConfig([action.getProp]);

        } else if (action.type == TaskActionType.NpcGetNewTalk) {
            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_GET_NEW_TALK, action.npcGetNewTalk);
        }
    }

    private _localSave() {
        localStorage.setItem(this._localKey, JSON.stringify(this._taskInfos));
    }
}