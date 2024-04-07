
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

export interface UserInfoEvent {
    playerNameChanged?(value: string): void;
    playerExpChanged?(value: number): void;
    playerLvlupChanged?(value: number): void;
    playerExplorationValueChanged?(value: number): void;
}