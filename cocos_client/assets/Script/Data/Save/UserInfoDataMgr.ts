import NotificationMgr from "../../Basic/NotificationMgr";
import InnerBuildingConfig from "../../Config/InnerBuildingConfig";
import InnerBuildingLvlUpConfig from "../../Config/InnerBuildingLvlUpConfig";
import LvlupConfig from "../../Config/LvlupConfig";
import { InnerBuildingType } from "../../Const/BuildingDefine";
import { GetPropData } from "../../Const/ConstDefine";
import { LvlupConfigData } from "../../Const/Lvlup";
import { NotificationName } from "../../Const/Notification";
import { UserInfoObject } from "../../Const/UserInfoDefine";
import { NetworkMgr } from "../../Net/NetworkMgr";
import { WebsocketMsg, share } from "../../Net/msg/WebsocketMsg";
import NetGlobalData from "./Data/NetGlobalData";

export default class UserInfoDataMgr {
    private _key: string = "";

    private _data: UserInfoObject = null;
    public constructor() {}
    //--------------------------------
    public loadObj() {
        this._initData();
    }
    //--------------------------------
    public get data() {
        return this._data;
    }
    public get artifactStoreLevel() {
        let level: number = 0;
        if (this._data.innerBuildings != null && InnerBuildingType.ArtifactStore in this._data.innerBuildings) {
            level = this._data.innerBuildings[InnerBuildingType.ArtifactStore].buildLevel;
        }
        return level;
    }
    public getInnerBuildingLevel(buildingType: InnerBuildingType) {
        let level: number = 0;
        if (this._data.innerBuildings != null && buildingType in this._data.innerBuildings) {
            level = this._data.innerBuildings[buildingType].buildLevel;
        }
        return level;
    }
    //--------------------------------
    public beginInnerBuildingUpgrade(buildingType: InnerBuildingType, beginTimeStamp: number, endTimeStamp: number) {
        const buildInfo = this._data.innerBuildings[buildingType];
        if (buildInfo == null) {
            return;
        }
        buildInfo.upgrading = true;
        buildInfo.upgradeBeginTimestamp = beginTimeStamp * 1000;
        buildInfo.upgradeEndTimestamp = endTimeStamp * 1000;
        NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_BEGIN_UPGRADE, buildingType);
    }

    public changeBuildingLatticeBeginIndex(buildingType: InnerBuildingType, beginIndex: number) {
        const buildInfo = this._data.innerBuildings[buildingType];
        if (buildInfo == null) {
            return;
        }
        buildInfo.buildBeginLatticeIndex = beginIndex;
    }

    public getExplorationReward(boxId: string) {
        this._data.treasureDidGetRewards.push(boxId);
    }
    public getPointExplorationReward(boxId: string) {
        this._data.pointTreasureDidGetRewards.push(boxId);
    }

    public beginGenerateTroop(leftTime: number, troopNum: number) {
        this._data.generateTroopInfo = {
            countTime: leftTime,
            troopNum: troopNum,
        };
    }

    public finishRookie() {
        this._data.didFinishRookie = true;
    }

    public changePlayerName(name: string) {
        this._data.name = name;

        NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_NAME);
    }

    public gainGenerateEnergy(energy: number): void {
        const energyBuildingData = this._data.innerBuildings[InnerBuildingType.EnergyStation];
        if (energyBuildingData == null) {
            return;
        }
        const generateConfig = InnerBuildingLvlUpConfig.getEnergyLevelData(energyBuildingData.buildLevel);
        if (generateConfig == null) {
            return;
        }
        NotificationMgr.triggerEvent(NotificationName.GENERATE_ENERGY_NUM_DID_CHANGE);
    }
    public generateEnergyGetted() {
        NotificationMgr.triggerEvent(NotificationName.GENERATE_ENERGY_NUM_DID_CHANGE);
    }
    
    //------------------------------------------------------------------------
    private async _initData() {
        if (NetGlobalData.userInfo == null || NetGlobalData.innerBuildings == null) {
            return;
        }
        const globalData: share.Iplayer_sinfo = NetGlobalData.userInfo;
        const innerBuildings: share.Ibuilding_data[] = NetGlobalData.innerBuildings;
        this._data = {
            id: globalData.playerid.toString(),
            name: globalData.pname,
            level: globalData.level,
            exp: globalData.exp,
            exploreProgress: globalData.treasureProgress,
            worldTreasureTodayDidGetTimes: 0,
            treasureDidGetRewards: globalData.treasureDidGetRewards,
            pointTreasureDidGetRewards: globalData.pointTreasureDidGetRewards,
            heatValue: {
                getTimestamp: globalData.heatValue.getTimestamp,
                currentHeatValue: globalData.heatValue.currentHeatValue,
            },
            generateTroopInfo:
                globalData.generateTroopInfo == null
                    ? null
                    : {
                          countTime: globalData.generateTroopInfo.countTime,
                          troopNum: globalData.generateTroopInfo.troopNum,
                      },
            energyDidGetTimes: globalData.currFetchTimes,
            energyGetLimitTimes: globalData.limitFetchTimes,
            cityRadialRange: globalData.cityRadialRange,
            didFinishRookie: globalData.didFinishRookie,
            innerBuildings: {},
            // lost
            tavernGetPioneerTimestamp: 0,
            wormholeDefenderIds: ["", "", ""],
        };
        for (const building of innerBuildings) {
            this._data.innerBuildings[building.id] = {
                buildBeginLatticeIndex: null,
                buildLevel: building.level,
                buildType: building.id as InnerBuildingType,
                upgradeBeginTimestamp: building.upgradeCountTime * 1000,
                upgradeEndTimestamp: building.upgradeTotalTime * 1000,
                upgrading: building.upgradeIng,
            };
        }
        if (globalData.defender != null) {
            for (const key in globalData.defender) {
                this._data.wormholeDefenderIds[parseInt(key)] = globalData.defender[key];
            }
        }
        console.log("exce _data: ", this._data);
        this._initInterval();
    }
    private _initInterval() {
        setInterval(() => {
            // upgrade building
            if (this._data.innerBuildings != null) {
                for (const key in this._data.innerBuildings) {
                    const value = this._data.innerBuildings[key];
                    if (!value.upgrading) {
                        continue;
                    }
                    const currentTimestamp: number = new Date().getTime();
                    if (currentTimestamp < value.upgradeEndTimestamp) {
                        NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_UPGRADE_COUNT_TIME_CHANGED);
                    } else {
                        value.upgrading = true;
                        NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, key);
                    }
                    // if (value.upgradeCountTime < value.upgradeTotalTime) {
                    //     value.upgradeCountTime += 1;
                    //     NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_UPGRADE_COUNT_TIME_CHANGED);

                    //     if (value.upgradeCountTime >= value.upgradeTotalTime) {
                    //         value.upgradeCountTime = 0;
                    //         value.upgradeTotalTime = 0;
                    //         value.buildLevel += 1;
                    //         // buildingConfig
                    //         const innerData = InnerBuildingConfig.getByBuildingType(key as InnerBuildingType);
                    //         if (innerData != null) {
                    //             const expValue = InnerBuildingLvlUpConfig.getBuildingLevelData(value.buildLevel, innerData.lvlup_exp);
                    //             if (expValue != null && expValue > 0) {
                    //                 this.gainExp(expValue);
                    //             }
                    //             const progressValue = InnerBuildingLvlUpConfig.getBuildingLevelData(value.buildLevel, innerData.lvlup_progress);
                    //             if (progressValue != null && progressValue > 0) {
                    //                 this.gainTreasureProgress(progressValue);
                    //             }
                    //         }
                    //         NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, key);
                    //     }
                    // }
                }
            }

            // generate troops
            if (this._data.generateTroopInfo != null) {
                if (this._data.generateTroopInfo.countTime > 0) {
                    this._data.generateTroopInfo.countTime -= 1;
                    NotificationMgr.triggerEvent(NotificationName.GENERATE_TROOP_TIME_COUNT_CHANGED);

                    if (this._data.generateTroopInfo.countTime <= 0) {
                        this._data.generateTroopInfo = null;
                        NotificationMgr.triggerEvent(NotificationName.GENERATE_TROOP_NUM_TO_CHANGE, { generateNum: this._data.generateTroopInfo.troopNum });
                    }
                }
            }
        }, 1000);
    }
}
