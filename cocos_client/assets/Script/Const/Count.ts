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

export interface CountModel {
    type: CountType;
    timeStamp: number;
    data: any;
}
