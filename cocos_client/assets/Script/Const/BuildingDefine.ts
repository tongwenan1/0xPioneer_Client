export enum MapBuildingType {
    resource = 3,
    explore = 1,
    stronghold = 2,
    city = 0,
    event = 4,
    decorate = 5
}

export enum BuildingFactionType {
    netural = 0,
    self = 1,
    enemy = 2,
}

export enum BuildingStayPosType {
    One = 0,
    Three = 1,
    Seven = 2
}

export interface BuildingMgrEvent {
    buildingDidHide(buildingId: string, beacusePioneerId: string): void;
    buildingDidShow(buildingId: string): void;

    buildingFacitonChanged(buildingId: string, faction: BuildingFactionType): void;
    buildingInsertDefendPioneer(buildingId: string, pioneerId: string): void;
    buildingRemoveDefendPioneer(buildingId: string, pioneerId: string): void;
}

export enum InnerBuildingType {
    MainCity = "30001",
    EnergyStation = "-30001",

    Barrack = "30002",
    House = "30003",
}

export interface UserInnerBuildInfo {
    buildType: InnerBuildingType,
    buildLevel: number,
    building: boolean,
}

export interface ConfigInnerBuildingData {
    id: InnerBuildingType;
    name: string,
    unlock: number,
    maxLevel: number,
    lvlup_cost: string,
}

export interface ConfigInnerBuildingLevelUpData {
    id: string,
    cost_main: [],
    cost_barr: [],
    psyc_output: number,
    psyc_storage: number,
}