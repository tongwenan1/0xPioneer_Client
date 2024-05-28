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
    //--------------------------------
    public replaceData(netData: share.Iplayer_sinfo) {
        this._data = this._convertNetDataToObject(netData);
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
    //------------------------------------------------------------------------
    private async _initData() {
        if (NetGlobalData.userInfo == null) {
            return;
        }
        const globalData: share.Iplayer_sinfo = NetGlobalData.userInfo;
        this._data = this._convertNetDataToObject(globalData);
        this._initInterval();
    }
    private _initInterval() {}
    private _convertNetDataToObject(netData: share.Iplayer_sinfo): UserInfoObject {
        const newObj: UserInfoObject = {
            id: netData.playerid.toString(),
            name: netData.pname,
            level: netData.level,
            exp: netData.exp,
            exploreProgress: netData.treasureProgress,
            treasureDidGetRewards: netData.treasureDidGetRewards,
            pointTreasureDidGetRewards: netData.pointTreasureDidGetRewards,
            heatValue: {
                getTimestamp: netData.heatValue.getTimestamp,
                currentHeatValue: netData.heatValue.currentHeatValue,
                lotteryTimes: netData.heatValue.lotteryTimes,
                lotteryProcessLimit: netData.heatValue.lotteryProcessLimit,
                lotteryTimesLimit: netData.heatValue.lotteryTimesLimit,
            },
            energyDidGetTimes: netData.currFetchTimes,
            energyGetLimitTimes: netData.limitFetchTimes,
            cityRadialRange: netData.cityRadialRange,
            didFinishRookie: netData.didFinishRookie,
            // lost
            tavernGetPioneerTimestamp: 0,
            wormholeDefenderIds: new Map()
        };
        if (netData.defender != null) {
            for (const key in netData.defender) {
                if (netData.defender[key] == null || netData.defender[key] == "") {
                    continue;
                }
                newObj.wormholeDefenderIds.set(parseInt(key), netData.defender[key]);
            }
        }
        return newObj;
    }
}
