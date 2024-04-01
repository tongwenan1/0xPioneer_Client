import TaskConfig from "../Config/TaskConfig"
import { ConfigType } from "./Config"
import { ItemConfigType } from "./Item"

export interface TaskConfigData {
    id: string,
    name: string,
    type: number,
    pre_con: [][],
    close_con: [][],
    take_con: [][],
    fail_con: [][],
    steps: string[]
}

export interface TaskStepConfigData {
    id: string,
    name: string,
    start_action: [][],
    complete_con: [][],
    complete_action: [][],
    quit_con: [][],
    progress: number,
    exp: number,
}

export enum TaskUseTimeType {
    Disposable = 1,
    Repeatable = 2
}

export enum TaskParentChildType {
    Parent = 0,
    Child = 1,
}

export enum TaskFinishResultType {
    Success = 0,
    Fail = 1,
}
export enum TaskTargetType {
    pioneer = 0,
    building = 1
}
export enum TaskFaction {
    enemy = 0,
    friend = 1,
    neutral = 2,
}
export enum TaskShowHideStatus {
    hide = 0,
    show = 1
}

export enum TaskConditionSatisfyType {
    All = 1,
    Any = 2,
}
export enum TaskConditionType {
    Talk = 1,
    Finish = 2,
    Kill = 3,
    ShowHide = 4,
}

export interface TaskTalkCondition {
    talkId: string,
    talkSelectCanGetTaskIndex: number,
    cdTime: number
}
export interface TaskFinishCondition {
    type: TaskParentChildType,
    taskId: string,
    taskResult: TaskFinishResultType,
    finishTime: number
}
export interface TaskKillCondition {
    enemyIds: string[],
    killTime: number
}
export interface TaskShowHideCondition {
    type: TaskTargetType,
    id: string,
    status: TaskShowHideStatus
}
export interface TaskCondition {
    type: TaskConditionType,
    talk: TaskTalkCondition,
    finish: TaskFinishCondition,
    kill: TaskKillCondition,
    showHide: TaskShowHideCondition,
}
export interface TaskSatisfyCondition {
    satisfyType: TaskConditionSatisfyType,
    conditions: TaskCondition[]
}

export enum TaskActionType {
    ShowHide = 1,
    Faction = 2,
    Talk = 3,
    GetProp = 4
}

export interface TaskShowHideAction {
    type: TaskTargetType,
    id: string,
    status: TaskShowHideStatus,
    delayTime: number
}
export interface TaskFactionAction {
    type: TaskTargetType,
    id: string,
    faction: TaskFaction
}
export interface TaskTalkAction {
    talkId: string,
}
export interface TaskGetPropAction {
    type: ItemConfigType,
    id: string,
    num: number
}
export interface TaskAction {
    type: TaskActionType,
    showHide: TaskShowHideAction,
    faction: TaskFactionAction,
    talk: TaskTalkAction,
    getProp: TaskGetPropAction
}



export default class TaskModel {
    public static convertToCondition(conditionConfig: any[]): TaskSatisfyCondition {
        if (conditionConfig == null || conditionConfig.length <= 0) {
            return null;
        }
        const satisfyType = conditionConfig[0];
        const conditions = [];
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
                        cdTime: temple[3]
                    }
                } else if (conditionType == TaskConditionType.Finish) {
                    finish = {
                        type: temple[1],
                        taskId: temple[2],
                        taskResult: temple[3],
                        finishTime: temple[4]
                    }
                } else if (conditionType == TaskConditionType.Kill) {
                    kill = {
                        enemyIds: temple[1],
                        killTime: temple[2]
                    }
                } else if (conditionType == TaskConditionType.ShowHide) {
                    showHide = {
                        type: temple[1],
                        id: temple[2],
                        status: temple[3]
                    }
                }
                conditions.push({
                    type: conditionType,
                    talk: talk,
                    finish: finish,
                    kill: kill,
                    showHide: showHide
                })
            }
        }
        return {
            satisfyType: satisfyType,
            conditions: conditions
        }
    }
    public static convertToAction(actionConfig: any[]): TaskAction {
        const actionType: TaskActionType = actionConfig[0];

        let showHide: TaskShowHideAction = null;
        let faction: TaskFactionAction = null;
        let talk: TaskTalkAction = null;
        let getProp: TaskGetPropAction = null;
        if (actionType == TaskActionType.ShowHide) {
            showHide = {
                type: actionConfig[1],
                id: actionConfig[2],
                status: actionConfig[3],
                delayTime: actionConfig[4]
            }
        } else if (actionType == TaskActionType.Faction) {
            faction = {
                type: actionConfig[1],
                id: actionConfig[2],
                faction: actionConfig[3]
            }
        } else if (actionType == TaskActionType.Talk) {
            talk = {
                talkId: actionConfig[1]
            }
        } else if (actionType == TaskActionType.GetProp) {
            getProp = {
                type: actionConfig[1],
                id: actionConfig[2],
                num: actionConfig[3]
            }
        }

        return {
            type: actionType,
            showHide: showHide,
            faction: faction,
            talk: talk,
            getProp: getProp
        }
    }

    public convertConfigToModel(config: TaskConfigData) {
        this._taskId = config.id;
        this._name = config.name;
        this._type = config.type;
        this._preCon = TaskModel.convertToCondition(config.pre_con);
        this._closeCon = TaskModel.convertToCondition(config.close_con);
        this._takeCon = TaskModel.convertToCondition(config.take_con);
        this._failCon = TaskModel.convertToCondition(config.fail_con);
        this._steps = config.steps;
    }
    public convertLocalDataToModel(localData: any) {
        this._taskId = localData._taskId;
        this._name = localData._name;
        this._type = localData._type;
        this._preCon = localData._preCon;
        this._closeCon = localData._closeCon;
        this._takeCon = localData._takeCon;
        this._failCon = localData._failCon;
        this._steps = localData._steps;
    }
    public get taskId(): string {
        return this._taskId;
    }
    public get name(): string {
        return this._name;
    }
    public get type(): TaskUseTimeType {
        return this._type;
    }
    public get preCon(): TaskSatisfyCondition {
        return this._preCon;
    }
    public get closeCon(): TaskSatisfyCondition {
        return this._closeCon;
    }
    public get takeCon(): TaskSatisfyCondition {
        return this._takeCon;
    }
    public get failCon(): TaskSatisfyCondition {
        return this._failCon;
    }
    public get steps(): string[] {
        return this._steps;
    }

    private _taskId: string;
    private _name: string;
    private _type: TaskUseTimeType;
    private _preCon: TaskSatisfyCondition;
    private _closeCon: TaskSatisfyCondition;
    private _takeCon: TaskSatisfyCondition;
    private _failCon: TaskSatisfyCondition;
    private _steps: string[];
}


export class TaskStepModel {

    public convertConfigToModel(config: TaskStepConfigData) {
        this._id = config.id;
        this._name = config.name;
        this._startAction = [];
        if (config.start_action != null) {
            for (const action of config.start_action) {
                this._startAction.push(TaskModel.convertToAction(action));
            }
        }

        this._completeCon = TaskModel.convertToCondition(config.complete_con);

        this._completeAction = [];
        if (config.complete_action != null) {
            for (const action of config.complete_action) {
                this._completeAction.push(TaskModel.convertToAction(action));
            }
        }

        this._quitCon = TaskModel.convertToCondition(config.quit_con);
        
        this._progress = config.progress;
        this._exp = config.exp;
    }

    public get id(): string {
        return this._id;
    }
    public get name(): string {
        return this._name;
    }
    public get startAction(): TaskAction[] {
        return this._startAction;
    }
    public get completeCon(): TaskSatisfyCondition {
        return this._completeCon;
    }
    public get completeAction(): TaskAction[] {
        return this._completeAction
    }
    public get quitCon(): TaskSatisfyCondition {
        return this._quitCon;
    }
    public get progress(): number {
        return this._progress;
    }
    public get exp(): number {
        return this._exp;
    }

    private _id: string;
    private _name: string;
    private _startAction: TaskAction[];
    private _completeCon: TaskSatisfyCondition;
    private _completeAction: TaskAction[];
    private _quitCon: TaskSatisfyCondition;
    private _progress: number;
    private _exp: number;
}