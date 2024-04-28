import { resources } from "cc";
import CLog from "../Utils/CLog";
import { ConfigData, ConfigType } from "../Const/Config";

export default class ConfigConfig {

    public static getConfig(type: ConfigType): ConfigData | null {
        if (this._config.has(type)) {
            return this._config.get(type);
        }
        return null;
    }

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

        this._config = new Map();
        for (const key in obj) {
            const param = obj[key].para;

            let temple: any = {};
            if (key == ConfigType.MapScaleMaxAndMin) {
                temple = {
                    type: key,
                    scaleMin: param[0],
                    scaleMax: param[1],
                };

            } else if (key == ConfigType.LoginWhiteList) {
                temple = {
                    type: key,
                    whiteList: param
                };

            } else if (key == ConfigType.OneStepCostEnergy) {
                temple = {
                    type: key,
                    cost: param[0],
                };

            } else if (key == ConfigType.MainCityEnergyTipThreshold) {
                temple = {
                    type: key,
                    threshold: param[0],
                };

            } else if (key == ConfigType.BattleReportMaxKeepDays) {
                temple = {
                    type: key,
                    maxKeepDays: param[0],
                };

            } else if (key == ConfigType.BattleReportMaxKeepRecords) {
                temple = {
                    type: key,
                    maxKeepRecords: param[0],
                };

            } else if (key == ConfigType.NFTRaritySkillInitNum) {
                const map: Map<number, number> = new Map();
                for (let i = 1; i <= param.length; i++) {
                    map.set(i, param[i - 1]);
                }
                temple = {
                    type: key,
                    initNumMap: map,
                };

            } else if (key == ConfigType.NFTRaritySkillLimitNum) {
                const map: Map<number, number> = new Map();
                for (let i = 1; i <= param.length; i++) {
                    map.set(i, param[i - 1]);
                }
                temple = {
                    type: key,
                    limitNumMap: map,
                };

            } else if (key == ConfigType.NFTLevelInitLimitNum) {
                temple = {
                    type: key,
                    limit: param[0],
                };

            } else if (key == ConfigType.NFTLevelLimitPerRankAddNum) {
                temple = {
                    type: key,
                    value: param[0],
                };

            } else if (key == ConfigType.NFTRankLimitNum) {
                temple = {
                    type: key,
                    limit: param[0],
                };

            } else if (key == ConfigType.WorldBoxThreshold) {
                temple = {
                    type: key,
                    thresholds: param,
                };
            }
            this._config.set(key as ConfigType, temple);
        }
        return true;
    }
    private static _config: Map<ConfigType, ConfigData> = null;
}
