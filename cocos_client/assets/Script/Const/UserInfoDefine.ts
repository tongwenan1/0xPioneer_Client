
export interface ResourceModel {
    id: string;
    num: number
}

export interface GenerateTroopInfo {
    countTime: number;
    troopNum: number;
}

export interface GenerateEnergyInfo {
    countTime: number,
    totalEnergyNum: number
}

export enum FinishedEvent {
    NoCondition = "",
    FirstTalkToProphetess = "FirstTalkToProphetess",
    KillDoomsDayGangTeam = "KillDoomsDayGangTeam",
    KillProphetess = "KillProphetess",
    BecomeCityMaster = "BecomeCityMaster",
}

export enum UserInfoNotification {
    generateEnergyTimeCountChanged = "generateEnergyTimeCountChanged",
    generateEnergyNumChanged = "generateEnergyNumChanged",

    generateTroopTimeCountChanged = "generateTroopTimeCountChanged",
    generateTroopNumChanged = "generateTroopNumChanged",
}

export interface UserInfoEvent {
    playerNameChanged?(value: string): void;
    playerExpChanged?(value: number): void;
    playerLvlupChanged?(value: number): void;

    playerExplorationValueChanged?(value: number): void;

    getNewTask?(taskId: string): void;
    triggerTaskStepAction?(action: string, delayTime: number): void;
    finishEvent?(event: FinishedEvent): void;
    taskProgressChanged?(taskId: string): void;
    taskFailed?(taskId: string): void;

    gameTaskOver?(): void;
}