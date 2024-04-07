import TaskConfig from "../Config/TaskConfig"
import { ConfigType } from "./Config"
import { GetPropData, MapMemberFactionType } from "./ConstDefine"
import { ItemConfigType } from "./Item"

export interface TaskConfigData {
    id: string,
    name: string,
    type: number,
    pre_con: [][],
    pre_action: [][],
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
    GameStart = 5,
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
    isSatisfied?: boolean,
    talk?: TaskTalkCondition,
    finish?: TaskFinishCondition,
    kill?: TaskKillCondition,
    showHide?: TaskShowHideCondition,
}
export interface TaskSatisfyCondition {
    satisfyType: TaskConditionSatisfyType,
    conditions: TaskCondition[]
}

export enum TaskActionType {
    ShowHide = 1,
    Faction = 2,
    Talk = 3,
    GetProp = 4,
    NpcGetNewTalk = 5,
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
    faction: MapMemberFactionType
}
export interface TaskTalkAction {
    talkId: string,
}
export interface TaskNpcGetNewTalkAction {
    talkId: string,
    npcId: string
}

export interface TaskAction {
    type: TaskActionType,
    showHide?: TaskShowHideAction,
    faction?: TaskFactionAction,
    talk?: TaskTalkAction,
    getProp?: GetPropData,
    npcGetNewTalk?: TaskNpcGetNewTalkAction,
}



export default class TaskModel {
    public static convertToCondition(conditionConfig: any[]): TaskSatisfyCondition {
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
                    isSatisfied: false,
                    talk: talk,
                    finish: finish,
                    kill: kill,
                    showHide: showHide
                });
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
        let getProp: GetPropData = null;
        let npcGetNewTalk: TaskNpcGetNewTalkAction = null;
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
                propId: actionConfig[2],
                num: actionConfig[3]
            }
        } else if (actionType == TaskActionType.NpcGetNewTalk) {
            npcGetNewTalk = {
                talkId: actionConfig[1],
                npcId: actionConfig[2]
            }
        }

        return {
            type: actionType,
            showHide: showHide,
            faction: faction,
            talk: talk,
            getProp: getProp,
            npcGetNewTalk: npcGetNewTalk
        }
    }

    public convertConfigToModel(config: TaskConfigData) {
        this._taskId = config.id;
        this._name = config.name;
        this._type = config.type;
        this._preCon = TaskModel.convertToCondition(config.pre_con);
        this._preAction = [];
        if (config.pre_action != null) {
            for (const action of config.pre_action) {
                this._preAction.push(TaskModel.convertToAction(action));
            }
        }
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
        this._preAction = localData._preAction;
        this._closeCon = localData._closeCon;
        this._takeCon = localData._takeCon;
        this._failCon = localData._failCon;
        this._steps = localData._steps;
        this._stepIndex = localData._stepIndex;
        this._isFinished = localData._isFinished;
        this._isFailed = localData._isFailed;
        this._canGet = localData._canGet;
        this._isGetted = localData._isGetted;
    }


    public set preCon(value: TaskSatisfyCondition) {
        this._preCon = value;
    }
    public set closeCon(value: TaskSatisfyCondition) {
        this._closeCon = value;
    }
    public set takeCon(value: TaskSatisfyCondition) {
        this._takeCon = value;
    }
    public set failCon(value: TaskSatisfyCondition) {
        this._failCon = value;
    }
    
    public set stepIndex(value: number) {
        this._stepIndex = value;
    }
    public set isFinished(value: boolean) {
        this._isFinished = value;
    }
    public set isFailed(value: boolean) {
        this._isFailed = value;
    }
    public set canGet(value: boolean) {
        this._canGet = value;
    }
    public set isGetted(value: boolean) {
        this._isGetted = value;
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
    public get preAction(): TaskAction[] {
        return this._preAction;
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
    public get stepIndex(): number {
        return this._stepIndex;
    }
    public get isFinished(): boolean {
        return this._isFinished;
    }
    public get isFailed(): boolean {
        return this._isFailed;
    }
    public get canGet(): boolean {
        return this._canGet;
    }
    public get isGetted(): boolean {
        return this._isGetted;
    }

    public constructor() {
        this._stepIndex = 0;
        this._isFinished = false;
        this._isFailed = false;
        this._canGet = true;
        this._isGetted = false;
    }
    private _taskId: string;
    private _name: string;
    private _type: TaskUseTimeType;
    private _preCon: TaskSatisfyCondition;
    private _preAction: TaskAction[];
    private _closeCon: TaskSatisfyCondition;
    private _takeCon: TaskSatisfyCondition;
    private _failCon: TaskSatisfyCondition;
    private _steps: string[];

    private _stepIndex: number;
    private _isFinished: boolean;
    private _isFailed: boolean;
    private _canGet: boolean;
    private _isGetted: boolean;
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

    public set completeCon(value: TaskSatisfyCondition) {
        this._completeCon = value;
    }
    public set completeIndex(value: number) {
        this._completeIndex = value;
    }
    public set quitCon(value: TaskSatisfyCondition) {
        this._quitCon = value;
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
    public get completeIndex(): number {
        return this._completeIndex;
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

    public constructor() {
        this._completeIndex = 0;
    }
    private _id: string;
    private _name: string;
    private _startAction: TaskAction[];
    private _completeCon: TaskSatisfyCondition;
    private _completeIndex: number;
    private _completeAction: TaskAction[];
    private _quitCon: TaskSatisfyCondition;
    private _progress: number;
    private _exp: number;

}