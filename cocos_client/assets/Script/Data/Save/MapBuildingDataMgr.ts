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
                showHideStruct: null,
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
            };
            if (baseObj.type == MapBuildingType.city) {
                const cityObj: MapBuildingMainCityObject = {
                    ...baseObj,
                    hpMax: element.hpMax,
                    hp: element.hp,
                    attack: element.attack,
                    taskObj: null,
                };
                this._building_data.push(cityObj);
            } else if (baseObj.type == MapBuildingType.wormhole) {
                const wormholeObj: MapBuildingWormholeObject = {
                    ...baseObj,
                    wormholdCountdownTime: 0,
                };
                this._building_data.push(wormholeObj);
            } else {
                this._building_data.push(baseObj);
            }
        }
        if (NetGlobalData.userInfo != null && NetGlobalData.userInfo.attacker != null) {
            for (const building of this._building_data) {
                if (building.type != MapBuildingType.wormhole) {
                    continue;
                }
                building.defendPioneerIds = [];
            }
            const useAttacker = NetGlobalData.userInfo.attacker;
            for (const key in useAttacker) {
                const temp = useAttacker[key];
                const building = this.getBuildingById(temp.buildingId);
                if (building == undefined) {
                    continue;
                }
                building.defendPioneerIds[parseInt(key)] = temp.pioneerId;
                console.log("exce b:", building.defendPioneerIds);
            }
        }
        this._initInterval();
        CLog.debug("MapBuildingDataMgr: loadObj/building_data, ", this._building_data);
    }

    private _initInterval() {
        let timeEightUpdate: boolean = false;
        let timeTwoUpdate: boolean = false;
        setInterval(() => {
            for (const obj of this._building_data) {
                if (obj.type == MapBuildingType.wormhole) {
                    const wormhole = obj as MapBuildingWormholeObject;
                    if (wormhole.wormholdCountdownTime > 0) {
                        wormhole.wormholdCountdownTime -= 1;
                        
                        NotificationMgr.triggerEvent(NotificationName.BUILDING_WORMHOLE_COUNT_DOWN_TIME_DID_CHANGE, { id: wormhole.id });

                        if (wormhole.wormholdCountdownTime == 0) {
                            NotificationMgr.triggerEvent(NotificationName.BUILDING_WORMHOLE_COUNT_DOWN_TIME_DID_FINISH, { id: wormhole.id });
                        }
                    }
                } else if (obj.type == MapBuildingType.tavern) {
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
            let canUpdateBuilding: boolean = false;
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            if (hours === 8 && minutes === 0 && !timeEightUpdate) {
                canUpdateBuilding = true;
                timeEightUpdate = true;
            } else if (hours === 14 && minutes === 0 && !timeTwoUpdate) {
                canUpdateBuilding = true;
                timeTwoUpdate = true;
            }
            if (canUpdateBuilding) {
                // update building show
                let hideactionBuildingNum: number = 0;
                for (let i = 0; i < this._building_data.length; i++) {
                    const temp = this._building_data[i];
                    if (temp.show) {
                        continue;
                    }
                    if (temp.type != MapBuildingType.resource && temp.type != MapBuildingType.event) {
                        continue;
                    }
                    hideactionBuildingNum += 1;
                }
                const rateAddCof: number = hideactionBuildingNum === 0 ? 0.5 : 0.5 / hideactionBuildingNum;
                let rate: number = 0.5;
                let random: boolean[] = [true, false];
                for (let i = 0; i < this._building_data.length; i++) {
                    const temp = this._building_data[i];
                    if (temp.show) {
                        continue;
                    }
                    const canShow: boolean = CommonTools.getRandomItemByWeights(random, [rate, 1 - rate]);
                    if (!canShow) {
                        rate += rateAddCof;
                        continue;
                    }
                    rate = 0.5;
                    // if (temp.type == MapBuildingType.resource) {
                    //     const resource = temp as MapBuildingResourceObject;
                    //     resource.quota = resource.orginalQuota;
                        
                    // } else if (temp.type == MapBuildingType.event) {
                    //     temp.eventId = temp.originalEventId;
                        
                    // }
                    this.showBuilding(temp.id);
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
    public changeBuildingFaction(buildingId: string, faction: MapMemberFactionType) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;
        if (findBuilding.faction == faction) return;

        findBuilding.faction = faction;
        // 

        if (findBuilding.id == "building_1" && findBuilding.faction == MapMemberFactionType.enemy) {
            NotificationMgr.triggerEvent(NotificationName.CHOOSE_GANGSTER_ROUTE);
        }

        NotificationMgr.triggerEvent(NotificationName.BUILDING_FACTION_CHANGED);
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
    public showBuilding(buildingId: string) {
        let temple: MapBuildingObject | MapDecorateObject;
        const actionTargetBuilding = this.getBuildingById(buildingId);

        if (actionTargetBuilding != null) {
            temple = actionTargetBuilding;
        } else {
            // const decorateBuiling = this.getDecorateById(buildingId);
            // if (decorateBuiling != null) {
            //     temple = decorateBuiling;
            // }
        }

        if (temple == null) return;
        if (temple.show) return;

        temple.show = true;

        
        NotificationMgr.triggerEvent(NotificationName.BUILDING_DID_SHOW, temple.id);
    }
    public hideBuilding(buildingId: string, beacusePioneerId: string = null) {
        let temple: MapBuildingObject | MapDecorateObject;
        const actionTargetBuilding = this.getBuildingById(buildingId);
        if (actionTargetBuilding != null) {
            temple = actionTargetBuilding;
        } else {
            // const decorateBuiling = this.getDecorateById(buildingId);
            // if (decorateBuiling != null) {
            //     temple = decorateBuiling;
            // }
        }

        if (temple == null) return;
        if (!temple.show) return;

        temple.show = false;

        
        NotificationMgr.triggerEvent(NotificationName.BUILDING_DID_HIDE, temple.id);
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
