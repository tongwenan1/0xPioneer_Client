export interface EvaluationConfigData {
    id: string;
    title: string;
    rank: number;
    cond: null | [number, number, number][];
}


export enum EvaluationCondType {
    newPioneer = 1,
    killEnemies = 2,
    gainResources = 3,
    exploredEvents = 4,
}
export enum EvaluationCondOperation {
    Greater = 1,
    LessEqual = 2,
}