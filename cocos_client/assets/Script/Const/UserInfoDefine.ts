import { InnerBuildingType, UserInnerBuildInfo } from "./BuildingDefine";

export interface ResourceModel {
    id: string;
    num: number;
}

export interface GenerateTroopInfo {
    countTime: number;
    troopNum: number;
}

export interface GenerateEnergyInfo {
    countTime: number;
    totalEnergyNum: number;
}

export interface HeatValueObject {
    getTimestamp: number;
    currentHeatValue: number;
}

export interface UserInfoObject {
    id: string;
    name: string;
    level: number;
    exp: number;
    treasureProgress: number;
    heatValue: HeatValueObject;
    tavernGetPioneerTimestamp: number;
    treasureDidGetRewards: string[];
    pointTreasureDidGetRewards: string[];

    cityRadialRange: number;

    didFinishRookie: boolean;

    generateTroopInfo: GenerateTroopInfo;
    generateEnergyInfo: GenerateEnergyInfo;
    innerBuildings: { [key: string]: UserInnerBuildInfo };

    wormholeDefenderIds: [string, string, string];
}
