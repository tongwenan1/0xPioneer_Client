import { resources } from "cc";
import { BattleReportMaxKeepDaysConfigData, BattleReportMaxKeepRecordsConfigData, ConfigConfigData, ConfigType, MapScaleConfigData, OneStepCostEnergyConfigData } from "../Const/Config";
import CLog from "../Utils/CLog";

export default class ConfigConfig {
    private static _confs: ConfigConfigData[] = [];

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/config", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("ConfigConfig init error");
            return false;
        }

        for (const key in obj) {
            this._confs.push(obj[key]);
        }
        CLog.debug("ConfigConfig init success", this._confs);
        return true;
    }

    public static getMapScaleConfig(): MapScaleConfigData {
        return this.getById(ConfigType.MapScaleMaxAndMin) as MapScaleConfigData;
    }
    public static getWhiteListConfig(): ConfigConfigData {
        return this.getById(ConfigType.LoginWhiteList);
    }
    public static getEnergyCostConfig(): OneStepCostEnergyConfigData {
        return this.getById(ConfigType.OneStepCostEnergy) as OneStepCostEnergyConfigData;
    }
    public static getBattleReportMaxKeepDaysConfig(): BattleReportMaxKeepDaysConfigData {
        return this.getById(ConfigType.BattleReportMaxKeepDays) as BattleReportMaxKeepDaysConfigData;
    }
    public static getBattleReportMaxKeepRecordsConfig(): BattleReportMaxKeepRecordsConfigData {
        return this.getById(ConfigType.BattleReportMaxKeepRecords) as BattleReportMaxKeepRecordsConfigData;
    }

    private static getById(configType: ConfigType): ConfigConfigData {
        const findConf = this._confs.filter((conf) => {
            return conf.id === configType;
        });
        if (findConf.length > 0) {
            return findConf[0];
        }
        return null;
    }
}
