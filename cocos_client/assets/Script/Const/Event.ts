import { ItemConfigType } from "./Item";

export type EventSelectCondType = ItemConfigType;
export type EventSelectCondId = string;
export type EventSelectCondNum = number;
export type EventSelectCond = [EventSelectCondType, EventSelectCondId, EventSelectCondNum];

export type EventCostType = number;
export type EventCostId = string;
export type EventCostNum = number;
export type EventCost = [EventCostType, EventCostId, EventCostNum];

export type EventRewardType = ItemConfigType;
export type EventRewardId = string;
export type EventRewardNum = number;
export type EventReward = [EventRewardType, EventRewardId, EventRewardNum];

export type EventChangePioneer = string;
export type EventChangeType = number;
export type EventChangeMethod = number;
export type EvnetChangeValue = number;
export type EventChange = [EventChangePioneer, EventChangeType, EventChangeMethod, EvnetChangeValue];

export type EventMapBuildingRefreshBuildingId = string;
export type EventMapBuildingRefreshShowType = number;
export type EventMapBuildingRefresh = [EventMapBuildingRefreshBuildingId, EventMapBuildingRefreshShowType];

export type EventMapPioneerUnlockPioneerId = string;
export type EventMapPioneerUnlockShowType = number;
export type EventMapPioneerUnlock = [EventMapPioneerUnlockPioneerId, EventMapPioneerUnlockShowType];

export interface EventConfigData {
    id: string;
    type: number;
    result: string;
    text: string;
    select: string[] | null;
    select_txt: string[] | null;
    select_cond: EventSelectCond[] | null;
    enemy: string;
    enemy_result: string[] | null;
    cost: EventCost[] | null;
    reward: EventReward[] | null;
    change: EventChange[] | null;
    wait_time: number;
    map_pioneer_unlock: EventMapPioneerUnlock[] | null;
    map_building_refresh: EventMapBuildingRefresh[] | null;
}

export interface EVENT_STEPEND_DATA {
    pioneerId: string;
    buildingId: string;
    eventId: string;
    hasNextStep: boolean;
}