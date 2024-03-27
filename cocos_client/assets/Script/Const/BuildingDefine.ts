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

export enum InnerBuildingNotification {
    BeginUpgrade = "BeginUpgrade",
    upgradeCountTimeChanged = "upgradeCountTimeChanged",
    upgradeFinished = "upgradeFinished"
}

export enum InnerBuildingType {
    MainCity = "30001",
    Barrack = "30002",
    House = "30003",
    EnergyStation = "30004",
}

export interface UserInnerBuildInfo {
    buildType: InnerBuildingType,
    buildLevel: number,
    upgradeCountTime: number,
    upgradeTotalTime: number
}

export interface ConfigInnerBuildingData {
    id: InnerBuildingType;
    name: string,
    anim: string,
    unlock: number,
    maxLevel: number,

    lvlup_progress: string,
    lvlup_exp: string,
    lvlup_cost: string,
    lvlup_time: string,
    prefab: string,
    desc: string
}

export interface ConfigInnerBuildingLevelUpData {
    id: string,
    progress: number,
    exp: number,
    lvlup_time: number,

    cost_main: [number, number][],
    cost_barr: [number, number][],

    prefab_main: string,
    desc_main: string,

    prefab_barr: string,
    desc_barr: string,

    prefab_house: string,
    desc_house: string,

    prefab_energy: string,
    desc_energy: string,


    psyc_output: number,
    psyc_storage: number,
    psyc_convert: [number, number][]
}

export interface InnerBuildingPsycData {
    output: number,
    storage: number,
    convert: [number, number][]
}