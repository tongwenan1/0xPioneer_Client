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
import { WebsocketMsg } from "../../Net/msg/WebsocketMsg";

export default class UserInfoDataMgr {
    private _baseKey: string = "user_Info";
    private _key: string = "";

    private _data: UserInfoObject = null;
    public constructor() {}
    //--------------------------------
    public loadObj(walletAddr: string, archives: string) {
        this._key = walletAddr + "|" + this._baseKey;
        this._initData(archives);
    }
    public saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));

        // upload
        const json = JSON.stringify({ userInfo: this._data });
        NetworkMgr.websocketMsg.save_archives({
            archives: json,
        });
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
    public beginUpgrade(buildingType: InnerBuildingType, upgradeTime: number) {
        const buildInfo = this._data.innerBuildings[buildingType];
        if (buildInfo == null) {
            return;
        }
        buildInfo.upgradeCountTime = 0;
        buildInfo.upgradeTotalTime = upgradeTime;
        this.saveObj();
        NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_BEGIN_UPGRADE, buildingType);
    }

    public changeBuildingLatticeBeginIndex(buildingType: InnerBuildingType, beginIndex: number) {
        const buildInfo = this._data.innerBuildings[buildingType];
        if (buildInfo == null) {
            return;
        }
        buildInfo.buildBeginLatticeIndex = beginIndex;
        this.saveObj();
    }

    public getExplorationReward(boxId: string) {
        this._data.treasureDidGetRewards.push(boxId);
        this.saveObj();
    }
    public getPointExplorationReward(boxId: string) {
        this._data.pointTreasureDidGetRewards.push(boxId);
        this.saveObj();
    }

    public beginGenerateTroop(leftTime: number, troopNum: number) {
        this._data.generateTroopInfo = {
            countTime: leftTime,
            troopNum: troopNum,
        };
        this.saveObj();
    }

    public finishRookie() {
        this._data.didFinishRookie = true;
        this.saveObj();
    }

    public changePlayerName(name: string) {
        this._data.name = name;
        this.saveObj();

        NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_NAME);
    }

    public gainExp(exp: number): void {
        if (exp <= 0) {
            return;
        }
        this._data.exp += exp;

        let isLvlup: boolean = false;
        let parseLv: boolean = true;
        const nextLvConfigs: LvlupConfigData[] = [];
        do {
            const lvlConfig = LvlupConfig.getById(this._data.level.toString());
            const nextLvConfig = LvlupConfig.getById((this._data.level + 1).toString());
            if (nextLvConfig != null) {
                if (this._data.exp >= lvlConfig.exp) {
                    isLvlup = true;
                    this._data.level += 1;
                    this._data.exp -= lvlConfig.exp;
                    this._data.cityRadialRange += nextLvConfig.city_vision;
                    nextLvConfigs.push(nextLvConfig);
                } else {
                    parseLv = false;
                }
            } else {
                parseLv = false;
            }
        } while (parseLv);

        this.saveObj();

        NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_EXP, { exp: exp });

        if (isLvlup) {
            for (let i = 0; i < nextLvConfigs.length; i++) {
                const nextLvConfig = nextLvConfigs[i];
                // hpmax
                let hpMaxChangeValue: number = 0;
                if (nextLvConfig.hp_max > 0) {
                    hpMaxChangeValue += nextLvConfig.hp_max;
                }

                // event_building
                const showBuildingIds: string[] = [];
                if (nextLvConfig.event_building != null) {
                    for (const buidingId of nextLvConfig.event_building) {
                        showBuildingIds.push(buidingId);
                    }
                }

                // reward
                const rewards: GetPropData[] = [];
                if (nextLvConfig.reward != null) {
                    for (const propData of nextLvConfig.reward) {
                        rewards.push({
                            type: propData[0],
                            propId: propData[1],
                            num: propData[2],
                        });
                    }
                }
                NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_LEVEL, {
                    hpMaxChangeValue: hpMaxChangeValue,
                    showBuildingIds: showBuildingIds,
                    rewards: rewards,
                });
            }
        }
    }

    public gainTreasureProgress(progress: number): void {
        if (progress <= 0) {
            return;
        }

        this._data.treasureProgress += progress;
        this.saveObj();

        NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_TREASURE_PROGRESS);
    }

    public gainGenerateEnergy(energy: number): void {
        if (this._data.generateEnergyInfo == null) {
            return;
        }
        const energyBuildingData = this._data.innerBuildings[InnerBuildingType.EnergyStation];
        if (energyBuildingData == null) {
            return;
        }
        const generateConfig = InnerBuildingLvlUpConfig.getEnergyLevelData(energyBuildingData.buildLevel);
        if (generateConfig == null) {
            return;
        }
        this._data.generateEnergyInfo.totalEnergyNum = Math.min(this._data.generateEnergyInfo.totalEnergyNum + energy, generateConfig.storage);
        this.saveObj();
        NotificationMgr.triggerEvent(NotificationName.GENERATE_ENERGY_NUM_DID_CHANGE);
    }
    public generateEnergyGetted() {
        if (this._data.generateEnergyInfo == null) {
            return;
        }
        this._data.generateEnergyInfo.totalEnergyNum = 0;
        NotificationMgr.triggerEvent(NotificationName.GENERATE_ENERGY_NUM_DID_CHANGE);
    }

    public setWormholeDefenderId(pioneerId: string, index: number) {
        if (index < 0 || index >= this._data.wormholeDefenderIds.length) {
            return;
        }
        this._data.wormholeDefenderIds[index] = pioneerId;
        this.saveObj();
    }
    //------------------------------------------------------------------------
    private async _initData(archives: string = null) {
        if (archives != null && archives.length > 0) {
            this._data = JSON.parse(archives).userInfo;
            console.log("exce d: ", this._data);
        } else {
            const localDataString: string = localStorage.getItem(this._key);
            if (localDataString == null) {
                this._data = {
                    id: "1001",
                    name: "Player",
                    level: 1,
                    exp: 0,
                    treasureProgress: 0,
                    heatValue: {
                        getTimestamp: 0,
                        currentHeatValue: 0,
                    },
                    tavernGetPioneerTimestamp: 0,
                    treasureDidGetRewards: [],
                    pointTreasureDidGetRewards: [],
                    cityRadialRange: 7,
                    didFinishRookie: false,
                    generateTroopInfo: null,
                    generateEnergyInfo: null,
                    innerBuildings: {},
                    wormholeDefenderIds: ["", "", ""],
                };
                const buildingInfo = InnerBuildingConfig.getConfs();
                for (const key in buildingInfo) {
                    this._data.innerBuildings[key] = {
                        buildBeginLatticeIndex: null,
                        buildType: buildingInfo[key].id,
                        buildLevel: 0,
                        upgradeCountTime: 0,
                        upgradeTotalTime: 0,
                    };
                }
                this.saveObj();
            } else {
                this._data = JSON.parse(localDataString);
            }
        }
        this._initInterval();
    }
    private _initInterval() {
        setInterval(() => {
            // upgrade building
            if (this._data.innerBuildings != null) {
                for (const key in this._data.innerBuildings) {
                    const value = this._data.innerBuildings[key];
                    if (value.upgradeCountTime < value.upgradeTotalTime) {
                        value.upgradeCountTime += 1;
                        this.saveObj();
                        NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_UPGRADE_COUNT_TIME_CHANGED);

                        if (value.upgradeCountTime >= value.upgradeTotalTime) {
                            value.upgradeCountTime = 0;
                            value.upgradeTotalTime = 0;
                            value.buildLevel += 1;
                            // buildingConfig
                            const innerData = InnerBuildingConfig.getByBuildingType(key as InnerBuildingType);
                            if (innerData != null) {
                                const expValue = InnerBuildingLvlUpConfig.getBuildingLevelData(value.buildLevel, innerData.lvlup_exp);
                                if (expValue != null && expValue > 0) {
                                    this.gainExp(expValue);
                                }
                                const progressValue = InnerBuildingLvlUpConfig.getBuildingLevelData(value.buildLevel, innerData.lvlup_progress);
                                if (progressValue != null && progressValue > 0) {
                                    this.gainTreasureProgress(progressValue);
                                }
                            }
                            this.saveObj();
                            NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, key);
                        }
                    }
                }
            }

            // generate troops
            if (this._data.generateTroopInfo != null) {
                if (this._data.generateTroopInfo.countTime > 0) {
                    this._data.generateTroopInfo.countTime -= 1;
                    this.saveObj();
                    NotificationMgr.triggerEvent(NotificationName.GENERATE_TROOP_TIME_COUNT_CHANGED);

                    if (this._data.generateTroopInfo.countTime <= 0) {
                        this._data.generateTroopInfo = null;
                        this.saveObj();
                        NotificationMgr.triggerEvent(NotificationName.GENERATE_TROOP_NUM_TO_CHANGE, { generateNum: this._data.generateTroopInfo.troopNum });
                    }
                }
            }
            // generate energy
            let energyStationBuilded: boolean = false;
            if (this._data.innerBuildings != null && InnerBuildingType.EnergyStation in this._data.innerBuildings) {
                energyStationBuilded = this._data.innerBuildings[InnerBuildingType.EnergyStation].buildLevel > 0;
            }
            if (energyStationBuilded) {
                const energyBuildingData = this._data.innerBuildings[InnerBuildingType.EnergyStation];
                const generateConfig = InnerBuildingLvlUpConfig.getEnergyLevelData(energyBuildingData.buildLevel);
                const perGenerateTime: number = 5;
                if (this._data.generateEnergyInfo == null) {
                    this._data.generateEnergyInfo = {
                        countTime: perGenerateTime,
                        totalEnergyNum: 0,
                    };
                }
                if (this._data.generateEnergyInfo.totalEnergyNum >= generateConfig.storage) {
                    this._data.generateEnergyInfo.countTime = perGenerateTime;
                } else {
                    if (this._data.generateEnergyInfo.countTime > 0) {
                        this._data.generateEnergyInfo.countTime -= 1;
                        this.saveObj();
                        NotificationMgr.triggerEvent(NotificationName.GENERATE_ENERGY_TIME_COUNT_CHANGED);

                        if (this._data.generateEnergyInfo.countTime <= 0) {
                            this._data.generateEnergyInfo.countTime = perGenerateTime;
                            this.saveObj();
                            NotificationMgr.triggerEvent(NotificationName.GENERATE_ENERGY_NUM_TO_CHANGE);
                        }
                    }
                }
            }
        }, 1000);
    }
}
