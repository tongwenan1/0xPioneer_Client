import { Vec2 } from "cc";
import { MapBuildingType } from "../../Const/BuildingDefine";
import {
    MapBuildingBaseData,
    MapBuildingBaseObject,
    MapBuildingConfigData,
    MapBuildingData,
    MapBuildingMainCityData,
    MapBuildingMainCityObject,
    MapBuildingObject,
    MapBuildingResourceData,
    MapBuildingResourceObject,
    MapDecorateData,
    MapDecorateObject,
    StayMapPosition,
} from "../../Const/MapBuilding";
import MapBuildingConfig from "../../Config/MapBuildingConfig";
import { MapMemberFactionType } from "../../Const/ConstDefine";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import CLog from "../../Utils/CLog";

export class MapBuildingDataMgr {
    private _building_data: MapBuildingObject[];
    private _building_key: string = "local_buildings";

    private _decorate_data: MapDecorateObject[];
    private _decorate_key: string = "local_decorate";

    public constructor() {}

    private _loadObj_mapPositions(data: StayMapPosition[]) {
        const mapPositions: Vec2[] = [];
        for (const pos of data) {
            mapPositions.push(new Vec2(pos.x, pos.y));
        }
        return mapPositions;
    }

    public async loadObj() {
        if (this._building_data == null) {
            this._building_data = [];
            const building_data = localStorage.getItem(this._building_key);
            if (building_data) {
                const data = JSON.parse(building_data) as MapBuildingData[];
                this._loadObj_building(data);
            } else {
                this._createObj_building();
            }
        }

        if (this._decorate_data == null) {
            this._decorate_data = [];
            const decorate_data = localStorage.getItem(this._decorate_key);
            if (decorate_data) {
                const data = JSON.parse(decorate_data) as MapDecorateData[];
                this._loadObj_decorate(data);
            } else {
                this._createObj_decorate();
            }
        }

        CLog.debug("MapBuildingDataMgr: loadObj/building_data, ", this._building_data);
        CLog.debug("MapBuildingDataMgr: loadObj/decorate_data, ", this._decorate_data);
    }

    // create buiding obj
    private _createObj_building() {
        const map_building_config = MapBuildingConfig.getAll();

        for (const temple of map_building_config) {
            if (temple.type == MapBuildingType.decorate) continue;

            switch (temple.type) {
                case MapBuildingType.city:
                    this._building_data.push(this._createObj_building_city(temple));
                    break;
                case MapBuildingType.resource:
                    this._building_data.push(this._createObj_building_resource(temple));
                    break;
                default:
                    this._building_data.push(this._createObj_building_base(temple));
                    break;
            }
        }
    }
    private _createObj_building_city(temple: MapBuildingConfigData) {
        const mapPositions: Vec2[] = [];
        if (temple.positions.length == 2) {
            mapPositions.push(new Vec2(temple.positions[0], temple.positions[1]));
        }

        const obj: MapBuildingMainCityObject = {
            show: !!temple.show,
            id: temple.id,
            type: temple.type,
            name: temple.name,
            faction: MapMemberFactionType.neutral, // temple.faction, // TODO: ???
            defendPioneerIds: temple.defendPioneerIds,
            level: temple.level,
            stayMapPositions: mapPositions,
            stayPosType: temple.pos_type,
            hpMax: temple.hp,
            hp: temple.hp,
            attack: temple.attack,
            taskObj: null,
            showHideStruct: null,
            progress: temple.progress ? temple.progress : 0,
            winprogress: temple.winprogress ? temple.winprogress : 0,
            eventId: temple.event ? temple.event : null,
            originalEventId: temple.event ? temple.event : null,
            exp: temple.exp ? temple.exp : 0,
            animType: temple.node ? temple.node : null,
        };

        return obj;
    }
    private _createObj_building_resource(temple: MapBuildingConfigData) {
        const mapPositions: Vec2[] = [];
        if (temple.positions.length == 2) {
            mapPositions.push(new Vec2(temple.positions[0], temple.positions[1]));
        }

        const obj: MapBuildingResourceObject = {
            show: !!temple.show,
            id: temple.id,
            type: temple.type,
            name: temple.name,
            faction: MapMemberFactionType.neutral, // temple.faction, // TODO: ???
            defendPioneerIds: temple.defendPioneerIds,
            level: temple.level,
            stayMapPositions: mapPositions,
            stayPosType: temple.pos_type,

            showHideStruct: null,
            progress: temple.progress ? temple.progress : 0,
            winprogress: temple.winprogress ? temple.winprogress : 0,
            eventId: temple.event ? temple.event : null,
            originalEventId: temple.event ? temple.event : null,
            exp: temple.exp ? temple.exp : 0,
            animType: temple.node ? temple.node : null,
            resources: temple.resources ? { id: temple.resources[0], num: temple.resources[1] } : null,
            quota: temple.quota ? temple.quota : 1,
        };
        return obj;
    }
    private _createObj_building_base(temple: MapBuildingConfigData) {
        const mapPositions: Vec2[] = [];
        if (temple.positions.length == 2) {
            mapPositions.push(new Vec2(temple.positions[0], temple.positions[1]));
        }

        const obj: MapBuildingBaseObject = {
            show: !!temple.show,
            id: temple.id,
            type: temple.type,
            name: temple.name,
            faction: MapMemberFactionType.neutral, // temple.faction, // TODO: ???
            defendPioneerIds: temple.defendPioneerIds,
            level: temple.level,
            stayMapPositions: mapPositions,
            stayPosType: temple.pos_type,

            showHideStruct: null,
            progress: temple.progress ? temple.progress : 0,
            winprogress: temple.winprogress ? temple.winprogress : 0,
            eventId: temple.event ? temple.event : null,
            originalEventId: temple.event ? temple.event : null,
            exp: temple.exp ? temple.exp : 0,
            animType: temple.node ? temple.node : null,
        };
        return obj;
    }

    // load building obj
    private _loadObj_building(data: MapBuildingData[]) {
        for (const temple of data) {
            switch (temple.type) {
                case MapBuildingType.city:
                    this._building_data.push(this._loadObj_building_city(temple as MapBuildingMainCityData));
                    break;
                case MapBuildingType.resource:
                    this._building_data.push(this._loadObj_building_resource(temple as MapBuildingResourceData));
                    break;
                default:
                    this._building_data.push(this._loadObj_building_base(temple as MapBuildingBaseData));
                    break;
            }
        }
    }
    private _loadObj_building_city(temple: MapBuildingMainCityData): MapBuildingMainCityObject {
        const obj: MapBuildingMainCityObject = {
            show: temple.show,
            id: temple.id,
            type: temple.type,
            name: temple.name,
            faction: temple.faction,
            defendPioneerIds: temple.defendPioneerIds,
            level: temple.level,
            stayMapPositions: this._loadObj_mapPositions(temple.stayMapPositions),
            stayPosType: temple.stayPosType,
            hpMax: temple.hpMax,
            hp: temple.hp,
            attack: temple.attack,
            taskObj: temple.taskObj,
            showHideStruct: temple.showHideStruct,
            progress: temple.progress,
            winprogress: temple.winprogress,
            eventId: temple.eventId,
            originalEventId: temple.originalEventId,
            exp: temple.exp,
            animType: temple.animType,
        };

        return obj;
    }
    private _loadObj_building_resource(temple: MapBuildingResourceData): MapBuildingResourceObject {
        const obj: MapBuildingResourceObject = {
            show: temple.show,
            id: temple.id,
            type: temple.type,
            name: temple.name,
            faction: temple.faction,
            defendPioneerIds: temple.defendPioneerIds,
            level: temple.level,
            stayMapPositions: this._loadObj_mapPositions(temple.stayMapPositions),
            stayPosType: temple.stayPosType,

            showHideStruct: temple.showHideStruct,
            progress: temple.progress,
            winprogress: temple.winprogress,
            eventId: temple.eventId,
            originalEventId: temple.originalEventId,
            exp: temple.exp,
            animType: temple.animType,

            resources: temple.resources ? { id: temple.resources[0], num: temple.resources[1] } : null,
            quota: temple.quota,
        };

        return obj;
    }
    private _loadObj_building_base(temple): MapBuildingBaseObject {
        const obj: MapBuildingBaseObject = {
            show: temple.show,
            id: temple.id,
            type: temple.type,
            name: temple.name,
            faction: temple.faction,
            defendPioneerIds: temple.defendPioneerIds,
            level: temple.level,
            stayMapPositions: this._loadObj_mapPositions(temple.stayMapPositions),
            stayPosType: temple.stayPosType,

            showHideStruct: temple.showHideStruct,
            progress: temple.progress,
            winprogress: temple.winprogress,
            eventId: temple.eventId,
            originalEventId: temple.originalEventId,
            exp: temple.exp,
            animType: temple.animType,
        };

        return obj;
    }

    // create decorate obj
    private _createObj_decorate() {
        const map_building_config = MapBuildingConfig.getAll();

        for (const temple of map_building_config) {
            if (temple.type != MapBuildingType.decorate) continue;

            // TODO
        }
    }

    // load decorate obj
    private _loadObj_decorate(data: MapDecorateData[]) {
        for (const temple of data) {
            this._decorate_data.push(this._loadObj_decorate_base(temple));
        }
    }
    private _loadObj_decorate_base(temple: MapDecorateData) {
        const obj: MapDecorateObject = {
            id: temple.id,
            name: temple.name,
            show: temple.show,
            stayMapPositions: this._loadObj_mapPositions(temple.stayMapPositions),
            block: temple.block,
            posMode: temple.posMode,
        };

        return obj;
    }

    // get obj
    public getObj_building() {
        return this._building_data;
    }
    public getObj_decorate() {
        return this._decorate_data;
    }

    // save obj
    public async saveObj() {
        await this.saveObj_building();
        await this.saveObj_decorate();
    }
    public async saveObj_building() {
        localStorage.setItem(this._building_key, JSON.stringify(this._building_data));
    }
    public async saveObj_decorate() {
        localStorage.setItem(this._decorate_key, JSON.stringify(this._decorate_data));
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
        this.saveObj_building();
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
        this.saveObj_building();
        NotificationMgr.triggerEvent(NotificationName.BUILDING_REMOVE_DEFEND_PIONEER);
    }
    public buildingGetTask(buildingId: string, task) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;
        if (findBuilding.type != MapBuildingType.city) return;

        (findBuilding as MapBuildingMainCityObject).taskObj = task;
        this.saveObj_building();
    }
    public buildingClearTask(buildingId: string) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;
        if (findBuilding.type != MapBuildingType.city) return;

        (findBuilding as MapBuildingMainCityObject).taskObj = null;
        this.saveObj_building();
    }
    public changeBuildingEventId(buidingId: string, eventId: string) {
        const findBuilding = this.getBuildingById(buidingId);
        if (findBuilding == null) return;

        findBuilding.eventId = eventId;
        this.saveObj_building();
    }
    public fillBuildingStayPos(buildingId: string, newPosions: Vec2[]) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;

        findBuilding.stayMapPositions = newPosions;
        this.saveObj_building();
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
    public changeBuildingFaction(buildingId: string, faction: MapMemberFactionType) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding == null) return;
        if (findBuilding.faction == faction) return;

        findBuilding.faction = faction;
        this.saveObj_building();

        if (findBuilding.id == "building_1" && findBuilding.faction == MapMemberFactionType.enemy) {
            NotificationMgr.triggerEvent(NotificationName.CHOOSE_GANGSTER_ROUTE);
        }

        NotificationMgr.triggerEvent(NotificationName.BUILDING_FACTION_CHANGED);
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

        this.saveObj_building();
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
        if (temple.show) return;

        temple.show = false;

        this.saveObj_building();
        NotificationMgr.triggerEvent(NotificationName.BUILDING_DID_HIDE, temple.id);
    }
    public resourceBuildingCollected(buildingId: string) {
        const actionTargetBuilding = this.getBuildingById(buildingId);
        if (actionTargetBuilding == null) return;

        const resource = actionTargetBuilding as MapBuildingResourceObject;

        resource.quota -= 1;
        this.saveObj_building();

        if (resource.quota <= 0) {
            this.hideBuilding(actionTargetBuilding.id);
        }
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
