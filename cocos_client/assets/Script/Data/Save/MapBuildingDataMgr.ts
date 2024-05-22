import { Vec2, v2 } from "cc";
import { MapBuildingType } from "../../Const/BuildingDefine";
import {
    MapBuildingBaseObject,
    MapBuildingMainCityObject,
    MapBuildingObject,
    MapBuildingTavernObject,
    MapBuildingWormholeObject,
    MapDecorateObject,
    StayMapPosition,
} from "../../Const/MapBuilding";
import { MapMemberFactionType } from "../../Const/ConstDefine";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import CLog from "../../Utils/CLog";
import { NFTPioneerObject } from "../../Const/NFTPioneerDefine";
import NetGlobalData from "./Data/NetGlobalData";
import CommonTools from "../../Tool/CommonTools";
import { share } from "../../Net/msg/WebsocketMsg";

export class MapBuildingDataMgr {
    private _building_data: MapBuildingObject[];
    public constructor() {}

    public replaceData(index: number, data: share.Imapbuilding_info_data) {
        this._building_data[index] = this._convertNetDataToObject(data);
    }
    private _loadObj_mapPositions(data: StayMapPosition[]) {
        const mapPositions: Vec2[] = [];
        for (const pos of data) {
            mapPositions.push(new Vec2(pos.x, pos.y));
        }
        return mapPositions;
    }

    public async loadObj() {
        this._building_data = [];
        if (NetGlobalData.mapBuildings == null) {
            return;
        }
        const mapBuilings = NetGlobalData.mapBuildings.buildings;
        for (const key in mapBuilings) {
            const element: share.Imapbuilding_info_data = mapBuilings[key];
            this._building_data.push(this._convertNetDataToObject(element));
        }
        console.log("exce m:", this._building_data);
        this._initInterval();
        CLog.debug("MapBuildingDataMgr: loadObj/building_data, ", this._building_data);
    }
    private _convertNetDataToObject(element: share.Imapbuilding_info_data): MapBuildingObject {
        const stayPos: Vec2[] = [];
        for (const templePos of element.stayMapPositions) {
            stayPos.push(new Vec2(templePos.x, templePos.y));
        }
        const baseObj: MapBuildingBaseObject = {
            id: element.id,
            name: element.name,
            type: element.type,
            level: element.level,
            show: element.show,
            faction: element.faction,
            defendPioneerIds: element.defendPioneerIds,
            stayPosType: element.stayPosType,
            progress: element.progress,
            winprogress: element.winprogress,
            eventId: element.eventId,
            originalEventId: element.originalEventId,
            exp: element.exp,
            animType: element.animType,
            stayMapPositions: stayPos,
            gatherPioneerIds: element.gatherPioneerIds,
        };
        if (baseObj.type == MapBuildingType.city) {
            const cityObj: MapBuildingMainCityObject = {
                ...baseObj,
                hpMax: element.hpMax,
                hp: element.hp,
                attack: element.attack,
                taskObj: null,
            };
            return cityObj;
        } else if (baseObj.type == MapBuildingType.wormhole) {
            const attackerMap: Map<number, string> = new Map();
            for (const key in element.attacker) {
                if (element.attacker[key] == null || element.attacker[key] == "") {
                    continue;
                }
                attackerMap.set(parseInt(key), element.attacker[key]);
            }
            const wormholeObj: MapBuildingWormholeObject = {
                ...baseObj,
                wormholdCountdownTime: element.wormholdCountdownTime * 1000,
                attacker: attackerMap,
            };
            console.log('exce wobj:', wormholeObj);
            return wormholeObj;
        } else {
            return baseObj;
        }
    }
    private _initInterval() {
        setInterval(() => {
            for (const obj of this._building_data) {
                if (obj.type == MapBuildingType.tavern) {
                    const tavern = obj as MapBuildingTavernObject;
                    if (tavern.tavernCountdownTime > 0) {
                        tavern.tavernCountdownTime -= 1;

                        NotificationMgr.triggerEvent(NotificationName.BUILDING_TAVERN_COUNT_DOWN_TIME_DID_CHANGE, { id: tavern.id });

                        if (tavern.tavernCountdownTime == 0) {
                            NotificationMgr.triggerEvent(NotificationName.BUILDING_TAVERN_COUNT_DOWN_TIME_DID_FINISH, { id: tavern.id });
                        }
                    }
                }
            }
        }, 1000);
    }

    // get obj
    public getObj_building() {
        return this._building_data;
    }
    public getBuildingById(buidingId: string): MapBuildingObject | null {
        const findDatas = this._building_data.filter((buiding) => {
            return buiding.id === buidingId;
        });
        if (findDatas.length > 0) {
            return findDatas[0];
        }
        return null;
    }
    public insertDefendPioneer(buildingId: string, pioneerId: string) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;
        findBuilding.defendPioneerIds.push(pioneerId);

        if (findBuilding.type == MapBuildingType.wormhole && findBuilding.defendPioneerIds.length == 3) {
            // go wormhole fight countdown
            (findBuilding as MapBuildingWormholeObject).wormholdCountdownTime = 30;
        }

        NotificationMgr.triggerEvent(NotificationName.BUILDING_INSERT_DEFEND_PIONEER);
    }
    public removeDefendPioneer(buildingId: string, pioneerId: string) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;

        const index = findBuilding.defendPioneerIds.indexOf(pioneerId);
        if (index === -1) {
            CLog.error(`MapBuildingDataMgr: removeDefendPioneer, buildingId[${buildingId}] don't have pioneerid[${pioneerId}]`);
            return;
        }
        findBuilding.defendPioneerIds.splice(index, 1);
        NotificationMgr.triggerEvent(NotificationName.BUILDING_REMOVE_DEFEND_PIONEER);
    }
    public buildingGetTask(buildingId: string, task) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;
        if (findBuilding.type != MapBuildingType.city) return;

        (findBuilding as MapBuildingMainCityObject).taskObj = task;
    }
    public buildingClearTask(buildingId: string) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;
        if (findBuilding.type != MapBuildingType.city) return;

        (findBuilding as MapBuildingMainCityObject).taskObj = null;
    }
    public changeBuildingEventId(buidingId: string, eventId: string) {
        const findBuilding = this.getBuildingById(buidingId);
        if (findBuilding == null) return;

        findBuilding.eventId = eventId;
    }
    public fillBuildingStayPos(buildingId: string, newPosions: Vec2[]) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;

        findBuilding.stayMapPositions = newPosions;
    }
    public getResourceBuildings() {
        return this._building_data.filter((buiding) => {
            return buiding.type === MapBuildingType.resource;
        });
    }
    public getStrongholdBuildings() {
        return this._building_data.filter((buiding) => {
            return buiding.type === MapBuildingType.stronghold;
        });
    }
    public getWormholeBuildings() {
        return this._building_data.filter((buiding) => {
            return buiding.type === MapBuildingType.wormhole;
        });
    }
    public beginRecruitNewNft(buildingId: string, recruitTime: number) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;
        if (findBuilding.type != MapBuildingType.tavern) return;
        const tavern = findBuilding as MapBuildingTavernObject;
        tavern.tavernCountdownTime = recruitTime;
    }
    public changeBuildingNewNft(buildingId: string, nft: NFTPioneerObject) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;
        if (findBuilding.type != MapBuildingType.tavern) return;
        const tavern = findBuilding as MapBuildingTavernObject;
        tavern.nft = nft;

        NotificationMgr.triggerEvent(NotificationName.BUILDING_NEW_PIONEER_DID_CHANGE, { id: buildingId });
    }
    public getShowBuildingsNearMapPos(mapPos: Vec2, range: number) {
        return this._building_data.filter((buiding) => {
            if (buiding.show) {
                for (const pos of buiding.stayMapPositions) {
                    if (Math.abs(pos.x - mapPos.x) < range && Math.abs(pos.y - mapPos.y) < range) {
                        return true;
                    }
                }
            }
            return false;
        });
    }
    public getShowBuildingByMapPos(mapPos: Vec2): MapBuildingObject | null {
        const findDatas = this._building_data.filter((buiding) => {
            if (buiding.show) {
                for (const pos of buiding.stayMapPositions) {
                    if (pos.x === mapPos.x && pos.y === mapPos.y) {
                        return true;
                    }
                }
            }
            return false;
        });
        if (findDatas.length > 0) {
            return findDatas[0];
        }
        return null;
    }
}
