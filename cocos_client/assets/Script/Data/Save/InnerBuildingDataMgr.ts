import { InnerBuildingType, UserInnerBuildInfo } from "../../Const/BuildingDefine";
import { share } from "../../Net/msg/WebsocketMsg";
import NetGlobalData from "./Data/NetGlobalData";

export default class InnerBuildingDataMgr {
    private _data: Map<InnerBuildingType, UserInnerBuildInfo> = null;

    public loadObj() {
        this._initData();
    }
    //------------------------------------------------
    public get data() {
        return this._data;
    }

    public replaceData(netBuilding: share.Ibuilding_data) {
        const newObj = this._convertNetDataToObject(netBuilding);
        newObj.buildBeginLatticeIndex = this._data.has(newObj.buildType) ? this._data.get(newObj.buildType).buildBeginLatticeIndex : null;
        this._data.set(newObj.buildType, newObj);
    }
    public changeBuildingLatticeBeginIndex(buildingType: InnerBuildingType, beginIndex: number) {
        if (!this._data.has(buildingType)) {
            return;
        }
        this._data.get(buildingType).buildBeginLatticeIndex = beginIndex;
    }
    public getInnerBuildingLevel(buildingType: InnerBuildingType) {
        let level: number = 0;
        if (this._data.has(buildingType)) {
            level = this._data.get(buildingType).buildLevel;
        }
        return level;
    }
    //------------------------------------------------
    private _initData() {
        this._data = new Map();
        if (NetGlobalData.innerBuildings == null) {
            return;
        }
        for (const building of NetGlobalData.innerBuildings) {
            this._data.set(building.id as InnerBuildingType, this._convertNetDataToObject(building));
        }
    }

    private _convertNetDataToObject(netData: share.Ibuilding_data): UserInnerBuildInfo {
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
}