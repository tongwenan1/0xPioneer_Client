export default class Config {
    public static canSaveLocalData: boolean = true;
}

export enum ConfigType {
    MapScaleMaxAndMin = "10001",
    LoginWhiteList = "10002",
    OneStepCostEnergy = "10004",
    MainCityEnergyTipThreshold = "10005",
    BattleReportMaxKeepDays = "110000",
    BattleReportMaxKeepRecords = "110002"
}

export interface ConfigConfigData {
    id: ConfigType;
    para: any[];
}

export type MapScaleMax = number;
export type MapScaleMin = number;
export interface MapScaleConfigData extends ConfigConfigData {
    id: ConfigType.MapScaleMaxAndMin;
    para: [MapScaleMax, MapScaleMin];
}

export type EnergyCost = number;
export interface OneStepCostEnergyConfigData extends ConfigConfigData {
    id: ConfigType.OneStepCostEnergy;
    para: [EnergyCost];
}

export type EnergyTipThreshold = number;
export interface MainCityEnergyTipThresholdConfigData extends ConfigConfigData {
    id: ConfigType.MainCityEnergyTipThreshold;
    para: [EnergyTipThreshold];
}

export type BattleReportMaxKeepDays = number;
export interface BattleReportMaxKeepDaysConfigData extends ConfigConfigData {
    id: ConfigType.BattleReportMaxKeepDays;
    para: [BattleReportMaxKeepDays];
}

export type BattleReportMaxKeepRecords = number;
export interface BattleReportMaxKeepRecordsConfigData extends ConfigConfigData {
    id: ConfigType.BattleReportMaxKeepRecords;
    para: [BattleReportMaxKeepRecords];
}
