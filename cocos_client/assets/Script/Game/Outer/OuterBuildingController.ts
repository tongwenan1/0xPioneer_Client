import { _decorator, Component, instantiate, Node, Prefab, resources, UITransform, v2, v3, Vec2, Vec3, warn } from 'cc';
import { TileHexDirection, TilePos } from '../TiledMap/TileTool';
import { OuterBuildingView } from './View/OuterBuildingView';
import { PioneerMgrEvent } from '../../Const/Manager/PioneerMgrDefine';
import { BuildingMgr, PioneerMgr, TaskMgr, UserInfoMgr } from '../../Utils/Global';
import { MapDecoratePosMode } from '../../Const/Model/MapDecorateModelDefine';
import MapDecorateModel from './Model/MapDecorateModel';
import { MapPioneerActionType } from '../../Const/Model/MapPioneerModelDefine';
import MapPioneerModel, { MapPioneerLogicModel } from './Model/MapPioneerModel';
import { BuildingMgrEvent, BuildingStayPosType } from '../../Const/BuildingDefine';
import { UserInfoEvent } from '../../Const/UserInfoDefine';
import GameMainHelper from '../Helper/GameMainHelper';
import { OuterTiledMapActionController } from './OuterTiledMapActionController';
import { TaskShowHideStatus, TaskTargetType } from '../../Const/TaskDefine';
import { MapMemberFactionType } from '../../Const/ConstDefine';


const { ccclass, property } = _decorator;

@ccclass('OuterBuildingController')
export class OuterBuildingController extends Component implements UserInfoEvent, BuildingMgrEvent, PioneerMgrEvent {

    public getBuildingView(buildingId: string): OuterBuildingView {
        if (this._buildingMap.has(buildingId)) {
            const view = this._buildingMap.get(buildingId).node.getComponent(OuterBuildingView);
            return view;
        }
        return null;
    }

    @property(Prefab)
    private buildingPrefab;

    private _buildingMap: Map<string, { node: Node, stayPositons: Vec2[] }> = new Map();
    private _decorateMap: Map<string, { node: Node, model: MapDecorateModel }> = new Map();

    protected onLoad() {
        UserInfoMgr.addObserver(this);
        BuildingMgr.addObserver(this);
        PioneerMgr.addObserver(this);
    }

    start() {
        // buildingPos
        const allBuildings = BuildingMgr.getAllBuilding();
        for (const building of allBuildings) {
            if (building.stayPosType == BuildingStayPosType.One) {
                // no action
            } else if (building.stayMapPositions.length == 1) {
                const newPos = [].concat(building.stayMapPositions);
                const originalPos = newPos[0];
                if (building.stayPosType == BuildingStayPosType.Three) {
                    newPos.push(GameMainHelper.instance.tiledMapGetAroundByDirection(originalPos, TileHexDirection.LeftBottom));
                    newPos.push(GameMainHelper.instance.tiledMapGetAroundByDirection(originalPos, TileHexDirection.RightBottom));

                } else if (building.stayPosType == BuildingStayPosType.Seven) {
                    newPos.splice(0, 0, GameMainHelper.instance.tiledMapGetAroundByDirection(originalPos, TileHexDirection.LeftTop));
                    newPos.splice(0, 0, GameMainHelper.instance.tiledMapGetAroundByDirection(originalPos, TileHexDirection.RightTop));
                    newPos.splice(0, 0, GameMainHelper.instance.tiledMapGetAroundByDirection(originalPos, TileHexDirection.Left));
                    newPos.push(GameMainHelper.instance.tiledMapGetAroundByDirection(originalPos, TileHexDirection.Right));
                    newPos.push(GameMainHelper.instance.tiledMapGetAroundByDirection(originalPos, TileHexDirection.LeftBottom));
                    newPos.push(GameMainHelper.instance.tiledMapGetAroundByDirection(originalPos, TileHexDirection.RightBottom));
                }
                BuildingMgr.fillBuildingStayPos(building.id, newPos);
            }
        }

        this._refreshUI();

        // decorations
        const decorates = BuildingMgr.getAllDecorate();
        for (const decorate of decorates) {
            if (decorate.posMode == MapDecoratePosMode.World) {
                const tiledPositions: Vec2[] = [];
                for (const worldPos of decorate.stayMapPositions) {
                    let tempwp = this.node.getComponent(UITransform).convertToWorldSpaceAR(v3(
                        worldPos.x,
                        worldPos.y,
                        0
                    ));
                    ;
                    const tilePos = GameMainHelper.instance.tiledMapGetTiledPosByWorldPos(tempwp);
                    tiledPositions.push(v2(
                        tilePos.x,
                        tilePos.y
                    ));
                }
                BuildingMgr.changeDecorateWorldPosToTiledPos(decorate.id, tiledPositions);
            }
        }

        this._refreshDecorationUI();
    }

    update(deltaTime: number) {

    }

    protected onDestroy(): void {
        UserInfoMgr.removeObserver(this);
        BuildingMgr.removeObserver(this);
        PioneerMgr.removeObserver(this);
    }

    private _refreshUI() {
        const decorationView = this.node.getComponent(OuterTiledMapActionController).mapDecorationView();
        if (decorationView == null) {
            return;
        }
        let changed: boolean = false;
        const allBuildings = BuildingMgr.getAllBuilding();
        for (const building of allBuildings) {
            if (building.show) {
                let temple = null;
                if (this._buildingMap.has(building.id)) {
                    temple = this._buildingMap.get(building.id).node;

                } else {
                    // new
                    temple = instantiate(this.buildingPrefab);
                    temple.setParent(decorationView);
                    this._buildingMap.set(building.id, { node: temple, stayPositons: building.stayMapPositions });

                    changed = true;
                }
                if (temple != null) {
                    temple.getComponent(OuterBuildingView).refreshUI(building, PioneerMgr.getPlayerPioneer());
                    if (building.stayMapPositions.length > 0) {
                        let worldPos = null;
                        if (building.stayMapPositions.length == 7) {

                            worldPos = GameMainHelper.instance.tiledMapGetPosWorld(building.stayMapPositions[3].x, building.stayMapPositions[3].y);
                        } else if (building.stayMapPositions.length == 3) {
                            const beginWorldPos = GameMainHelper.instance.tiledMapGetPosWorld(building.stayMapPositions[0].x, building.stayMapPositions[0].y);
                            const endWorldPos = GameMainHelper.instance.tiledMapGetPosWorld(building.stayMapPositions[1].x, building.stayMapPositions[1].y);
                            worldPos = v3(
                                beginWorldPos.x,
                                endWorldPos.y + (beginWorldPos.y - endWorldPos.y) / 2,
                                0
                            );
                        } else {
                            worldPos = GameMainHelper.instance.tiledMapGetPosWorld(building.stayMapPositions[0].x, building.stayMapPositions[0].y);
                        }
                        temple.setWorldPosition(worldPos);

                        for (const pos of building.stayMapPositions) {
                            GameMainHelper.instance.tiledMapAddDynamicBlock(pos, true);
                        }
                    }
                }

            } else {
                if (this._buildingMap.has(building.id)) {
                    const data = this._buildingMap.get(building.id);
                    data.node.destroy();
                    for (const pos of data.stayPositons) {
                        GameMainHelper.instance.tiledMapRemoveDynamicBlock(pos);
                    }
                    this._buildingMap.delete(building.id);
                }
            }
        }
        // destroy 
        this._buildingMap.forEach((value: { node: Node, stayPositons: Vec2[] }, key: string) => {
            let isExsit: boolean = false;
            for (const building of allBuildings) {
                if (building.id == key) {
                    isExsit = true;
                    break;
                }
            }
            if (!isExsit) {
                value.node.destroy();
                for (const pos of value.stayPositons) {
                    GameMainHelper.instance.tiledMapRemoveDynamicBlock(pos);
                }
                this._buildingMap.delete(key);
            }
        });

        if (changed) {
            this.node.getComponent(OuterTiledMapActionController).sortMapItemSiblingIndex();
        }
    }

    private async _refreshDecorationUI() {
        const decorationView = this.node.getComponent(OuterTiledMapActionController).mapDecorationView();
        if (decorationView == null) {
            return;
        }
        let changed: boolean = false;
        const allDecorates = BuildingMgr.getAllDecorate();
        for (const decorate of allDecorates) {
            if (decorate.show) {
                let temple: Node = null;
                if (this._decorateMap.has(decorate.id)) {
                    temple = this._decorateMap.get(decorate.id).node;

                } else {
                    // new
                    const prefab = await new Promise<Prefab>((resolve, reject) => {
                        resources.load("decoration/" + decorate.name, Prefab, (err: Error, data: Prefab) => {
                            if (err) {
                                resolve(null);
                            } else {
                                resolve(data);
                            }
                        });
                    });
                    if (prefab != null) {
                        temple = instantiate(prefab);
                        temple.setParent(decorationView);
                        // ?? why change layer is not effect
                        // temple.layer = decorationView.layer;
                        this._decorateMap.set(decorate.id, { node: temple, model: decorate });
                        changed = true;
                    }
                }
                if (temple != null) {
                    if (decorate.stayMapPositions.length > 0) {
                        let xMaxTilePos = decorate.stayMapPositions[0];
                        let xMinTilePos = decorate.stayMapPositions[0];
                        let yMaxTilePos = decorate.stayMapPositions[0];
                        let yMinTilePos = decorate.stayMapPositions[0];
                        for (const mapPos of decorate.stayMapPositions) {
                            const wp = GameMainHelper.instance.tiledMapGetPosWorld(mapPos.x, mapPos.y);
                            const xmaxwp = GameMainHelper.instance.tiledMapGetPosWorld(xMaxTilePos.x, xMaxTilePos.y);
                            const xminwp = GameMainHelper.instance.tiledMapGetPosWorld(xMinTilePos.x, xMinTilePos.y);
                            const ymaxwp = GameMainHelper.instance.tiledMapGetPosWorld(yMaxTilePos.x, yMaxTilePos.y);
                            const yminwp = GameMainHelper.instance.tiledMapGetPosWorld(yMinTilePos.x, yMinTilePos.y);

                            if (wp.x > xmaxwp.x) {
                                xMaxTilePos = mapPos;
                            }
                            if (wp.x < xminwp.x) {
                                xMinTilePos = mapPos;
                            }
                            if (wp.y > ymaxwp.y) {
                                yMaxTilePos = mapPos;
                            }
                            if (wp.y < yminwp.y) {
                                yMinTilePos = mapPos;
                            }
                            if (decorate.block) {
                                GameMainHelper.instance.tiledMapAddDynamicBlock(mapPos);
                            }
                        }
                        // get Accurate worldPos
                        const xMaxAccurateWorldPos = GameMainHelper.instance.tiledMapGetPosWorld(xMaxTilePos.x, xMaxTilePos.y).x;
                        const xMinAccurateWorldPos = GameMainHelper.instance.tiledMapGetPosWorld(xMinTilePos.x, xMinTilePos.y).x;
                        const yMaxAccurateWorldPos = GameMainHelper.instance.tiledMapGetPosWorld(yMaxTilePos.x, yMaxTilePos.y).y;
                        const yMinAccurateWorldPos = GameMainHelper.instance.tiledMapGetPosWorld(yMinTilePos.x, yMinTilePos.y).y;

                        const setWorldPos = v3(
                            xMinAccurateWorldPos + (xMaxAccurateWorldPos - xMinAccurateWorldPos) / 2,
                            yMinAccurateWorldPos + (yMaxAccurateWorldPos - yMinAccurateWorldPos) / 2,
                            0
                        );
                        temple.setWorldPosition(setWorldPos);
                    }
                }

            } else {
                if (this._decorateMap.has(decorate.id)) {
                    const data = this._decorateMap.get(decorate.id);
                    data.node.destroy();
                    for (const pos of data.model.stayMapPositions) {
                        GameMainHelper.instance.tiledMapRemoveDynamicBlock(pos);
                    }
                    this._decorateMap.delete(decorate.id);
                }
            }
        }
        // destroy 
        this._decorateMap.forEach((value: { node: Node, model: MapDecorateModel }, key: string) => {
            let isExsit: boolean = false;
            for (const decorate of allDecorates) {
                if (decorate.id == key) {
                    isExsit = true;
                    break;
                }
            }
            if (!isExsit) {
                value.node.destroy();
                for (const pos of value.model.stayMapPositions) {
                    GameMainHelper.instance.tiledMapRemoveDynamicBlock(pos);
                }
                this._decorateMap.delete(key);
            }
        });

        if (changed) {
            this.node.getComponent(OuterTiledMapActionController).sortMapItemSiblingIndex();
        }
    }

    //-----------------------------------------------------------
    //UserInfoEvent
    playerNameChanged(value: string): void {

    }
    getProp(propId: string, num: number): void {

    }
    //-----------------------------------------------------------
    //BuildingMgrEvent
    buildingFacitonChanged(buildingId: string, faction: MapMemberFactionType): void {
        this._refreshUI();
    }
    buildingDefendPioneerChanged(buildingId: string, pioneerId: string): void {
        this._refreshUI();
    }
    buildingDidHide(buildingId: string, beacusePioneerId): void {
        TaskMgr.showHideChanged(TaskTargetType.building, buildingId, TaskShowHideStatus.hide);
        this._refreshUI();
        this._refreshDecorationUI();
    }
    buildingDidShow(buildingId: string): void {
        TaskMgr.showHideChanged(TaskTargetType.building, buildingId, TaskShowHideStatus.show);
        this._refreshUI();
        this._refreshDecorationUI();
    }
    buildingInsertDefendPioneer(buildingId: string, pioneerId: string): void {
        this._refreshUI();
    }
    buildingRemoveDefendPioneer(buildingId: string, pioneerId: string): void {
        this._refreshUI();
    }


    //-----------------------------------------------------------
    //PioneerMgrEvent
    pioneerActionTypeChanged(pioneerId: string, actionType: MapPioneerActionType, actionEndTimeStamp: number): void {

    }
    pioneerHpMaxChanged(pioneerId: string): void {

    }
    pioneerAttackChanged(pioneerId: string): void {

    }
    pioneerLoseHp(pioneerId: string, value: number): void {

    }
    pionerrRebirthCount(pioneerId: string, count: number): void {

    }
    pioneerRebirth(pioneerId: string): void {

    }
    pioneerDidShow(pioneerId: string): void {

    }
    pioneerDidHide(pioneerId: string): void {

    }
    addNewOnePioneer(newPioneer: MapPioneerModel): void {

    }
    destroyOnePioneer(pioneerId: string): void {

    }
    exploredPioneer(pioneerId: string): void {

    }
    exploredBuilding(buildingId: string): void {

    }
    miningBuilding(actionPioneerId: string, buildingId: string): void {

    }
    eventBuilding(actionPioneerId: string, buildingId: string, eventId: string): void {

    }
    pioneerLogicMoveTimeCountChanged(pioneer: MapPioneerModel): void {

    }
    pioneerLogicMove(pioneer: MapPioneerModel, logic: MapPioneerLogicModel): void {

    }
    playerPioneerShowMovePath(pioneerId: string, path: TilePos[]): void {

    }
}


