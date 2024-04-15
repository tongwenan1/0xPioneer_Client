import {
    _decorator,
    Camera,
    Color,
    Component,
    director,
    find,
    instantiate,
    math,
    misc,
    Node,
    pingPong,
    Prefab,
    Quat,
    quat,
    sp,
    tween,
    UITransform,
    v2,
    v3,
    Vec2,
    Vec3,
} from "cc";
import { TilePos } from "../TiledMap/TileTool";
import { OuterFightView } from "./View/OuterFightView";
import { OuterOtherPioneerView } from "./View/OuterOtherPioneerView";
import { MapItemMonster } from "./View/MapItemMonster";
import { MapPioneer } from "./View/MapPioneer";
import { OuterMapCursorView } from "./View/OuterMapCursorView";
import { MapMemberFactionType, PioneerGameTest, ResourceCorrespondingItem } from "../../Const/ConstDefine";
import ItemConfigDropTool from "../../Tool/ItemConfigDropTool";
import { PioneerMgrEvent } from "../../Const/Manager/PioneerMgrDefine";
import { ArtifactMgr, BuildingMgr, ItemMgr, LanMgr, PioneerMgr, SettlementMgr, TaskMgr, UserInfoMgr } from "../../Utils/Global";
import {
    MapPioneerLogicType,
    MapPioneerActionType,
    MapPioneerType,
    MapPioneerMoveDirection,
    MapPioneerAttributesChangeModel,
} from "../../Const/Model/MapPioneerModelDefine";
import MapPioneerModel, { MapPioneerLogicModel, MapNpcPioneerModel } from "./Model/MapPioneerModel";
import { OuterBuildingController } from "./OuterBuildingController";
import { UIName } from "../../Const/ConstUIDefine";
import { DialogueUI } from "../../UI/Outer/DialogueUI";
import { SecretGuardGettedUI } from "../../UI/Outer/SecretGuardGettedUI";
import { TaskListUI } from "../../UI/TaskListUI";
import { EventUI } from "../../UI/Outer/EventUI";
import NotificationMgr from "../../Basic/NotificationMgr";
import { ArtifactEffectType } from "../../Const/Artifact";
import { UserInfoEvent } from "../../Const/UserInfoDefine";
import TalkConfig from "../../Config/TalkConfig";
import LvlupConfig from "../../Config/LvlupConfig";
import EventConfig from "../../Config/EventConfig";
import GlobalData from "../../Data/GlobalData";
import { OuterFightResultView } from "./View/OuterFightResultView";
import ItemData from "../../Const/Item";
import { NotificationName } from "../../Const/Notification";
import { OuterTiledMapActionController } from "./OuterTiledMapActionController";
import GameMainHelper from "../Helper/GameMainHelper";
import ViewController from "../../BasicView/ViewController";
import { TaskShowHideStatus, TaskTargetType } from "../../Const/TaskDefine";
import { EventConfigData } from "../../Const/Event";
import UIPanelManger from "../../Basic/UIPanelMgr";
import { MapBuildingObject, MapBuildingResourceObject } from "../../Const/MapBuilding";
import { MapBuildingType } from "../../Const/BuildingDefine";
import { DataMgr } from "../../Data/DataMgr";

const { ccclass, property } = _decorator;

@ccclass("OuterPioneerController")
export class OuterPioneerController extends ViewController implements PioneerMgrEvent, UserInfoEvent {
    public showMovingPioneerAction(tilePos: TilePos, movingPioneerId: string, usedCursor: OuterMapCursorView) {
        this._actionShowPioneerId = movingPioneerId;
        this._actionUsedCursor = usedCursor;
        if (this._actionPioneerView != null) {
            this._actionPioneerView.destroy();
            this._actionPioneerView = null;
        }
        if (this._pioneerMap.has(movingPioneerId)) {
            const view = this._pioneerMap.get(movingPioneerId);
            if (view.getComponent(MapItemMonster) != null) {
                this._actionPioneerView = instantiate(view);
                this._actionPioneerView.setParent(view.getParent());
                this._actionPioneerView.worldPosition = GameMainHelper.instance.tiledMapGetPosWorld(tilePos.x, tilePos.y);

                this._actionPioneerView.setSiblingIndex(view.getSiblingIndex());
                this._actionPioneerView.getComponent(MapItemMonster).shadowMode();
            }
            const pioneer: MapPioneerModel = PioneerMgr.getPioneerById(movingPioneerId);
            if (pioneer != null) {
                const path = [];
                let stepLogic: MapPioneerLogicModel = null;
                for (const logic of pioneer.logics) {
                    if (logic.type == MapPioneerLogicType.stepmove) {
                        stepLogic = logic;
                        break;
                    }
                }
                if (stepLogic != null) {
                    let nextTilePos = tilePos;
                    for (let i = 0; i < 15; i++) {
                        nextTilePos = GameMainHelper.instance.tiledMapGetAroundByDirection(v2(nextTilePos.x, nextTilePos.y), stepLogic.direction);
                        path.push(nextTilePos);
                    }
                } else {
                    for (const logic of pioneer.logics) {
                        if (logic.type == MapPioneerLogicType.commonmove) {
                            path.push(logic.commonMoveTilePos);
                        }
                    }
                }
                if (path.length > 0) {
                    this._actionPioneerFootStepViews = this._addFootSteps(path, stepLogic == null);
                }
            }
        }
    }
    public hideMovingPioneerAction() {
        if (this._actionPioneerView != null) {
            this._actionPioneerView.destroy();
            this._actionPioneerView = null;
        }
        if (this._actionPioneerFootStepViews != null) {
            for (const view of this._actionPioneerFootStepViews) {
                view.destroy();
            }
            this._actionPioneerFootStepViews = null;
        }
        this._actionShowPioneerId = null;
        this._actionUsedCursor = null;
    }

    @property(Prefab)
    private selfPioneer: Prefab;

    @property(Prefab)
    private otherPioneer;

    @property(Prefab)
    private battleSmall;

    @property(Prefab)
    private fightPrefab: Prefab;
    @property(Prefab)
    private fightResultPrefab: Prefab;

    @property(Prefab)
    private footPathPrefab: Prefab;
    @property(Prefab)
    private footPathTargetPrefab: Prefab;

    private _pioneerMap: Map<string, Node> = new Map();
    private _movingPioneerIds: string[] = [];
    private _fightViewMap: Map<string, OuterFightView> = new Map();
    private _footPathMap: Map<string, Node[]> = new Map();

    private _actionPioneerView: Node = null;
    private _actionUsedCursor: OuterMapCursorView = null;
    private _actionPioneerFootStepViews: Node[] = null;

    private _actionShowPioneerId: string = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        PioneerMgr.addObserver(this);
        UserInfoMgr.addObserver(this);

        this._pioneerMap = new Map();

        NotificationMgr.addListener(NotificationName.ROOKIE_GUIDE_BEGIN_EYES, this._onRookieGuideBeginEyes, this);
        NotificationMgr.addListener(NotificationName.ROOKIE_GUIDE_THIRD_EYES, this._onRookieGuideThirdEyes, this);

        NotificationMgr.addListener(NotificationName.MAP_PIONEER_NEW_TALK_GETTED, this._refreshUI, this);
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_NEW_TALK_USED, this._refreshUI, this);
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_GET_TALK_COUNT_CHANGED, this._refreshUI, this);
    }

    protected viewDidStart() {
        super.viewDidStart();
        this._refreshUI();
        // recover, set, task, getTaskDialogShow, etc
        PioneerMgr.recoverLocalState();
        // checkRookie
        this.scheduleOnce(() => {
            const actionPioneer = PioneerMgr.getCurrentPlayerPioneer();
            if (actionPioneer != null) {
                // game camera pos
                const currentWorldPos = GameMainHelper.instance.tiledMapGetPosWorld(actionPioneer.stayPos.x, actionPioneer.stayPos.y);
                GameMainHelper.instance.changeGameCameraWorldPosition(currentWorldPos);
                // game camera zoom
                const localOuterMapScale = localStorage.getItem("local_outer_map_scale");
                if (localOuterMapScale != null) {
                    GameMainHelper.instance.changeGameCameraZoom(parseFloat(localOuterMapScale));
                }
            }
            if (!UserInfoMgr.isFinishRookie) {
                if (actionPioneer != null) {
                    this.scheduleOnce(() => {
                        GameMainHelper.instance.tiledMapShadowErase(actionPioneer.stayPos);
                    }, 0.2);
                    GameMainHelper.instance.changeGameCameraZoom(0.5);
                    // dead
                    actionPioneer.actionType = MapPioneerActionType.dead;
                    if (this._pioneerMap.has(actionPioneer.id)) {
                        this._pioneerMap.get(actionPioneer.id).getComponent(MapPioneer).refreshUI(actionPioneer);
                    }
                }
            }
        });
    }

    protected viewUpdate(dt: number): void {
        super.viewUpdate(dt);

        // default speed
        let defaultSpeed = 180;

        if (PioneerGameTest) {
            defaultSpeed = 600;
        }
        const allPioneers = PioneerMgr.getAllPioneer();

        // artifact effect
        let artifactSpeed = 0;
        const artifactEff = ArtifactMgr.getEffectiveEffect(UserInfoMgr.artifactStoreLevel);
        if (artifactEff.has(ArtifactEffectType.MOVE_SPEED)) {
            artifactSpeed = artifactEff.get(ArtifactEffectType.MOVE_SPEED);
        }

        for (var i = 0; i < allPioneers.length; i++) {
            let pioneer = allPioneers[i];
            let usedSpeed = defaultSpeed;
            for (const logic of pioneer.logics) {
                if (logic.moveSpeed > 0) {
                    usedSpeed = logic.moveSpeed;
                }
            }

            // artifact move speed
            if (pioneer.type == MapPioneerType.player) {
                usedSpeed = Math.floor(usedSpeed + usedSpeed * artifactSpeed);
            }

            if (this._movingPioneerIds.indexOf(pioneer.id) != -1 && this._pioneerMap.has(pioneer.id)) {
                let pioneermap = this._pioneerMap.get(pioneer.id);
                this._updateMoveStep(usedSpeed, dt, pioneer, pioneermap);
            }
        }
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        PioneerMgr.removeObserver(this);
        UserInfoMgr.removeObserver(this);

        NotificationMgr.removeListener(NotificationName.ROOKIE_GUIDE_BEGIN_EYES, this._onRookieGuideBeginEyes, this);
        NotificationMgr.removeListener(NotificationName.ROOKIE_GUIDE_THIRD_EYES, this._onRookieGuideThirdEyes, this);

        NotificationMgr.removeListener(NotificationName.MAP_PIONEER_NEW_TALK_GETTED, this._refreshUI, this);
        NotificationMgr.removeListener(NotificationName.MAP_PIONEER_NEW_TALK_USED, this._refreshUI, this);
        NotificationMgr.removeListener(NotificationName.MAP_PIONEER_GET_TALK_COUNT_CHANGED, this._refreshUI, this);
    }

    private _refreshUI() {
        const decorationView = this.node.getComponent(OuterTiledMapActionController).mapDecorationView();
        if (decorationView == null) {
            return;
        }
        const allPioneers = PioneerMgr.getAllPioneer();
        let changed: boolean = false;
        for (const pioneer of allPioneers) {
            if (pioneer.show) {
                let firstInit: boolean = false;
                let temple = null;
                if (this._pioneerMap.has(pioneer.id)) {
                    temple = this._pioneerMap.get(pioneer.id);
                } else {
                    // new
                    if (pioneer.type == MapPioneerType.player) {
                        temple = instantiate(this.selfPioneer);
                    } else if (pioneer.type == MapPioneerType.npc || pioneer.type == MapPioneerType.gangster) {
                        temple = instantiate(this.otherPioneer);
                    } else if (pioneer.type == MapPioneerType.hred) {
                        temple = instantiate(this.battleSmall);
                    }
                    temple.setParent(decorationView);
                    firstInit = true;
                    this._pioneerMap.set(pioneer.id, temple);

                    changed = true;
                }
                if (temple != null) {
                    if (pioneer.type == MapPioneerType.player) {
                        temple.getComponent(MapPioneer).refreshUI(pioneer);
                        temple.getComponent(MapPioneer).setEventWaitedCallback(() => {
                            GameMainHelper.instance.isTapEventWaited = true;
                            // const allBuildings = BuildingMgr.getAllBuilding();
                            const allBuildings = DataMgr.s.mapBuilding.getObj_building();
                            for (const building of allBuildings) {
                                if (building.eventId == pioneer.actionEventId) {
                                    const currentEvent = EventConfig.getById(building.eventId);
                                    if (currentEvent != null) {
                                        PioneerMgr.pioneerDealWithEvent(pioneer.id, building.id, currentEvent);
                                    }
                                    break;
                                }
                            }
                        });
                    } else if (pioneer.type == MapPioneerType.npc) {
                        temple.getComponent(OuterOtherPioneerView).refreshUI(pioneer);
                    } else if (pioneer.type == MapPioneerType.gangster) {
                        temple.getComponent(OuterOtherPioneerView).refreshUI(pioneer);
                    } else if (pioneer.type == MapPioneerType.hred) {
                        temple.getComponent(MapItemMonster).refreshUI(pioneer);
                    }
                    if (firstInit) {
                        let worldPos = GameMainHelper.instance.tiledMapGetPosWorld(pioneer.stayPos.x, pioneer.stayPos.y);
                        temple.setWorldPosition(worldPos);
                    }
                }
            } else {
                if (this._pioneerMap.has(pioneer.id)) {
                    this._pioneerMap.get(pioneer.id).destroy();
                    this._pioneerMap.delete(pioneer.id);
                }
            }
        }

        // destroy
        this._pioneerMap.forEach((value: Node, key: string) => {
            let isExsit: boolean = false;
            for (const pioneer of allPioneers) {
                if (pioneer.id == key) {
                    isExsit = true;
                    break;
                }
            }
            if (!isExsit) {
                value.destroy();
                this._pioneerMap.delete(key);
            }
        });

        if (changed) {
            this.node.getComponent(OuterTiledMapActionController).sortMapItemSiblingIndex();
        }
    }

    private _updateMoveStep(speed: number, deltaTime: number, pioneer: MapPioneerModel, pioneermap: Node) {
        if (pioneer.movePaths.length == 0) {
            return;
        }
        // var curtile = this._delegate.getPioneerTiledPosByWorldPos(pioneer.worldPos);
        // //break if curpos is skip
        // if (curtile.x != pioneer.movePath[0].x || curtile.y != pioneer.movePath[0].y) {
        //     pioneer.movePath.splice(0, 1);
        //     return;
        // }

        let nexttile = pioneer.movePaths[0];
        pioneer.stayPos = v2(nexttile.x, nexttile.y);
        var nextwpos = GameMainHelper.instance.tiledMapGetPosWorld(nexttile.x, nexttile.y);
        var dist = Vec3.distance(pioneermap.worldPosition, nextwpos);
        var add = (speed * deltaTime * this.node.scale.x) / 0.5; // calc map scale
        if (dist < add) {
            //havemove 2 target
            pioneermap.setWorldPosition(nextwpos);
            PioneerMgr.pioneerDidMoveOneStep(pioneer.id);
            if (pioneer.id == this._actionShowPioneerId && this._actionUsedCursor != null) {
                this._actionUsedCursor.hide();
                this._actionUsedCursor.show([pioneer.stayPos], Color.WHITE);
            }
            return;
        } else {
            var dir = new Vec3();
            Vec3.subtract(dir, nextwpos, pioneermap.worldPosition);
            dir = dir.normalize();
            var newpos = pioneermap.worldPosition.clone();
            newpos.x += dir.x * add;
            newpos.y += dir.y * add;
            pioneermap.setWorldPosition(newpos);
            if (pioneer.id == this._actionShowPioneerId && this._actionUsedCursor != null) {
                this._actionUsedCursor.move(v2(dir.x * add * 2, dir.y * add * 2));
            }
            //pioneer move direction
            let curMoveDirection = null;
            if (dir.y != 0) {
                curMoveDirection = dir.y > 0 ? MapPioneerMoveDirection.top : MapPioneerMoveDirection.bottom;
            } else if (dir.x != 0) {
                curMoveDirection = dir.x > 0 ? MapPioneerMoveDirection.right : MapPioneerMoveDirection.left;
            }
            if (curMoveDirection != pioneer.moveDirection) {
                pioneer.moveDirection = curMoveDirection;
                if (pioneermap.getComponent(OuterOtherPioneerView) != null) {
                    pioneermap.getComponent(OuterOtherPioneerView).refreshUI(pioneer);
                } else if (pioneermap.getComponent(MapPioneer) != null) {
                    pioneermap.getComponent(MapPioneer).refreshUI(pioneer);
                } else if (pioneermap.getComponent(MapItemMonster) != null) {
                    pioneermap.getComponent(MapItemMonster).refreshUI(pioneer);
                }
            }
        }
    }

    private _refreshFightView(
        fightId: string,
        attacker: { id: string; name: string; hp: number; hpMax: number },
        defender: { id: string; isBuilding: boolean; name: string; hp: number; hpMax: number },
        attackerIsSelf: boolean,
        fightPositons: Vec2[]
    ) {
        if (this._fightViewMap.has(fightId)) {
            this._fightViewMap.get(fightId).refreshUI(attacker, defender, attackerIsSelf);
        } else {
            const fightView = instantiate(this.fightPrefab).getComponent(OuterFightView);
            fightView.node.active = true;
            fightView.refreshUI(attacker, defender, attackerIsSelf);
            fightView.node.setParent(this.node);
            if (fightPositons.length == 7) {
                fightView.node.setWorldPosition(GameMainHelper.instance.tiledMapGetPosWorld(fightPositons[3].x, fightPositons[3].y));
            } else if (fightPositons.length == 3) {
                const beginWorldPos = GameMainHelper.instance.tiledMapGetPosWorld(fightPositons[0].x, fightPositons[0].y);
                const endWorldPos = GameMainHelper.instance.tiledMapGetPosWorld(fightPositons[1].x, fightPositons[1].y);
                fightView.node.setWorldPosition(v3(beginWorldPos.x, endWorldPos.y + (beginWorldPos.y - endWorldPos.y) / 2, 0));
            } else if (fightPositons.length > 0) {
                fightView.node.setWorldPosition(GameMainHelper.instance.tiledMapGetPosWorld(fightPositons[0].x, fightPositons[0].y));
            }
            this._fightViewMap.set(fightId, fightView);
        }
        let isEndFight: boolean = attacker.hp <= 0 || defender.hp <= 0;
        if (this._pioneerMap.has(attacker.id)) {
            const attackView = this._pioneerMap.get(attacker.id);
            if (isEndFight) {
                const pioneer = PioneerMgr.getPioneerById(attacker.id);
                if (pioneer != null && pioneer.show) {
                    this.scheduleOnce(() => {
                        attackView.active = true;
                    }, 0.8);
                }
            } else {
                attackView.active = false;
            }
        }
        if (defender.isBuilding) {
            const buildingView = this.node.getComponent(OuterBuildingController).getBuildingView(defender.id);
            if (buildingView != null) {
                buildingView.showName(isEndFight);
            }
        } else if (this._pioneerMap.has(defender.id)) {
            const defendView = this._pioneerMap.get(defender.id);
            if (isEndFight) {
                const pioneer = PioneerMgr.getPioneerById(defender.id);
                if (pioneer != null && pioneer.show) {
                    this.scheduleOnce(() => {
                        defendView.active = true;
                    }, 0.8);
                }
            } else {
                defendView.active = false;
            }
        }
    }

    private _addFootSteps(path: TilePos[], isTargetPosShowFlag: boolean = false): Node[] {
        const mapBottomView = this.node.getComponent(OuterTiledMapActionController).mapBottomView();
        if (mapBottomView == null) {
            return;
        }
        const footViews = [];
        for (let i = 0; i < path.length; i++) {
            if (i == path.length - 1) {
                if (isTargetPosShowFlag) {
                    const footView = instantiate(this.footPathTargetPrefab);
                    footView.name = "footViewTarget";
                    mapBottomView.insertChild(footView, 0);
                    let worldPos = GameMainHelper.instance.tiledMapGetPosWorld(path[i].x, path[i].y);
                    footView.setWorldPosition(worldPos);
                    footViews.push(footView);
                }
            } else {
                const currentPath = path[i];
                const nextPath = path[i + 1];
                const footView = instantiate(this.footPathPrefab);
                footView.name = "footView";
                mapBottomView.insertChild(footView, 0);
                let worldPos = GameMainHelper.instance.tiledMapGetPosWorld(currentPath.x, currentPath.y);
                footView.setWorldPosition(worldPos);
                footViews.push(footView);
                if (
                    nextPath.calc_x - currentPath.calc_x == -1 &&
                    nextPath.calc_y - currentPath.calc_y == 0 &&
                    nextPath.calc_z - currentPath.calc_z == 1
                ) {
                    footView.angle = 90;
                } else if (
                    nextPath.calc_x - currentPath.calc_x == 1 &&
                    nextPath.calc_y - currentPath.calc_y == 0 &&
                    nextPath.calc_z - currentPath.calc_z == -1
                ) {
                    footView.angle = 270;
                } else if (
                    nextPath.calc_x - currentPath.calc_x == 1 &&
                    nextPath.calc_y - currentPath.calc_y == -1 &&
                    nextPath.calc_z - currentPath.calc_z == 0
                ) {
                    footView.angle = 330;
                } else if (
                    nextPath.calc_x - currentPath.calc_x == -1 &&
                    nextPath.calc_y - currentPath.calc_y == 1 &&
                    nextPath.calc_z - currentPath.calc_z == 0
                ) {
                    footView.angle = 150;
                } else if (
                    nextPath.calc_x - currentPath.calc_x == 0 &&
                    nextPath.calc_y - currentPath.calc_y == 1 &&
                    nextPath.calc_z - currentPath.calc_z == -1
                ) {
                    footView.angle = 210;
                } else if (
                    nextPath.calc_x - currentPath.calc_x == 0 &&
                    nextPath.calc_y - currentPath.calc_y == -1 &&
                    nextPath.calc_z - currentPath.calc_z == 1
                ) {
                    footView.angle = 390;
                }
            }
        }
        return footViews;
    }

    private _checkInMainCityRangeAndHealHpToMax(pioneerId: string) {
        const mainCityId = "building_1";
        const pioneer = PioneerMgr.getPioneerById(pioneerId);

        // const mainCity = BuildingMgr.getBuildingById(mainCityId);
        const mainCity = DataMgr.s.mapBuilding.getBuildingById(mainCityId);

        if (mainCity != null && mainCity.faction != MapMemberFactionType.enemy && pioneer != null && pioneer.show) {
            let radialRange = UserInfoMgr.cityVision;
            const artifactEffect = ArtifactMgr.getEffectiveEffect(UserInfoMgr.artifactStoreLevel);
            if (artifactEffect != null && artifactEffect.has(ArtifactEffectType.CITY_RADIAL_RANGE)) {
                radialRange += artifactEffect.get(ArtifactEffectType.CITY_RADIAL_RANGE);
            }
            const isInCityRange: boolean = BuildingMgr.checkMapPosIsInBuilingRange(pioneer.stayPos, mainCityId, radialRange);
            if (isInCityRange && pioneer.hp < pioneer.hpMax) {
                PioneerMgr.pioneerHealHpToMax(pioneerId);
            }
        }
    }

    //--------------------------------------------- notification
    private _onRookieGuideBeginEyes() {
        const actionPioneer = PioneerMgr.getCurrentPlayerPioneer();
        if (actionPioneer != null) {
            actionPioneer.actionType = MapPioneerActionType.wakeup;
            let view: MapPioneer = null;
            if (this._pioneerMap.has(actionPioneer.id)) {
                view = this._pioneerMap.get(actionPioneer.id).getComponent(MapPioneer);
            }
            view.refreshUI(actionPioneer);
            this.scheduleOnce(async () => {
                actionPioneer.actionType = MapPioneerActionType.idle;
                view.refreshUI(actionPioneer);
                UIPanelManger.inst.popPanel();
                const result = await UIPanelManger.inst.pushPanel(UIName.DialogueUI);
                if (result.success) {
                    result.node.getComponent(DialogueUI).dialogShow(TalkConfig.getById("talk14"), () => {
                        UserInfoMgr.isFinishRookie = true;
                        TaskMgr.gameStarted();
                        // init resource
                        ItemMgr.addItem(
                            [
                                new ItemData(ResourceCorrespondingItem.Energy, 2000),
                                new ItemData(ResourceCorrespondingItem.Food, 2000),
                                new ItemData(ResourceCorrespondingItem.Stone, 2000),
                                new ItemData(ResourceCorrespondingItem.Wood, 2000),
                                new ItemData(ResourceCorrespondingItem.Troop, 2000),
                            ],
                            false
                        );
                    });
                }
            }, 10);
        }
    }
    private _onRookieGuideThirdEyes() {
        GameMainHelper.instance.changeGameCameraZoom(1, true);
    }

    //---------------------------------------------
    //PioneerMgrEvent
    pioneerActionTypeChanged(pioneerId: string, actionType: MapPioneerActionType, actionEndTimeStamp: number): void {
        if (actionType == MapPioneerActionType.moving) {
            this._movingPioneerIds.push(pioneerId);
        } else {
            const index = this._movingPioneerIds.indexOf(pioneerId);
            if (index >= 0) {
                this._movingPioneerIds.splice(index, 1);
            }
            if (this._footPathMap.has(pioneerId)) {
                for (const footView of this._footPathMap.get(pioneerId)) {
                    footView.destroy();
                }
                this._footPathMap.delete(pioneerId);
            }
        }
        this._refreshUI();
    }

    pioneerHpMaxChanged(pioneerId: string): void {
        this._refreshUI();
    }
    pioneerAttackChanged(pioneerId: string): void {
        this._refreshUI();
    }
    pioneerLoseHp(pioneerId: string, value: number): void {}
    pioneerGainHp(pioneerId: string, value: number): void {
        const actionView = this._pioneerMap.get(pioneerId);
        if (actionView != null && actionView.getComponent(MapPioneer) != null) {
            actionView.getComponent(MapPioneer).playGetResourceAnim(ResourceCorrespondingItem.Troop, value, null);
        }
    }
    pionerrRebirthCount(pioneerId: string, count: number): void {}
    pioneerRebirth(pioneerId: string): void {
        this._refreshUI();
    }

    pioneerDidShow(pioneerId: string): void {
        TaskMgr.showHideChanged(TaskTargetType.pioneer, pioneerId, TaskShowHideStatus.show);
        if (pioneerId == "pioneer_1" || pioneerId == "pioneer_2" || pioneerId == "pioneer_3") {
            // get secret guard
            const pioneer = PioneerMgr.getPioneerById(pioneerId);
            if (pioneer != null) {
                setTimeout(async () => {
                    if (UIPanelManger.inst.panelIsShow(UIName.CivilizationLevelUpUI)) {
                        UserInfoMgr.afterCivilizationClosedShowPioneerDatas.push(pioneer);
                    } else {
                        const result = await UIPanelManger.inst.pushPanel(UIName.SecretGuardGettedUI);
                        if (result.success) {
                            result.node.getComponent(SecretGuardGettedUI).dialogShow(pioneer.animType);
                        }
                    }
                });
            }
        }
        this._refreshUI();
    }
    pioneerDidHide(pioneerId: string): void {
        TaskMgr.showHideChanged(TaskTargetType.pioneer, pioneerId, TaskShowHideStatus.hide);
        this._refreshUI();
    }
    pioneerFactionChanged(pioneerId: string): void {
        this._refreshUI();
    }
    addNewOnePioneer(newPioneer: MapPioneerModel): void {
        this._refreshUI();
    }
    destroyOnePioneer(pioneerId: string): void {
        this._refreshUI();
    }

    beginFight(
        fightId: string,
        attacker: { id: string; name: string; hp: number; hpMax: number },
        defender: { id: string; isBuilding: boolean; name: string; hp: number; hpMax: number },
        attackerIsSelf: boolean,
        fightPositions: math.Vec2[]
    ): void {
        this._refreshFightView(fightId, attacker, defender, attackerIsSelf, fightPositions);
    }

    fightDidAttack(
        fightId: string,
        attacker: { id: string; name: string; hp: number; hpMax: number },
        defender: { id: string; isBuilding: boolean; name: string; hp: number; hpMax: number },
        attackerIsSelf: boolean,
        fightPositions: math.Vec2[]
    ): void {
        this._refreshFightView(fightId, attacker, defender, attackerIsSelf, fightPositions);
    }

    endFight(fightId: string, isEventFight: boolean, isDeadPionner: boolean, deadId: string, isPlayerWin: boolean, playerPioneerId: string): void {
        //fightview destroy
        if (this._fightViewMap.has(fightId)) {
            const fightView = this._fightViewMap.get(fightId);
            const resultView = instantiate(this.fightResultPrefab);
            resultView.setParent(fightView.node.parent);
            resultView.position = fightView.node.position;
            resultView.getComponent(OuterFightResultView).showResult(isPlayerWin, () => {
                resultView.destroy();
            });
            fightView.node.destroy();
            this._fightViewMap.delete(fightId);
        }

        if (playerPioneerId != null) {
            this._checkInMainCityRangeAndHealHpToMax(playerPioneerId);
        }

        if (isEventFight) {
            return;
        }
        // find task to finish
        if (isPlayerWin) {
            if (isDeadPionner) {
                // task
                TaskMgr.pioneerKilled(deadId);
                // pioneer win reward
                const deadPioneer = PioneerMgr.getPioneerById(deadId);
                if (deadPioneer != null) {
                    UserInfoMgr.explorationValue += deadPioneer.winprogress;
                    if (deadPioneer.drop != null) {
                        ItemConfigDropTool.getItemByConfig(deadPioneer.drop);
                    }
                }
                // settle
                SettlementMgr.insertSettlement({
                    level: UserInfoMgr.level,
                    newPioneerIds: [],
                    killEnemies: 1,
                    gainResources: 0,
                    consumeResources: 0,
                    gainTroops: 0,
                    consumeTroops: 0,
                    gainEnergy: 0,
                    consumeEnergy: 0,
                    exploredEvents: 0,
                });
            } else {
                // const deadBuilding = BuildingMgr.getBuildingById(deadId);
                const deadBuilding = DataMgr.s.mapBuilding.getBuildingById(deadId);
                if (deadBuilding != null) {
                    UserInfoMgr.explorationValue += deadBuilding.winprogress;
                }
            }
        }
    }
    async exploredPioneer(pioneerId: string): Promise<void> {
        const pioneer = PioneerMgr.getPioneerById(pioneerId);
        if (pioneer != null) {
            if (pioneer.type == MapPioneerType.gangster) {
                ItemMgr.addItem([new ItemData(ResourceCorrespondingItem.Troop, pioneer.hpMax)]);
            } else if (pioneer.type == MapPioneerType.npc) {
                const npcModel = pioneer as MapNpcPioneerModel;
                if (npcModel.talkId != null) {
                    const talk = TalkConfig.getById(npcModel.talkId);
                    const result = await UIPanelManger.inst.pushPanel(UIName.DialogueUI);
                    if (result.success) {
                        result.node.getComponent(DialogueUI).dialogShow(talk);
                    }
                }
            }
        }
    }
    exploredBuilding(buildingId: string): void {
        // const building = BuildingMgr.getBuildingById(buildingId);
        const building = DataMgr.s.mapBuilding.getBuildingById(buildingId);
        if (building != null) {
            if (building.progress > 0) UserInfoMgr.explorationValue += building.progress;
            if (building.exp > 0) UserInfoMgr.exp += building.exp;
        }
    }
    miningBuilding(actionPioneerId: string, buildingId: string): void {
        // const buildingObj: MapBuildingObject = BuildingMgr.getBuildingById(buildingId);
        const buildingObj: MapBuildingObject = DataMgr.s.mapBuilding.getBuildingById(buildingId);

        if (buildingObj == null) return;
        if (buildingObj.type != MapBuildingType.resource) return;

        const building = buildingObj as MapBuildingResourceObject;

        if (building.resources != null && building.resources.length > 0) {
            let isPlayer: boolean = false;
            for (const temple of PioneerMgr.getPlayerPioneer()) {
                if (temple.id == actionPioneerId) {
                    isPlayer = true;
                    break;
                }
            }
            let actionView = null;
            if (isPlayer && this._pioneerMap.has(actionPioneerId)) {
                actionView = this._pioneerMap.get(actionPioneerId);
            }
            for (const resource of building.resources) {
                const resultNum: number = Math.floor(resource.num * (1 + LvlupConfig.getTotalExtraRateByLvl(UserInfoMgr.level)));
                actionView.getComponent(MapPioneer).playGetResourceAnim(resource.id, resultNum, () => {
                    ItemMgr.addItem([new ItemData(resource.id, resultNum)]);
                });
            }

            NotificationMgr.triggerEvent(NotificationName.MINING_FINISHED, {
                buildingId: buildingId,
                pioneerId: actionPioneerId,
                duration: 3000, //todo see assets/Script/Manger/PioneerMgr.ts:1225
                rewards: [], // no item loots by now
            });
        }

        if (building.progress > 0) UserInfoMgr.explorationValue += building.progress;
        if (building.exp > 0) UserInfoMgr.exp += building.exp;
    }
    async eventBuilding(actionPioneerId: string, buildingId: string, eventId: string): Promise<void> {
        GlobalData.latestActiveEventState = {
            pioneerId: actionPioneerId,
            buildingId: buildingId,
            eventId: eventId,
            prevEventId: null,
        };

        const event = EventConfig.getById(eventId);
        if (event != null) {
            const result = await UIPanelManger.inst.pushPanel(UIName.BrachEventUI);
            if (result.success) {
                result.node.getComponent(EventUI).eventUIShow(
                    actionPioneerId,
                    buildingId,
                    event,
                    (
                        attackerPioneerId: string,
                        enemyPioneerId: string,
                        temporaryAttributes: Map<string, MapPioneerAttributesChangeModel>,
                        fightOver: (succeed: boolean) => void
                    ) => {
                        PioneerMgr.pioneerEventStatusToNone(actionPioneerId);
                        PioneerMgr.eventFight(attackerPioneerId, enemyPioneerId, temporaryAttributes, fightOver);
                    },
                    (nextEvent: EventConfigData) => {
                        PioneerMgr.pioneerEventStatusToNone(actionPioneerId);
                        PioneerMgr.pioneerDealWithEvent(actionPioneerId, buildingId, nextEvent);
                    }
                );
            }
        }
    }
    pioneerLogicMoveTimeCountChanged(pioneer: MapPioneerModel): void {
        this._refreshUI();
    }
    pioneerLogicMove(pioneer: MapPioneerModel, logic: MapPioneerLogicModel): void {
        let targetMapPos: Vec2 = null;
        if (logic.type == MapPioneerLogicType.stepmove) {
            const targetTiledPos = GameMainHelper.instance.tiledMapGetAroundByDirection(pioneer.stayPos, logic.direction);
            if (targetTiledPos != null) {
                targetMapPos = v2(targetTiledPos.x, targetTiledPos.y);
            }
        } else if (logic.type == MapPioneerLogicType.targetmove) {
            targetMapPos = logic.targetPos;
        } else if (logic.type == MapPioneerLogicType.patrol) {
            targetMapPos = logic.patrolTargetPos;
        }
        if (targetMapPos != null) {
            PioneerMgr.pioneerBeginMove(pioneer.id, GameMainHelper.instance.tiledMapGetTiledMovePathByTiledPos(pioneer.stayPos, targetMapPos).path);
        }
    }
    pioneerLogicMovePathPrepared(pioneer: MapPioneerModel, logic: MapPioneerLogicModel) {
        if (this._actionShowPioneerId == pioneer.id && logic.type == MapPioneerLogicType.patrol) {
            if (this._actionPioneerFootStepViews != null) {
                for (const view of this._actionPioneerFootStepViews) {
                    view.destroy();
                }
                this._actionPioneerFootStepViews = null;
            }
            const movePaths = GameMainHelper.instance.tiledMapGetTiledMovePathByTiledPos(pioneer.stayPos, logic.patrolTargetPos).path;
            const path = [];
            for (const temple of movePaths) {
                path.push(temple);
            }
            if (path.length > 0) {
                this._actionPioneerFootStepViews = this._addFootSteps(path, true);
            }
        }
    }
    playerPioneerShowMovePath(pioneerId: string, path: TilePos[]): void {
        const footViews = this._addFootSteps(path);
        this._footPathMap.set(pioneerId, footViews);
    }

    playerPioneerDidMoveOneStep(pioneerId: string): void {
        if (this._footPathMap.get(pioneerId)) {
            const footViews = this._footPathMap.get(pioneerId);
            if (footViews.length > 0) {
                const footView = footViews.shift();
                footView.destroy();
            }
        }
        this.node.getComponent(OuterTiledMapActionController).sortMapItemSiblingIndex();

        this._checkInMainCityRangeAndHealHpToMax(pioneerId);
    }

    //---------------------------------------------
    //UserInfoEvent
    playerNameChanged(value: string): void {}
    getProp(propId: string, num: number): void {}
}
