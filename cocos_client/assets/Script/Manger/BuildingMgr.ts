import { Vec2, math, resources, v2 } from "cc";
import { ResourceModel } from "./UserInfoMgr";
import MapBuildingModel, { BuildingFactionType, MapBuildingType, MapResourceBuildingModel, MapMainCityBuildingModel } from "../Game/Outer/Model/MapBuildingModel";

export interface BuildingMgrEvent {
    buildingDidHide(buildingId: string, beacusePioneerId: string): void;
    buildingDidShow(buildingId: string): void;


    buildingFacitonChanged(buildingId: string, faction: BuildingFactionType): void;
    buildingInsertDefendPioneer(buildingId: string, pioneerId: string): void;
    buildingRemoveDefendPioneer(buildingId: string, pioneerId: string): void;
}

export default class BuildingMgr {

    public static get instance() {
        if (!this._instance) {
            this._instance = new BuildingMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public addObserver(observer: BuildingMgrEvent) {
        this._observers.push(observer);
    }
    public removeObserver(observer: BuildingMgrEvent) {
        const index: number = this._observers.indexOf(observer);
        if (index != -1) {
            this._observers.splice(index, 1);
        }
    }

    public getAllBuilding(): MapBuildingModel[] {
        return this._buildings;
    }
    public getBuildingById(buidingId: string) {
        const findDatas = this._buildings.filter((buiding) => {
            return buiding.id === buidingId;
        });
        if (findDatas.length > 0) {
            return findDatas[0];
        }
        return null;
    }
    public getResourceBuildings(): MapBuildingModel[] {
        return this._buildings.filter((buiding) => {
            return buiding.type === MapBuildingType.resource;
        });
    }
    public getStrongholdBuildings(): MapBuildingModel[] {
        return this._buildings.filter((buiding) => {
            return buiding.type === MapBuildingType.stronghold;
        });
    }
    /**
     * find buiding on pos,
     * @param tiledPosX 
     * @param tiledPosY 
     * @returns one pos one building
     */
    public getShowBuildingByMapPos(mapPos: Vec2): MapBuildingModel | null {
        const findDatas = this._buildings.filter((buiding) => {
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
    public getShowBuildingsNearMapPos(mapPos: Vec2, range: number): MapBuildingModel[] {
        return this._buildings.filter((buiding) => {
            if (buiding.show) {
                for (const pos of buiding.stayMapPositions) {
                    if (Math.abs(pos.x - mapPos.x) < range &&
                        Math.abs(pos.y - mapPos.y) < range) {
                        return true;
                    }
                }
            }
            return false;
        });
    }

    public resourceBuildingCollected(buildingId: string) {
        const actionTargetBuilding = this.getBuildingById(buildingId);
        if (actionTargetBuilding == null) {
            return;
        }
        const resource = actionTargetBuilding as MapResourceBuildingModel;
        resource.quota -= 1;
        this._savePioneerData();
        if (resource.quota <= 0) {
            this.hideBuilding(actionTargetBuilding.id);
        }
    }
    public showBuilding(buildingId: string) {
        const actionTargetBuilding = this.getBuildingById(buildingId);
        if (actionTargetBuilding == null) {
            return;
        }
        if (actionTargetBuilding.show) {
            return;
        }
        actionTargetBuilding.show = true;
        this._savePioneerData();
        for (const observer of this._observers) {
            observer.buildingDidShow(actionTargetBuilding.id);
        }
    }
    public hideBuilding(buildingId: string, beacusePioneerId: string = null) {
        const actionTargetBuilding = this.getBuildingById(buildingId);
        if (actionTargetBuilding == null) {
            return;
        }
        if (!actionTargetBuilding.show) {
            return;
        }
        actionTargetBuilding.show = false;
        this._savePioneerData();
        for (const observer of this._observers) {
            observer.buildingDidHide(actionTargetBuilding.id, beacusePioneerId);
        }
    }
    public changeBuildingFaction(buildingId: string, faction: BuildingFactionType) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding != null) {
            if (findBuilding.faction != faction) {
                findBuilding.faction = faction;
                this._savePioneerData();
                for (const observer of this._observers) {
                    observer.buildingFacitonChanged(buildingId, faction);
                }
            }
        }
    }
    public changeBuildingEventId(buidingId: string, eventId: string) {
        const findBuilding = this.getBuildingById(buidingId);
        if (findBuilding != null) {
            findBuilding.eventId = eventId;
            console.log('exce o: ' + eventId);
            this._savePioneerData();
        }
    }
    public insertDefendPioneer(buildingId: string, pioneerId: string) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding != null) {
            findBuilding.defendPioneerIds.push(pioneerId);
            this._savePioneerData();
            for (const observe of this._observers) {
                observe.buildingInsertDefendPioneer(buildingId, pioneerId);
            }
        }
    }
    public removeDefendPioneer(buildingId: string, pioneerId: string) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding != null) {
            const index = findBuilding.defendPioneerIds.indexOf(pioneerId);
            if (index != -1) {
                findBuilding.defendPioneerIds.splice(index, 1);
            }
            this._savePioneerData();
            for (const observe of this._observers) {
                observe.buildingRemoveDefendPioneer(buildingId, pioneerId);
            }
        }
    }
    public buildingGetTask(buildingId: string, task) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding != null && findBuilding.type == MapBuildingType.city) {
            (findBuilding as MapMainCityBuildingModel).taskObj = task;
            this._savePioneerData();
        }
    }
    public buildingClearTask(buildingId: string) {
        const findBuilding = this.getBuildingById(buildingId);
        if (findBuilding != null && findBuilding.type == MapBuildingType.city) {
            (findBuilding as MapMainCityBuildingModel).taskObj = null;
            this._savePioneerData();
        }
    }

    public dealWithTaskAction(action: string): void {
        const temple = action.split("|");
        const actionTargetBuilding = this.getBuildingById(temple[1]);
        if (actionTargetBuilding == null) {
            return;
        }
        switch (temple[0]) {
            case "buildingtoenemy": {
                actionTargetBuilding.faction = BuildingFactionType.enemy;
                this._savePioneerData();
                for (const observer of this._observers) {
                    observer.buildingFacitonChanged(actionTargetBuilding.id, actionTargetBuilding.faction);
                }
            }
                break;

            case "buildingtoself": {
                actionTargetBuilding.faction = BuildingFactionType.self;
                this._savePioneerData();
                for (const observer of this._observers) {
                    observer.buildingFacitonChanged(actionTargetBuilding.id, actionTargetBuilding.faction);
                }
            }
                break;

            case "buildinghide": {
                this.hideBuilding(actionTargetBuilding.id);
            }
                break;

            case "buildingshow": {
                this.showBuilding(actionTargetBuilding.id);
            }
                break;


            default:
                break;
        }
    }

    public constructor() {

    }

    private static _instance: BuildingMgr;
    private _localStorageKey: string = "local_buildings";
    private _observers: BuildingMgrEvent[] = [];
    private _buildings: MapBuildingModel[] = [];

    private async _initData() {
        this._buildings = [];
        let resultData: any = null;
        const localDatas = localStorage.getItem(this._localStorageKey);
        if (localDatas == null) {
            resultData = await new Promise((resolve, reject) => {
                resources.load("data_local/map_building", (err: Error, data: any) => {
                    if (err) {
                        resolve(null);
                        return;
                    }
                    resolve(data.json);
                });
            });
            if (resultData != null) {
                for (const temple of resultData) {
                    let newModel = null;
                    const mapPositions = [];
                    for (const pos of temple.positions) {
                        mapPositions.push(v2(pos.x, pos.y));
                    }
                    if (temple.type == MapBuildingType.city) {
                        newModel = new MapMainCityBuildingModel(
                            temple.show,
                            temple.id,
                            temple.type,
                            temple.name,
                            temple.faction,
                            temple.defendPioneerIds,
                            temple.level,
                            mapPositions,
                            temple.hp,
                            temple.hp,
                            temple.attack
                        );
                    } else if (temple.type == MapBuildingType.resource) {
                        const resources: ResourceModel[] = [];
                        if (temple.resources != null) {
                            for (const resourceData of temple.resources) {
                                resources.push({
                                    id: resourceData.id,
                                    num: resourceData.num,
                                });
                            }
                        }
                        newModel = new MapResourceBuildingModel(
                            temple.show,
                            temple.id,
                            temple.type,
                            temple.name,
                            temple.faction,
                            temple.defendPioneerIds,
                            temple.level,
                            mapPositions,
                            resources,
                            temple.quota ? temple.quota : 1
                        );
                    } else {
                        newModel = new MapBuildingModel(
                            temple.show,
                            temple.id,
                            temple.type,
                            temple.name,
                            temple.faction,
                            temple.defendPioneerIds,
                            temple.level,
                            mapPositions
                        );
                    }
                    if (temple.progress != null) {
                        newModel.progress = temple.progress;
                    }
                    if (temple.winprogress != null) {
                        newModel.winprogress = temple.winprogress;
                    }
                    if (temple.event != null) {
                        newModel.originalEventId = temple.event;
                        newModel.eventId = temple.event;
                    }
                    if (temple.exp != null) {
                        newModel.exp = temple.exp;
                    }
                    this._buildings.push(newModel);
                }
            }
        } else {
            resultData = JSON.parse(localDatas);
            for (const temple of resultData) {
                const mapPositions = [];
                for (const pos of temple._stayMapPositions) {
                    const tempPos = v2(pos.x, pos.y);
                    mapPositions.push(tempPos);
                }
                let newModel = null;
                if (temple._type == MapBuildingType.city) {
                    newModel = new MapMainCityBuildingModel(
                        temple._show,
                        temple._id,
                        temple._type,
                        temple._name,
                        temple._faction,
                        temple._defendPioneerIds,
                        temple._level,
                        mapPositions,
                        temple._hpMax,
                        temple._hp,
                        temple._attack,
                    );
                    newModel.taskObj = temple._taskObj;
                } else if (temple._type == MapBuildingType.resource) {
                    const resources: ResourceModel[] = [];
                    if (temple._resources != null) {
                        for (const resourceData of temple._resources) {
                            resources.push({
                                id: resourceData.id,
                                num: resourceData.num,
                            });
                        }
                    }
                    newModel = new MapResourceBuildingModel(
                        temple._show,
                        temple._id,
                        temple._type,
                        temple._name,
                        temple._faction,
                        temple._defendPioneerIds,
                        temple._level,
                        mapPositions,
                        resources,
                        temple._quota
                    );
                } else {
                    newModel = new MapBuildingModel(
                        temple._show,
                        temple._id,
                        temple._type,
                        temple._name,
                        temple._faction,
                        temple._defendPioneerIds,
                        temple._level,
                        mapPositions,
                    );
                }
                newModel.progress = temple._progress;
                newModel.winprogress = temple._winprogress;
                newModel.eventId = temple._eventId;
                newModel.originalEventId = temple._originalEventId;
                newModel.eventWaited = temple._eventWaited;
                newModel.exp = temple._exp;
                this._buildings.push(newModel);
            }
        }
    }

    private _savePioneerData() {
        localStorage.setItem(this._localStorageKey, JSON.stringify(this._buildings));
    }
}