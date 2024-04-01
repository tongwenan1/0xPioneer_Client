export interface TaskConfigData {
    id: string,
    name: string,
    type: number,
    pre_con: string[],
    close_con: string[],
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

export enum TaskType {
    Disposable = 1,
    Repeatable = 2
}

export enum TaskConditionType {
    SatisfyAll = 1,
    SatisfyAny = 2,
}

export interface TaskTalkCondition {
    talkId: string,
    talkSelectCanGetTaskIndex: number,
    cdTime: number
}

export default class TaskModel {
    private _taskId: string;
    private _name: string;
    private _type: TaskType;
    private _preCon: string[];
    private _closeCon: string[];
    private _takeCon: [TaskConditionType, TaskTalkCondition[]];
}