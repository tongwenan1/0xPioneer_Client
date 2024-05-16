import { InnerBuildingType, UserInnerBuildInfo } from "./BuildingDefine";

export interface ResourceModel {
    id: string;
    num: number;
}

export interface GenerateTroopInfo {
    countTime: number;
    troopNum: number;
}

export interface HeatValueObject {
    getTimestamp: number;
    currentHeatValue: number;
    // get times
    lotteryTimes: number;
    // can get limit
    lotteryProcessLimit: number;

    // can get limit limit
    lotteryTimesLimit: number;
}

export interface UserInfoObject {
    id: string;
    name: string;
    level: number;
    exp: number;
    exploreProgress: number;
    heatValue: HeatValueObject;

    tavernGetPioneerTimestamp: number;
    treasureDidGetRewards: string[];
    pointTreasureDidGetRewards: string[];

    cityRadialRange: number;

    didFinishRookie: boolean;

    generateTroopInfo: GenerateTroopInfo;
    energyDidGetTimes: number;
    energyGetLimitTimes: number;
    innerBuildings: { [key: string]: UserInnerBuildInfo };

    wormholeDefenderIds: [string, string, string];
}
