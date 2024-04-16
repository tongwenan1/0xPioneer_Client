import { Asset, __private, resources, sys } from "cc";
import { GetPropData, ResourceCorrespondingItem } from "../Const/ConstDefine";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";
import ArtifactData from "../Model/ArtifactData";
import { ArtifactMgr, CountMgr, ItemMgr, PioneerMgr, TaskMgr } from "../Utils/Global";
import NotificationMgr from "../Basic/NotificationMgr";
import { UserInfoEvent, GenerateTroopInfo, GenerateEnergyInfo } from "../Const/UserInfoDefine";
import { InnerBuildingType, UserInnerBuildInfo } from "../Const/BuildingDefine";
import InnerBuildingLvlUpConfig from "../Config/InnerBuildingLvlUpConfig";
import InnerBuildingConfig from "../Config/InnerBuildingConfig";
import { CountType } from "../Const/Count";
import LvlupConfig from "../Config/LvlupConfig";
import { LvlupConfigData } from "../Const/Lvlup";
import ItemData from "../Const/Item";
import { NotificationName } from "../Const/Notification";
import Config from "../Const/Config";
import { ArtifactEffectType } from "../Const/Artifact";
import { DataMgr } from "../Data/DataMgr";
import { MapPioneerObject } from "../Const/PioneerDefine";

export default class UserInfoMgr {

    public async initData() {
        await this._initData();
        NotificationMgr.addListener(NotificationName.TASK_STEP_FINISHED, this._onTaskStepFinished, this);
    }

    public addObserver(observer: UserInfoEvent) {
        this._observers.push(observer);
    }
    public removeObserver(observer: UserInfoEvent) {
        const index: number = this._observers.indexOf(observer);
        if (index != -1) {
            this._observers.splice(index, 1);
        }
    }
    public beginUpgrade(buildingType: InnerBuildingType, upgradeTime: number) {
        const buildInfo = this._innerBuilds.get(buildingType);
        if (buildInfo != null) {
            buildInfo.upgradeCountTime = 0;
            buildInfo.upgradeTotalTime = upgradeTime;

            this._localJsonData.innerBuildData[buildingType] = buildInfo;
            this._localDataChanged(this._localJsonData);

            NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_BEGIN_UPGRADE, buildingType);
        }
    }
    public upgradeFinished(buildingType: InnerBuildingType) {
        const buildInfo = this._innerBuilds.get(buildingType);
        if (buildInfo != null) {
            buildInfo.upgradeCountTime = 0;
            buildInfo.upgradeTotalTime = 0;
            buildInfo.buildLevel += 1;
            this._localJsonData.innerBuildData[buildingType] = buildInfo;
            this._localDataChanged(this._localJsonData);

            const innerData = InnerBuildingConfig.getByBuildingType(buildingType);
            if (innerData != null) {
                const expValue = InnerBuildingLvlUpConfig.getBuildingLevelData(buildInfo.buildLevel, innerData.lvlup_exp);
                if (expValue != null && expValue > 0) {
                    this.exp += expValue;
                }
                const progressValue = InnerBuildingLvlUpConfig.getBuildingLevelData(buildInfo.buildLevel, innerData.lvlup_progress);
                if (progressValue != null && progressValue > 0) {
                    this.explorationValue += progressValue;
                }
            }


            if (buildInfo.buildType == InnerBuildingType.House) {
                // build house

            }
            CountMgr.addNewCount({
                type: CountType.buildInnerBuilding,
                timeStamp: new Date().getTime(),
                data: {
                    bId: buildingType,
                    level: buildInfo.buildLevel,
                }
            });
        }
    }
    public changeBuildingLatticeBeginIndex(buildingType: InnerBuildingType, beginIndex: number) {
        const buildInfo = this._innerBuilds.get(buildingType);
        if (buildInfo != null) {
            buildInfo.buildBeginLatticeIndex = beginIndex;
            this._localJsonData.innerBuildData[buildingType] = buildInfo;
            this._localDataChanged(this._localJsonData);
        }
    }
    public getExplorationReward(boxId: string) {
        this._gettedExplorationRewardIds.push(boxId);
        this._localJsonData.playerData.gettedExplorationRewardIds = this._gettedExplorationRewardIds;
        this._localDataChanged(this._localJsonData);

        CountMgr.addNewCount({
            type: CountType.openBox,
            timeStamp: new Date().getTime(),
            data: {
                id: boxId
            }
        });
    }

    public beginGenerateTroop(leftTime: number, troopNum: number) {
        this._generateTroopInfo = {
            countTime: leftTime,
            troopNum: troopNum
        };
        this._localJsonData.playerData.generateTroopInfo = this._generateTroopInfo;
        this._localDataChanged(this._localJsonData);

        CountMgr.addNewCount({
            type: CountType.generateTroops,
            timeStamp: new Date().getTime(),
            data: {
                num: troopNum
            }
        });
    }

    public generateEnergyGetted() {
        if (this._generateEnergyInfo == null) {
            return;
        }
        this._generateEnergyInfo.totalEnergyNum = 0;
        NotificationMgr.triggerEvent(NotificationName.GENERATE_ENERGY_NUM_CHANGED);
    }

    public get afterTalkItemGetData() {
        return this._afterTalkItemGetData;
    }
    public get afterCivilizationClosedShowItemDatas() {
        return this._afterCivilizationClosedShowItemDatas;
    }
    public get afterCivilizationClosedShowArtifactDatas() {
        return this._afterCivilizationClosedShowArtifactDatas;
    }
    public get afterCivilizationClosedShowPioneerDatas() {
        return this._afterCivilizationClosedShowPioneerDatas;
    }
    public get isFinishRookie() {
        return this._isFinishRookie;
    }

    public get playerID() {
        return this._playerID;
    }
    public get playerName() {
        return this._playerName;
    }
    public get level() {
        return this._level;
    }
    public get exp() {
        return this._exp;
    }
    public get cityVision() {
        return this._cityVision;
    }
    public get innerBuilds(): Map<InnerBuildingType, UserInnerBuildInfo> {
        return this._innerBuilds;
    }
    public get artifactStoreLevel(): number {
        let level: number = 0;
        if (this._innerBuilds != null && this._innerBuilds.has(InnerBuildingType.ArtifactStore)) {
            level = this._innerBuilds.get(InnerBuildingType.ArtifactStore).buildLevel;
        }
        return level;
    }
    public get explorationValue() {
        return this._explorationValue;
    }
    public get gettedExplorationRewardIds() {
        return this._gettedExplorationRewardIds;
    }
    public get generateTroopInfo() {
        return this._generateTroopInfo;
    }
    public get generateEnergyInfo() {
        return this._generateEnergyInfo;
    }



    public set isFinishRookie(value: boolean) {
        this._isFinishRookie = value;
        this._localJsonData.playerData.isFinishRookie = value;
        this._localDataChanged(this._localJsonData);
    }
    public set playerName(value: string) {
        this._playerName = value;
        this._localJsonData.playerData.playerName = value;
        this._localDataChanged(this._localJsonData);

        for (const observe of this._observers) {
            if (observe.playerNameChanged) {
                observe.playerNameChanged(value);
            }
        }
    }
    public set exp(value: number) {
        const original = this._exp;
        this._exp = value;

        let isLvlup: boolean = false;
        let parseLv: boolean = true;
        const nextLvConfigs: LvlupConfigData[] = [];
        do {
            const lvlConfig = LvlupConfig.getById(this._level.toString());
            const nextLvConfig = LvlupConfig.getById((this._level + 1).toString());
            if (nextLvConfig != null) {
                if (this._exp >= lvlConfig.exp) {
                    isLvlup = true;
                    this._level += 1;
                    this._exp -= lvlConfig.exp;
                    this.cityVision += nextLvConfig.city_vision;

                    nextLvConfigs.push(nextLvConfig);
                }
                else {
                    parseLv = false;
                }
            }
            else {
                parseLv = false;
            }
        }
        while (parseLv);

        this._localJsonData.playerData.exp = this._exp;
        this._localJsonData.playerData.level = this._level;
        this._localDataChanged(this._localJsonData);

        if (value != original) {
            for (const observe of this._observers) {
                if (observe.playerExpChanged != null) {
                    observe.playerExpChanged(value - original);
                }
            }
        }

        if (isLvlup) {
            for (let i = 0; i < nextLvConfigs.length; i++) {
                const nextLvConfig = nextLvConfigs[i];

                for (const observe of this._observers) {
                    if (observe.playerLvlupChanged != null) {
                        observe.playerLvlupChanged(this._level);
                    }
                }

                // hpmax
                if (nextLvConfig.hp_max > 0) {
                    PioneerMgr.pioneerChangeAllPlayerHpMax(nextLvConfig.hp_max);
                }

                // event_building
                if (nextLvConfig.event_building != null) {
                    for (const buidingId of nextLvConfig.event_building) {
                        // BuildingMgr.showBuilding(buidingId);
                        DataMgr.s.mapBuilding.showBuilding(buidingId);
                    }
                }

                // reward
                if (nextLvConfig.reward != null) {
                    const propDatas: GetPropData[] = [];
                    for (const propData of nextLvConfig.reward) {
                        if (propData.length != 3) {
                            continue;
                        }
                        propDatas.push({
                            type: propData[0],
                            propId: propData[1],
                            num: propData[2]
                        });
                    }
                    ItemConfigDropTool.getItemByConfig(propDatas, false);
                }
            }
        }
    }
    public set cityVision(value: number) {
        const original = this._cityVision;
        this._cityVision = value;
        this._localJsonData.playerData.cityVision = value;
        this._localDataChanged(this._localJsonData);
    }
    public set explorationValue(value: number) {
        const original = this._explorationValue;
        let addNum = value - original;
        const effect = ArtifactMgr.getEffectiveEffect(this.artifactStoreLevel);
        if (effect != null && effect.has(ArtifactEffectType.TREASURE_PROGRESS)) {
            addNum = Math.floor(addNum + addNum * effect.get(ArtifactEffectType.TREASURE_PROGRESS));
        }
        this._explorationValue = original + addNum;

        this._localJsonData.playerData.explorationValue = this._explorationValue;
        this._localDataChanged(this._localJsonData);

        if (this._explorationValue != original) {
            for (const observe of this._observers) {
                if (observe.playerExplorationValueChanged != null) {
                    observe.playerExplorationValueChanged(this._explorationValue - original);
                }
            }
        }
    }
    public set afterCivilizationClosedShowItemDatas(itemDatas: ItemData[]) {
        this._afterCivilizationClosedShowItemDatas = itemDatas;
    }
    public set afterCivilizationClosedShowArtifactDatas(artifactDatas: ArtifactData[]) {
        this._afterCivilizationClosedShowArtifactDatas = artifactDatas;
    }
    public set afterCivilizationClosedShowPioneerDatas(pioneerDatas: MapPioneerObject[]) {
        this._afterCivilizationClosedShowPioneerDatas = pioneerDatas;
    }

    public constructor() {
        setInterval(() => {
            // upgrade building
            if (this._innerBuilds != null) {
                this._innerBuilds.forEach((value: UserInnerBuildInfo, key: InnerBuildingType) => {
                    if (value.upgradeCountTime < value.upgradeTotalTime) {
                        value.upgradeCountTime += 1;
                        this._localJsonData.innerBuildData[key] = value;
                        this._localDataChanged(this._localJsonData);

                        NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_UPGRADE_COUNT_TIME_CHANGED);

                        if (value.upgradeCountTime >= value.upgradeTotalTime) {
                            this.upgradeFinished(key);
                            this._localJsonData.innerBuildData[key] = value;
                            this._localDataChanged(this._localJsonData);

                            NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, key);
                        }
                    }
                });
            }

            // generate troops
            if (this._generateTroopInfo != null) {
                if (this._generateTroopInfo.countTime > 0) {
                    this._generateTroopInfo.countTime -= 1;
                }
                this._localJsonData.playerData.generateTroopInfo = this._generateTroopInfo;
                this._localDataChanged(this._localJsonData);

                NotificationMgr.triggerEvent(NotificationName.GENERATE_TROOP_TIME_COUNT_ChANGED);

                if (this._generateTroopInfo.countTime <= 0) {
                    ItemMgr.addItem([new ItemData(ResourceCorrespondingItem.Troop, this._generateTroopInfo.troopNum)]);
                    this._generateTroopInfo = null;
                    this._localJsonData.playerData.generateTroopInfo = this._generateTroopInfo;
                    this._localDataChanged(this._localJsonData);

                    NotificationMgr.triggerEvent(NotificationName.GENERATE_TROOP_NUM_CHANGED);
                }
            }
            // generate energy
            let energyStationBuilded: boolean = false;
            if (this._innerBuilds != null && this._innerBuilds.has(InnerBuildingType.EnergyStation)) {
                energyStationBuilded = this._innerBuilds.get(InnerBuildingType.EnergyStation).buildLevel > 0;
            }
            if (energyStationBuilded) {
                const energyBuildingData = this._innerBuilds.get(InnerBuildingType.EnergyStation);
                const generateConfig = InnerBuildingLvlUpConfig.getEnergyLevelData(energyBuildingData.buildLevel);
                const perGenerateTime: number = 5;
                if (this._generateEnergyInfo == null) {
                    this._generateEnergyInfo = {
                        countTime: perGenerateTime,
                        totalEnergyNum: 0
                    };
                }
                if (this._generateEnergyInfo.totalEnergyNum >= generateConfig.storage) {
                    this._generateEnergyInfo.countTime = perGenerateTime;
                } else {
                    if (this._generateEnergyInfo.countTime > 0) {
                        this._generateEnergyInfo.countTime -= 1;
                    }
                    this._localJsonData.playerData.generateEnergyInfo = this._generateEnergyInfo;
                    this._localDataChanged(this._localJsonData);

                    NotificationMgr.triggerEvent(NotificationName.GENERATE_ENERGY_TIME_COUNT_CHANGED);

                    if (this._generateEnergyInfo.countTime <= 0) {
                        let generateNumPerMin: number = generateConfig.output;
                        let effectNum: number = 0;
                        const artifactEffect = ArtifactMgr.getEffectiveEffect(this.artifactStoreLevel);
                        if (artifactEffect != null && artifactEffect.has(ArtifactEffectType.ENERGY_GENERATE)) {
                            effectNum = artifactEffect.get(ArtifactEffectType.ENERGY_GENERATE);
                        }
                        generateNumPerMin = Math.floor(generateNumPerMin + generateNumPerMin * effectNum);
                        this._generateEnergyInfo.totalEnergyNum = Math.min(generateConfig.storage, this._generateEnergyInfo.totalEnergyNum + generateNumPerMin);
                        this._generateEnergyInfo.countTime = perGenerateTime;

                        this._localJsonData.playerData.generateEnergyInfo = this._generateEnergyInfo;
                        this._localDataChanged(this._localJsonData);

                        NotificationMgr.triggerEvent(NotificationName.GENERATE_ENERGY_NUM_CHANGED);
                    }
                }
            }
        }, 1000);
    }


    private _afterTalkItemGetData: Map<string, ItemData[]> = new Map();
    private _afterCivilizationClosedShowItemDatas: ItemData[] = [];
    private _afterCivilizationClosedShowArtifactDatas: ArtifactData[] = [];
    private _afterCivilizationClosedShowPioneerDatas: MapPioneerObject[] = [];

    private _isFinishRookie: boolean = false;

    private _playerID: string = null;
    private _playerName: string = null;
    private _level: number = null;
    private _exp: number = null;
    private _cityVision: number = null;
    private _innerBuilds: Map<InnerBuildingType, UserInnerBuildInfo> = null;

    private _explorationValue: number = 0;
    private _gettedExplorationRewardIds: string[] = [];

    private _generateTroopInfo: GenerateTroopInfo = null;
    private _generateEnergyInfo: GenerateEnergyInfo = null;

    private _localJsonData: any = null;

    private _observers: UserInfoEvent[] = [];
    private _localStorageKey: string = "user_Info";
    private async _initData() {
        let jsonObject: any = null;
        const localData = sys.localStorage.getItem(this._localStorageKey);
        if (localData != null) {
            jsonObject = JSON.parse(localData);
        }
        this._localJsonData = jsonObject;
        if (this._localJsonData == null) {
            // init data
            this._localJsonData = {};
            this._localJsonData.playerData = {
                "playerID": "1001",
                "playerName": "Player",
                "level": 1,
                "exp": 0,
                "cityVision": 7
            };

            this._localJsonData.innerBuildData = {};
            const buildingInfo = InnerBuildingConfig.getConfs();
            for (const key in buildingInfo) {
                this._localJsonData.innerBuildData[key] = {
                    buildBeginLatticeIndex: null,
                    buildType: buildingInfo[key].id,
                    buildLevel: 0,
                    upgradeCountTime: 0,
                    upgradeTotalTime: 0
                }
            }
            this._localDataChanged(this._localJsonData);
        }
        this._playerID = this._localJsonData.playerData.playerID;
        this._playerName = this._localJsonData.playerData.playerName;
        this._level = this._localJsonData.playerData.level;
        this._exp = this._localJsonData.playerData.exp;
        this._cityVision = this._localJsonData.playerData.cityVision;

        if (this._localJsonData.playerData.isFinishRookie != null) {
            this._isFinishRookie = this._localJsonData.playerData.isFinishRookie;
        }
        if (this._localJsonData.playerData.explorationValue != null) {
            this._explorationValue = this._localJsonData.playerData.explorationValue;
        }
        if (this._localJsonData.playerData.gettedExplorationRewardIds != null) {
            this._gettedExplorationRewardIds = this._localJsonData.playerData.gettedExplorationRewardIds;
        }
        if (this._localJsonData.playerData.generateTroopInfo != null) {
            this._generateTroopInfo = this._localJsonData.playerData.generateTroopInfo;
        }
        if (this._localJsonData.playerData.generateEnergyInfo != null) {
            this._generateEnergyInfo = this._localJsonData.playerData.generateEnergyInfo;
        }
        this._innerBuilds = new Map();
        for (let id in this._localJsonData.innerBuildData) {
            const innerBuildInfo: UserInnerBuildInfo = new UserInnerBuildInfo();
            innerBuildInfo.buildBeginLatticeIndex = this._localJsonData.innerBuildData[id].buildBeginLatticeIndex;
            innerBuildInfo.buildType = this._localJsonData.innerBuildData[id].buildType;
            innerBuildInfo.buildLevel = this._localJsonData.innerBuildData[id].buildLevel;
            innerBuildInfo.upgradeCountTime = this._localJsonData.innerBuildData[id].upgradeCountTime;
            innerBuildInfo.upgradeTotalTime = this._localJsonData.innerBuildData[id].upgradeTotalTime;

            // test
            // if (innerBuildInfo.buildType == InnerBuildingType.ArtifactStore) {
            //     innerBuildInfo.buildLevel = 20;
            // }

            this._innerBuilds.set(innerBuildInfo.buildType, innerBuildInfo);
        }
    }

    private _localDataChanged(jsonObject: any) {
        if (jsonObject != null) {
            if (Config.canSaveLocalData) {
                sys.localStorage.setItem(this._localStorageKey, JSON.stringify(jsonObject));
            }
        }
    }

    private _onTaskStepFinished(taskId: string) {
        const task = TaskMgr.getTask(taskId);
        if (task != null) {
            const finishedStepIndex: number = task.stepIndex - 1;
            if (finishedStepIndex >= 0 && finishedStepIndex < task.steps.length) {
                const finishedStep = TaskMgr.getTaskStep(task.steps[finishedStepIndex]);
                if (finishedStep.progress != null && finishedStep.progress > 0) {
                    this.explorationValue += finishedStep.progress;
                }
                if (finishedStep.exp != null && finishedStep.exp > 0) {
                    this.exp += finishedStep.exp;
                }
            }
        }
    }
}