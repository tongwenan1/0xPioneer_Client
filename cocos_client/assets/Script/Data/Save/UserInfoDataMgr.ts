import NotificationMgr from "../../Basic/NotificationMgr";
import InnerBuildingConfig from "../../Config/InnerBuildingConfig";
import InnerBuildingLvlUpConfig from "../../Config/InnerBuildingLvlUpConfig";
import LvlupConfig from "../../Config/LvlupConfig";
import { InnerBuildingType, UserInnerBuildInfo } from "../../Const/BuildingDefine";
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
    public convertNetDataToObject(netData: share.Ibuilding_data): UserInnerBuildInfo {
        const currentTime: number = new Date().getTime();
        return {
            buildType: netData.id as InnerBuildingType,
            buildLevel: netData.level,
            upgrading: netData.upgradeIng,
            upgradeBeginTimestamp: currentTime,
            upgradeEndTimestamp: currentTime + (netData.upgradeTotalTime - netData.upgradeCountTime) * 1000,
            troopIng: netData.troopIng,
            troopStartTime: currentTime,
            troopEndTime: currentTime + (netData.troopEndTime - netData.troopStartTime) * 1000,
            troopNum: netData.troopNum,
            buildBeginLatticeIndex: null
        };
    }

    public replaceData(netBuilding: share.Ibuilding_data) {
        const buildInfo = this._data.innerBuildings[netBuilding.id];
        if (buildInfo == null) {
            return;
        }
        this._data.innerBuildings[netBuilding.id] = this.convertNetDataToObject(netBuilding);
        this._data.innerBuildings[netBuilding.id].buildBeginLatticeIndex = buildInfo.buildBeginLatticeIndex;
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
            treasureDidGetRewards: globalData.treasureDidGetRewards,
            pointTreasureDidGetRewards: globalData.pointTreasureDidGetRewards,
            heatValue: {
                getTimestamp: globalData.heatValue.getTimestamp,
                currentHeatValue: globalData.heatValue.currentHeatValue,
                lotteryTimes: globalData.heatValue.lotteryTimes,
                lotteryProcessLimit: globalData.heatValue.lotteryProcessLimit,
                lotteryTimesLimit: globalData.heatValue.lotteryTimesLimit
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
            this._data.innerBuildings[building.id] = this.convertNetDataToObject(building);
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
        
    }
}
