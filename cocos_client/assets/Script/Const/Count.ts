import { InnerBuildingType } from "./BuildingDefine";

export enum CountType {
    actionPioneer = "actionPioneer",
    actionBuilding = "actionBuilding",
    openBox = "openBox",
    selectDialog = "selectDialog",
    showEvent = "showEvent",
    buildInnerBuilding = "buildInnerBuilding",
    generateTroops = "generateTroops",
    useItem = "useItem",
}

export interface CountData {
    type: CountType;
    timeStamp: number;
    data:
        | CountActionPioneerData
        | CountActionBuildingData
        | CountOpenBoxData
        | CountSelectDialogData
        | CountShowEventData
        | CountBuildInnerBuildingData
        | CountGenerateTroopsData
        | CountUseItemData;
}

export interface CountActionPioneerData {
    actionPid: string;
    interactPid: string;
}
export interface CountActionBuildingData {
    actionPid: string;
    interactBId: string;
}
export interface CountOpenBoxData {
    id: string;
}
export interface CountSelectDialogData {
    selectText: string;
}
export interface CountShowEventData {
    eventId: string;
}
export interface CountBuildInnerBuildingData {
    bId: InnerBuildingType;
    level: number;
}
export interface CountGenerateTroopsData {
    num: number;
}
export interface CountUseItemData {
    itemId: string;
    num: number;
}
