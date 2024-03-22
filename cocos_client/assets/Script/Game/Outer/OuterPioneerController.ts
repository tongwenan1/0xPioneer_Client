import { _decorator, Color, Component, director, instantiate, math, misc, Node, pingPong, Prefab, Quat, quat, sp, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { GameMain } from '../../GameMain';
import { TilePos } from '../TiledMap/TileTool';
import { OuterFightView } from './View/OuterFightView';
import { OuterOtherPioneerView } from './View/OuterOtherPioneerView';
import { MapItemMonster } from './View/MapItemMonster';
import { MapPioneer } from './View/MapPioneer';
import { MapBG } from '../../Scene/MapBG';
import { OuterMapCursorView } from './View/OuterMapCursorView';
import { EventName, ResourceCorrespondingItem } from '../../Const/ConstDefine';
import ItemConfigDropTool from '../../Tool/ItemConfigDropTool';
import { PioneerMgrEvent } from '../../Const/Manager/PioneerMgrDefine';
import { FinishedEvent, UserInfoEvent } from '../../Const/Manager/UserInfoMgrDefine';
import { ArtifactMgr, BranchEventMgr, BuildingMgr, EventMgr, ItemMgr, LanMgr, LvlupMgr, PioneerMgr, SettlementMgr, TalkMgr, TaskMgr, UIPanelMgr, UserInfoMgr } from '../../Utils/Global';
import { BuildingFactionType } from '../../Const/Model/MapBuildingModelDefine';
import { MapPioneerLogicType, MapPioneerActionType, MapPioneerType, MapPioneerMoveDirection, MapPioneerAttributesChangeModel } from '../../Const/Model/MapPioneerModelDefine';
import { MapResourceBuildingModel } from './Model/MapBuildingModel';
import MapPioneerModel, { MapPioneerLogicModel, MapNpcPioneerModel } from './Model/MapPioneerModel';
import { ArtifactEffectType } from '../../Const/Model/ArtifactModelDefine';
import ItemData from '../../Model/ItemData';
import { OuterBuildingController } from './OuterBuildingController';
import { UIName } from '../../Const/ConstUIDefine';
import { DialogueUI } from '../../UI/Outer/DialogueUI';
import { SecretGuardGettedUI } from '../../UI/Outer/SecretGuardGettedUI';
import { TaskListUI } from '../../UI/TaskListUI';
import { EventUI } from '../../UI/Outer/EventUI';
import { UIHUDController } from '../../UI/UIHUDController';


const { ccclass, property } = _decorator;

@ccclass('OuterPioneerController')
export class OuterPioneerController extends Component implements PioneerMgrEvent, UserInfoEvent {

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
                this._actionPioneerView.worldPosition = GameMain.inst.outSceneMap.mapBG.getPosWorld(tilePos.x, tilePos.y);
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
                        nextTilePos = GameMain.inst.outSceneMap.mapBG.getAroundByDirection(v2(nextTilePos.x, nextTilePos.y), stepLogic.direction);
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

    private _started: boolean = false;
    private _dataLoaded: boolean = false;

    private _actionShowPioneerId: string = null;
    protected onLoad(): void {
        PioneerMgr.addObserver(this);
        UserInfoMgr.addObserver(this);

        this._pioneerMap = new Map();

        EventMgr.on(EventName.LOADING_FINISH, this.onLocalDataLoadOver, this);
        EventMgr.on(EventName.ROOKIE_GUIDE_BEGIN_EYES, this.onRookieGuideBeginEyes, this);
        EventMgr.on(EventName.ROOKIE_GUIDE_THIRD_EYES, this.onRookieGuideThirdEyes, this);
    }

    start() {
        console.log("exce stated: " + (Date.now()));
        this._started = true;
        this._startAction();
    }

    protected onDestroy(): void {
        PioneerMgr.removeObserver(this);
        UserInfoMgr.removeObserver(this);
    }

    private _cameraBeginOrthoHeight: number = 0;
    private _startAction() {
        if (this._started && this._dataLoaded) {
            this._refreshUI();
            // recover, set, task, getTaskDialogShow, etc
            PioneerMgr.recoverLocalState();
            // checkRookie
            this._cameraBeginOrthoHeight = GameMain.inst.MainCamera.orthoHeight;

            const actionPioneer = PioneerMgr.getCurrentPlayerPioneer();
            if (actionPioneer != null) {
                const currentWorldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(actionPioneer.stayPos.x, actionPioneer.stayPos.y);
                GameMain.inst.MainCamera.node.worldPosition = currentWorldPos;
                const localOuterMapScale = localStorage.getItem("local_outer_map_scale");
                if (localOuterMapScale != null) {
                    GameMain.inst.MainCamera.orthoHeight = this._cameraBeginOrthoHeight * parseFloat(localOuterMapScale);
                }
                console.log("exce force: " + (Date.now()));
            }

            if (!UserInfoMgr.isFinishRookie) {
                if (actionPioneer != null) {
                    this.scheduleOnce(() => {
                        GameMain.inst.outSceneMap.mapBG.shadowErase(actionPioneer.stayPos);
                    }, 0.2);
                    GameMain.inst.MainCamera.orthoHeight = 0.5 * this._cameraBeginOrthoHeight;
                    actionPioneer.actionType = MapPioneerActionType.dead;
                    if (this._pioneerMap.has(actionPioneer.id)) {
                        this._pioneerMap.get(actionPioneer.id).getComponent(MapPioneer).refreshUI(actionPioneer);
                    }
                }

                // const prophetess = PioneerMgr.getPioneerByName("prophetess");
                // if (actionPioneer != null && prophetess != null) {
                //     const paths = GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(actionPioneer.stayPos, prophetess.stayPos);
                //     actionPioneer.purchaseMovingPioneerId = prophetess.id;
                //     PioneerMgr.pioneerBeginMove(actionPioneer.id, paths);
                // }
            }
        }
    }

    private _refreshUI() {
        const decorationView = this.node.getComponent(MapBG).mapDecorationView();
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

                    } else if (pioneer.type == MapPioneerType.npc ||
                        pioneer.type == MapPioneerType.gangster) {
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
                            const allBuildings = BuildingMgr.getAllBuilding();
                            for (const building of allBuildings) {
                                if (building.eventId == pioneer.actionEventId) {
                                    const currentEvents = BranchEventMgr.getEventById(building.eventId);
                                    if (currentEvents.length > 0) {
                                        PioneerMgr.pioneerDealWithEvent(pioneer.id, building.id, currentEvents[0]);
                                    }
                                    break;
                                }
                            }
                        });

                    } else if (pioneer.type == MapPioneerType.npc) {
                        const npcModel = pioneer as MapNpcPioneerModel;
                        const task = TaskMgr.getTaskByNpcId(pioneer.id, npcModel.friendly, npcModel.hideTaskIds, UserInfoMgr.currentTaskIds, UserInfoMgr.finishedEvents);
                        if (npcModel.taskObj == null &&
                            task != null) {
                            // npc get task
                            npcModel.taskObj = task;
                            if (task.entrypoint.hidetimecount != null) {
                                npcModel.taskHideTime = task.entrypoint.hidetimecount;
                            }
                            if (task.entrypoint.cdtimecount != null) {
                                npcModel.taskCdEndTime = task.entrypoint.cdtimecount;
                            }
                        } else if (task == null &&
                            npcModel.taskObj != null) {
                            // npc lose task
                            npcModel.taskObj = null;
                        }
                        temple.getComponent(OuterOtherPioneerView).refreshUI(pioneer);

                    } else if (pioneer.type == MapPioneerType.gangster) {
                        temple.getComponent(OuterOtherPioneerView).refreshUI(pioneer);

                    } else if (pioneer.type == MapPioneerType.hred) {
                        temple.getComponent(MapItemMonster).refreshUI(pioneer, UserInfoMgr.finishedEvents);
                    }
                    if (firstInit) {
                        let worldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(pioneer.stayPos.x, pioneer.stayPos.y);
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
            this.node.getComponent(MapBG).sortMapItemSiblingIndex();
        }
    }

    updateMoveStep(speed: number, deltaTime: number, pioneer: MapPioneerModel, pioneermap: Node) {
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
        var nextwpos = GameMain.inst.outSceneMap.mapBG.getPosWorld(nexttile.x, nexttile.y);
        var dist = Vec3.distance(pioneermap.worldPosition, nextwpos);
        var add = speed * deltaTime * GameMain.inst.outSceneMap.node.scale.x / 0.5; // calc map scale
        if (dist < add) //havemove 2 target
        {
            pioneermap.setWorldPosition(nextwpos);
            PioneerMgr.pioneerDidMoveOneStep(pioneer.id);
            if (pioneer.id == this._actionShowPioneerId && this._actionUsedCursor != null) {
                this._actionUsedCursor.hide();
                this._actionUsedCursor.show([pioneer.stayPos], Color.WHITE);
            }
            return;
        }
        else {
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
                    pioneermap.getComponent(MapItemMonster).refreshUI(pioneer, UserInfoMgr.finishedEvents);
                }
            }
        }
    }

    async update(deltaTime: number) {
        // default speed
        let defaultSpeed = 180;

        // defaultSpeed = 600;
        const allPioneers = PioneerMgr.getAllPioneer();

        // artifact effect
        let artifactSpeed = 0;
        const artifactEff = ArtifactMgr.getPropEffValue(UserInfoMgr.level);
        if (artifactEff.eff[ArtifactEffectType.MOVE_SPEED]) {
            artifactSpeed = artifactEff.eff[ArtifactEffectType.MOVE_SPEED];
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
                this.updateMoveStep(usedSpeed, deltaTime, pioneer, pioneermap);
            }
        }
    }

    private onLocalDataLoadOver() {
        this._dataLoaded = true;
        this._startAction();
    }

    private onRookieGuideBeginEyes() {
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
                UIPanelMgr.removePanel(UIName.RookieGuide);
                
                const dialog = await UIPanelMgr.openPanel(UIName.DialogueUI);
                if (dialog != null) {
                    dialog.getComponent(DialogueUI).dialogShow(TalkMgr.getTalk("talk14"), null, () => {
                        UserInfoMgr.isFinishRookie = true;
                        // init resource
                        ItemMgr.addItem([
                            new ItemData(ResourceCorrespondingItem.Energy, 100),
                            new ItemData(ResourceCorrespondingItem.Food, 100),
                            new ItemData(ResourceCorrespondingItem.Stone, 100),
                            new ItemData(ResourceCorrespondingItem.Wood, 100),
                            new ItemData(ResourceCorrespondingItem.Troop, 500),
                        ]);
                    });
                }
            }, 10);
        }
    }
    private onRookieGuideThirdEyes() {
        tween(GameMain.inst.MainCamera)
            .to(0.5, { orthoHeight: this._cameraBeginOrthoHeight })
            .start();
    }

    private _refreshFightView(fightId: string, attacker: { id: string; name: string; hp: number; hpMax: number; }, defender: { id: string; isBuilding: boolean; name: string; hp: number; hpMax: number; }, attackerIsSelf: boolean, fightPositons: Vec2[]) {
        if (this._fightViewMap.has(fightId)) {
            this._fightViewMap.get(fightId).refreshUI(attacker, defender, attackerIsSelf);

        } else {
            const fightView = instantiate(this.fightPrefab).getComponent(OuterFightView);
            fightView.node.active = true;
            fightView.refreshUI(attacker, defender, attackerIsSelf);
            fightView.node.setParent(this.node);
            if (fightPositons.length == 7) {
                fightView.node.setWorldPosition(GameMain.inst.outSceneMap.mapBG.getPosWorld(fightPositons[3].x, fightPositons[3].y));
            } else if (fightPositons.length == 3) {
                const beginWorldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(fightPositons[0].x, fightPositons[0].y);
                const endWorldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(fightPositons[1].x, fightPositons[1].y);
                fightView.node.setWorldPosition(v3(
                    beginWorldPos.x,
                    endWorldPos.y + (beginWorldPos.y - endWorldPos.y) / 2,
                    0
                ));

            } else if (fightPositons.length > 0) {
                fightView.node.setWorldPosition(GameMain.inst.outSceneMap.mapBG.getPosWorld(fightPositons[0].x, fightPositons[0].y));
            }
            this._fightViewMap.set(fightId, fightView);
        }
        let isEndFight: boolean = attacker.hp <= 0 || defender.hp <= 0;
        if (this._pioneerMap.has(attacker.id)) {
            const attackView = this._pioneerMap.get(attacker.id);
            if (isEndFight) {
                const pioneer = PioneerMgr.getPioneerById(attacker.id);
                if (pioneer != null && pioneer.show) {
                    this.scheduleOnce(()=> {
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
                    this.scheduleOnce(()=> {
                        defendView.active = true;
                    }, 0.8);
                }
            } else {
                defendView.active = false;
            }
        }
    }

    private _addFootSteps(path: TilePos[], isTargetPosShowFlag: boolean = false): Node[] {
        const mapBottomView = this.node.getComponent(MapBG).mapBottomView();
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
                    let worldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(path[i].x, path[i].y);
                    footView.setWorldPosition(worldPos);
                    footViews.push(footView);
                }
            } else {
                const currentPath = path[i];
                const nextPath = path[i + 1];
                const footView = instantiate(this.footPathPrefab);
                footView.name = "footView";
                mapBottomView.insertChild(footView, 0);
                let worldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(currentPath.x, currentPath.y);
                footView.setWorldPosition(worldPos);
                footViews.push(footView);
                if (nextPath.calc_x - currentPath.calc_x == -1 &&
                    nextPath.calc_y - currentPath.calc_y == 0 &&
                    nextPath.calc_z - currentPath.calc_z == 1) {
                    footView.angle = 90;
                } else if (nextPath.calc_x - currentPath.calc_x == 1 &&
                    nextPath.calc_y - currentPath.calc_y == 0 &&
                    nextPath.calc_z - currentPath.calc_z == -1) {
                    footView.angle = 270;
                } else if (nextPath.calc_x - currentPath.calc_x == 1 &&
                    nextPath.calc_y - currentPath.calc_y == -1 &&
                    nextPath.calc_z - currentPath.calc_z == 0) {
                    footView.angle = 330;
                } else if (nextPath.calc_x - currentPath.calc_x == -1 &&
                    nextPath.calc_y - currentPath.calc_y == 1 &&
                    nextPath.calc_z - currentPath.calc_z == 0) {
                    footView.angle = 150;
                } else if (nextPath.calc_x - currentPath.calc_x == 0 &&
                    nextPath.calc_y - currentPath.calc_y == 1 &&
                    nextPath.calc_z - currentPath.calc_z == -1) {
                    footView.angle = 210;
                } else if (nextPath.calc_x - currentPath.calc_x == 0 &&
                    nextPath.calc_y - currentPath.calc_y == -1 &&
                    nextPath.calc_z - currentPath.calc_z == 1) {
                    footView.angle = 390;
                }
            }
        }
        return footViews;
    }

    private _checkInMainCityRangeAndHealHpToMax(pioneerId: string) {
        const mainCityId = "building_1";
        const pioneer = PioneerMgr.getPioneerById(pioneerId);
        const mainCity = BuildingMgr.getBuildingById(mainCityId);
        if (mainCity != null && mainCity.faction != BuildingFactionType.enemy &&
            pioneer != null && pioneer.show) {
            const isInCityRange: boolean = BuildingMgr.checkMapPosIsInBuilingRange(pioneer.stayPos, mainCityId, UserInfoMgr.cityVision);
            if (isInCityRange && pioneer.hp < pioneer.hpMax) {
                PioneerMgr.pioneerHealHpToMax(pioneerId);
            }
        }
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
    pioneerLoseHp(pioneerId: string, value: number): void {

    }
    pioneerGainHp(pioneerId: string, value: number): void {
        const actionView = this._pioneerMap.get(pioneerId);
        if (actionView != null && actionView.getComponent(MapPioneer) != null) {
            actionView.getComponent(MapPioneer).playGetResourceAnim(ResourceCorrespondingItem.Troop, value, null);
        }
    }
    pionerrRebirthCount(pioneerId: string, count: number): void {

    }
    pioneerRebirth(pioneerId: string): void {
        this._refreshUI();
    }

    pioneerDidShow(pioneerId: string): void {
        if (pioneerId == "pioneer_1" ||
            pioneerId == "pioneer_2" ||
            pioneerId == "pioneer_3") {
            // get secret guard
            const pioneer = PioneerMgr.getPioneerById(pioneerId);
            if (pioneer != null) {
                setTimeout(async () => {
                    if (UIPanelMgr.getPanelIsShow(UIName.CivilizationLevelUpUI)) {
                        UserInfoMgr.afterCivilizationClosedShowPioneerDatas.push(pioneer);
                    } else {
                        const view = await UIPanelMgr.openPanel(UIName.SecretGuardGettedUI);
                        if (view != null) {
                            view.getComponent(SecretGuardGettedUI).dialogShow(pioneer.animType);
                        }
                    }
                });
            }
        }
        this._refreshUI();
    }
    pioneerDidHide(pioneerId: string): void {
        UserInfoMgr.hidePioneerCheckTaskFail(pioneerId);
        this._refreshUI();
    }
    pioneerDidNonFriendly(pioneerId: string): void {
        this._refreshUI();
    }
    pioneerDidFriendly(pioneerId: string): void {
        this._refreshUI();
    }
    addNewOnePioneer(newPioneer: MapPioneerModel): void {
        this._refreshUI();
    }
    destroyOnePioneer(pioneerId: string): void {
        this._refreshUI();
    }
    pioneerTaskBeenGetted(pioneerId: string, taskId: string): void {
        this._refreshUI();
    }
    async showGetTaskDialog(task: any): Promise<void> {
        const talk = TalkMgr.getTalk(task.entrypoint.talk);
        const dialog = await UIPanelMgr.openPanel(UIName.DialogueUI);
        if (dialog != null) {
            dialog.getComponent(DialogueUI).dialogShow(talk, task);
        }
    }

    beginFight(fightId: string, attacker: { id: string; name: string; hp: number; hpMax: number; }, defender: { id: string; isBuilding: boolean; name: string; hp: number; hpMax: number; }, attackerIsSelf: boolean, fightPositions: math.Vec2[]): void {
        this._refreshFightView(fightId, attacker, defender, attackerIsSelf, fightPositions);
    }

    fightDidAttack(fightId: string, attacker: { id: string; name: string; hp: number; hpMax: number; }, defender: { id: string; isBuilding: boolean; name: string; hp: number; hpMax: number; }, attackerIsSelf: boolean, fightPositions: math.Vec2[]): void {
        this._refreshFightView(fightId, attacker, defender, attackerIsSelf, fightPositions);
    }

    endFight(fightId: string, isEventFight: boolean, isDeadPionner: boolean, deadId: string, isPlayerWin: boolean, playerPioneerId: string): void {
        //fightview destroy
        if (this._fightViewMap.has(fightId)) {
            const currentFightView = this._fightViewMap.get(fightId);
            currentFightView.showResult(isPlayerWin, () => {
                currentFightView.node.destroy();
            });
            this._fightViewMap.delete(fightId);
        }

        if (playerPioneerId != null) {
            this._checkInMainCityRangeAndHealHpToMax(playerPioneerId);
        }

        if (isEventFight) {
            return;
        }
        // find task to finish
        if (isDeadPionner) {
            SettlementMgr.insertSettlement({
                level: UserInfoMgr.level,
                newPioneerIds: [],
                killEnemies: 1,
                gainResources: 0,
                exploredEvents: 0,
            });
            UserInfoMgr.checkCanFinishedTask("killpioneer", deadId);
            const deadPioneer = PioneerMgr.getPioneerById(deadId);
            if (deadPioneer != null && !deadPioneer.friendly) {
                UserInfoMgr.explorationValue += deadPioneer.winprogress;
                if (deadPioneer.drop != null) {
                    ItemConfigDropTool.getItemByConfig(deadPioneer.drop);
                }
            }

        } else {
            //building
            UserInfoMgr.checkCanFinishedTask("destroybuilding", deadId);

            const deadBuilding = BuildingMgr.getBuildingById(deadId);
            if (deadBuilding != null && deadBuilding.faction == BuildingFactionType.enemy) {
                UserInfoMgr.explorationValue += deadBuilding.winprogress;
            }
        }
    }
    exploredPioneer(pioneerId: string): void {
        const pioneer = PioneerMgr.getPioneerById(pioneerId);
        if (pioneer != null && pioneer.type == MapPioneerType.gangster) {
            ItemMgr.addItem([new ItemData(ResourceCorrespondingItem.Troop, pioneer.hpMax)]);
        }
        UserInfoMgr.checkCanFinishedTask("explorewithpioneer", pioneerId);
    }
    exploredBuilding(buildingId: string): void {
        UserInfoMgr.checkCanFinishedTask("explorewithbuilding", buildingId);
        const building = BuildingMgr.getBuildingById(buildingId);
        if (building != null) {
            if (building.progress > 0) UserInfoMgr.explorationValue += building.progress;
            if (building.exp > 0) UserInfoMgr.exp += building.exp;
        }
    }
    miningBuilding(actionPioneerId: string, buildingId: string): void {
        UserInfoMgr.checkCanFinishedTask("getresourcereached", buildingId);
        const building = BuildingMgr.getBuildingById(buildingId);
        if (building != null && building instanceof MapResourceBuildingModel) {
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
                    const resultNum: number = Math.floor(resource.num * (1 + LvlupMgr.getTotalExtraRateByLvl(UserInfoMgr.level)));
                    actionView.getComponent(MapPioneer).playGetResourceAnim(resource.id, resultNum, () => {
                        ItemMgr.addItem([new ItemData(resource.id, resultNum)]);
                    });
                    SettlementMgr.insertSettlement({
                        level: UserInfoMgr.level,
                        newPioneerIds: [],
                        killEnemies: 0,
                        gainResources: resultNum,
                        exploredEvents: 0,
                    });
                }

                EventMgr.emit(EventName.MINING_FINISHED, {
                    buildingId: buildingId,
                    pioneerId: actionPioneerId,
                    duration: 3000, //todo see assets/Script/Manger/PioneerMgr.ts:1225
                    rewards: [], // no item loots by now
                });
            }
        }
        if (building != null) {
            if (building.progress > 0) UserInfoMgr.explorationValue += building.progress;
            if (building.exp > 0) UserInfoMgr.exp += building.exp;
        }
    }
    async eventBuilding(actionPioneerId: string, buildingId: string, eventId: string): Promise<void> {
        BranchEventMgr.latestActiveEventState = {
            pioneerId: actionPioneerId,
            buildingId: buildingId,
            eventId: eventId,
            prevEventId: null,
        }

        const event = BranchEventMgr.getEventById(eventId);
        if (event.length > 0) {
            const view = await UIPanelMgr.openPanel(UIName.BrachEventUI);
            if (view != null) {
                view.getComponent(EventUI).eventUIShow(actionPioneerId, buildingId, event[0], (attackerPioneerId: string, enemyPioneerId: string, temporaryAttributes: Map<string, MapPioneerAttributesChangeModel>, fightOver: (succeed: boolean) => void) => {
                    PioneerMgr.eventFight(attackerPioneerId, enemyPioneerId, temporaryAttributes, fightOver);
                }, (nextEvent: any) => {
                    PioneerMgr.pioneerDealWithEvent(actionPioneerId, buildingId, nextEvent);
                });
            }
        }
    }

    pioneerTaskHideTimeCountChanged(pioneerId: string, timeCount: number) {
        this._refreshUI();
    }
    pioneerTaskCdTimeCountChanged(pioneerId: string, timeCount: number): void {
        this._refreshUI();
    }
    pioneerLogicMoveTimeCountChanged(pioneer: MapPioneerModel): void {
        this._refreshUI();
    }
    pioneerLogicMove(pioneer: MapPioneerModel, logic: MapPioneerLogicModel): void {
        let targetMapPos: Vec2 = null;
        if (logic.type == MapPioneerLogicType.stepmove) {
            const targetTiledPos = GameMain.inst.outSceneMap.mapBG.getAroundByDirection(pioneer.stayPos, logic.direction);
            if (targetTiledPos != null) {
                targetMapPos = v2(targetTiledPos.x, targetTiledPos.y);
            }
        } else if (logic.type == MapPioneerLogicType.targetmove) {
            targetMapPos = logic.targetPos;
        } else if (logic.type == MapPioneerLogicType.patrol) {
            targetMapPos = logic.patrolTargetPos;
        }
        if (targetMapPos != null) {
            PioneerMgr.pioneerBeginMove(pioneer.id, GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(pioneer.stayPos, targetMapPos));
        }
    }
    pioneerLogicMovePathPrepared(pioneer: MapPioneerModel, logic: MapPioneerLogicModel) {
        if (this._actionShowPioneerId == pioneer.id &&
            logic.type == MapPioneerLogicType.patrol) {
            if (this._actionPioneerFootStepViews != null) {
                for (const view of this._actionPioneerFootStepViews) {
                    view.destroy();
                }
                this._actionPioneerFootStepViews = null;
            }
            const movePaths = GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(pioneer.stayPos, logic.patrolTargetPos);
            const path = [];
            for (const temple of movePaths) {
                path.push(temple);
            }
            if (path.length > 0) {
                this._actionPioneerFootStepViews = this._addFootSteps(path, true);
            }
        }
    }
    pioneerShowCount(pioneerId: string, count: number): void {

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
        this.node.getComponent(MapBG).sortMapItemSiblingIndex();

        this._checkInMainCityRangeAndHealHpToMax(pioneerId);
    }

    //---------------------------------------------
    //UserInfoEvent
    playerNameChanged(value: string): void {

    }
    getNewTask(task: string): void {
        PioneerMgr.clearNpcTask(task);
    }
    finishEvent(event: FinishedEvent): void {
        this._refreshUI();
    }
    async triggerTaskStepAction(action: string, delayTime: number): Promise<void> {
        const temp = action.split("|");
        if (temp[0] == "pioneershow" ||
            temp[0] == "pioneerhide" ||
            temp[0] == "pioneernonfriendly" ||
            temp[0] == "pioneerfriendly" ||
            temp[0] == "fightwithpioneer" ||
            temp[0] == "maincityfightwithpioneer" ||
            temp[0] == "getnewplayer") {
            PioneerMgr.dealWithTaskAction(action, delayTime);

        } else if (temp[0] == "talk") {
            const talk = TalkMgr.getTalk(temp[1]);
            const dialog = await UIPanelMgr.openPanel(UIName.DialogueUI);
            if (dialog != null) {
                dialog.getComponent(DialogueUI).dialogShow(talk, null);
            }
        }
    }
    taskProgressChanged(taskId: string): void {
        if (UIPanelMgr.getPanelIsShow(UIName.TaskListUI)) {
            const view = UIPanelMgr.getPanel(UIName.TaskListUI);
            view.getComponent(TaskListUI).refreshUI();
        }
    }
    taskFailed(taskId: string): void {
        if (UIPanelMgr.getPanelIsShow(UIName.TaskListUI)) {
            const view = UIPanelMgr.getPanel(UIName.TaskListUI);
            view.getComponent(TaskListUI).refreshUI();
        }
    }

    getProp(propId: string, num: number): void {

    }

    gameTaskOver(): void {

        // useLanMgr
        UIHUDController.showCenterTip(LanMgr.getLanById("200001"));
        // UIHUDController.showCenterTip("Boot ends");

    }
    generateTroopTimeCountChanged(leftTime: number): void {

    }
}