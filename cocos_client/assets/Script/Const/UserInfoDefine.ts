import { InnerBuildingType, UserInnerBuildInfo } from "./BuildingDefine";

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

export interface UserInfoObject {
    id: string;
    name: string;
    level: number;
    exp: number;
    treasureProgress: number;
    treasureDidGetRewards: string[];
    pointTreasureDidGetRewards: string[];
    
    cityRadialRange: number;

    didFinishRookie: boolean;

    generateTroopInfo: GenerateTroopInfo;
    generateEnergyInfo: GenerateEnergyInfo;
    innerBuildings: { [key: string]: UserInnerBuildInfo };
}