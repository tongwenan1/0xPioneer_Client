import { Vec2, math, resources, v2 } from "cc";
import { ResourceModel } from "./UserInfoMgr";
import MapBuildingModel, { BuildingFactionType, MapBuildingType, MapResourceBuildingModel, MapMainCityBuildingModel } from "../Game/Outer/Model/MapBuildingModel";
import MapDecorateModel, { MapDecoratePosMode } from "../Game/Outer/Model/MapDecorateModel";
import { GameMain } from "../GameMain";
import { TilePos } from "../Game/TiledMap/TileTool";

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



    public getAllDecorate(): MapDecorateModel[] {
        return this._decorates;
    }
    public getDecorateById(decorateId: string) {
        const findDatas = this._decorates.filter((decorate) => {
            return decorate.id === decorateId;
        });
        if (findDatas.length > 0) {
            return findDatas[0];
        }
        return null;
    }
    public getDecorateByMapPos(pos: Vec2) {
        const findDatas = this._decorates.filter((decorate) => {
            let isExsit: boolean = false;
            for (const temple of decorate.stayMapPositions) {
                if (temple.x === pos.x && temple.y === pos.y) {
                    isExsit = true;
                    break;
                }
            }
            return isExsit;
        });
        if (findDatas.length > 0) {
            return findDatas[0];
        }
        return null;
    }
    public changeDecorateWorldPosToTiledPos(decorateId: string, tiledPositions: Vec2[]) {
        const decorate = this.getDecorateById(decorateId);
        if (decorate != null) {
            decorate.posMode = MapDecoratePosMode.Tiled;
            decorate.stayMapPositions = tiledPositions;
            this._saveDecorateData();
        }
    }

    public checkMapPosIsInBuilingRange(stayPos: Vec2, buildingId: string, range: number): boolean {
        const building = this.getBuildingById(buildingId);
        if (building != null) {
            let centerPos = null;
            if (building.stayMapPositions.length == 1 ||
                building.stayMapPositions.length == 3) {
                centerPos = building.stayMapPositions[0];
            } else if (building.stayMapPositions.length == 7) {
                centerPos = building.stayMapPositions[3];
            }
            const visionPositions: TilePos[] = GameMain.inst.outSceneMap.mapBG.getExtAround(centerPos, range);
            return visionPositions.some(pos => pos.x === stayPos.x && pos.y === stayPos.y);
        }
        return false;
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
        let temple = null;
        const actionTargetBuilding = this.getBuildingById(buildingId);
        if (actionTargetBuilding != null) {
            temple = actionTargetBuilding;
        } else {
            const decorateBuiling = this.getDecorateById(buildingId);
            if (decorateBuiling != null) {
                temple = decorateBuiling;
            }
        }
        if (temple == null) {
            return;
        }
        if (temple.show) {
            return;
        }
        temple.show = true;
        this._savePioneerData();
        this._saveDecorateData();
        for (const observer of this._observers) {
            observer.buildingDidShow(temple.id);
        }
    }
    public hideBuilding(buildingId: string, beacusePioneerId: string = null) {
        let temple = null;
        const actionTargetBuilding = this.getBuildingById(buildingId);
        if (actionTargetBuilding != null) {
            temple = actionTargetBuilding;
        } else {
            const decorateBuiling = this.getDecorateById(buildingId);
            if (decorateBuiling != null) {
                temple = decorateBuiling;
            }
        }
        if (temple == null) {
            return;
        }
        if (!temple.show) {
            return;
        }
        temple.show = false;
        this._savePioneerData();
        this._saveDecorateData();
        for (const observer of this._observers) {
            observer.buildingDidHide(temple.id, beacusePioneerId);
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
    private _localDecorateKey: string = "local_decorate";
    private _observers: BuildingMgrEvent[] = [];
    private _buildings: MapBuildingModel[] = [];
    private _decorates: MapDecorateModel[] = [];
    private async _initData() {
        this._buildings = [];
        let resultData: any = null;
        const localDatas = localStorage.getItem(this._localStorageKey);
        const localDecorateDatas = localStorage.getItem(this._localDecorateKey);
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
                    if (temple.type == MapBuildingType.decorate) {
                        for (const templePos of mapPositions) {
                            templePos.x -= 960;
                            templePos.y -= 540;
                        }
                        newModel = new MapDecorateModel(
                            temple.id,
                            temple.name,
                            temple.show,
                            temple.block,
                            temple.posmode,
                            mapPositions
                        );
                        this._decorates.push(newModel);
                    } else {
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
                this._savePioneerData();
                this._saveDecorateData();
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

        if (localDecorateDatas != null) {
            const resultDecorateData = JSON.parse(localDecorateDatas);
            for (const temple of resultDecorateData) {
                const mapPositions = [];
                for (const pos of temple._stayMapPositions) {
                    const tempPos = v2(pos.x, pos.y);
                    mapPositions.push(tempPos);
                }
                const newModel = new MapDecorateModel(
                    temple._id,
                    temple._name,
                    temple._show,
                    temple._block,
                    temple._posMode,
                    mapPositions
                );
                this._decorates.push(newModel);
            }
        }
    }

    private _savePioneerData() {
        localStorage.setItem(this._localStorageKey, JSON.stringify(this._buildings));
    }
    private _saveDecorateData() {
        localStorage.setItem(this._localDecorateKey, JSON.stringify(this._decorates));
    }
}