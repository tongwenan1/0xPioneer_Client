import { _decorator, Color, Component, director, instantiate, math, misc, Node, pingPong, Prefab, Quat, quat, sp, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { GameMain } from '../../GameMain';
import BranchEventMgr from '../../Manger/BranchEventMgr';
import BuildingMgr from '../../Manger/BuildingMgr';
import EventMgr from '../../Manger/EventMgr';
import PioneerMgr, { PioneerMgrEvent } from '../../Manger/PioneerMgr';
import TalkMgr from '../../Manger/TalkMgr';
import TaskMgr from '../../Manger/TaskMgr';
import UserInfoMgr, { UserInfoEvent, FinishedEvent } from '../../Manger/UserInfoMgr';
import { TilePos } from '../TiledMap/TileTool';
import { BuildingFactionType, MapResourceBuildingModel } from './Model/MapBuildingModel';
import MapPioneerModel, { MapPioneerType, MapNpcPioneerModel, MapPioneerMoveDirection, MapPioneerActionType, MapPioneerLogicModel, MapPioneerLogicType, MapPioneerAttributesChangeModel } from './Model/MapPioneerModel';
import { OuterFightView } from './View/OuterFightView';
import { OuterOtherPioneerView } from './View/OuterOtherPioneerView';
import { MapItemMonster } from './View/MapItemMonster';
import { MapPioneer } from './View/MapPioneer';
import { MapBG } from '../../Scene/MapBG';
import LvlupMgr from '../../Manger/LvlupMgr';
import { OuterMapCursorView } from './View/OuterMapCursorView';
import { EventName, ResourceCorrespondingItem } from '../../Const/ConstDefine';
import ItemMgr from '../../Manger/ItemMgr';
import ItemData, { ItemType } from '../../Model/ItemData';
import ItemConfigDropTool from '../../Tool/ItemConfigDropTool';
import ArtifactMgr from '../../Manger/ArtifactMgr';
import { ArtifactEffectType } from '../../Model/ArtifactData';
import SettlementMgr from '../../Manger/SettlementMgr';
import LanMgr from '../../Manger/LanMgr';


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
            const pioneer: MapPioneerModel = PioneerMgr.instance.getPioneerById(movingPioneerId);
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
        PioneerMgr.instance.addObserver(this);
        UserInfoMgr.Instance.addObserver(this);

        this._pioneerMap = new Map();

        EventMgr.on(EventName.LOADING_FINISH, this.onLocalDataLoadOver, this);
        EventMgr.on(EventName.ROOKIE_GUIDE_BEGIN_EYES, this.onRookieGuideBeginEyes, this);
        EventMgr.on(EventName.ROOKIE_GUIDE_THIRD_EYES, this.onRookieGuideThirdEyes, this);
    }

    start() {

        this._started = true;
        this._startAction();
    }

    protected onDestroy(): void {
        PioneerMgr.instance.removeObserver(this);
        UserInfoMgr.Instance.removeObserver(this);
    }

    private _cameraBeginOrthoHeight: number = 0;
    private _startAction() {
        if (this._started && this._dataLoaded) {
            this._refreshUI();
            // recover, set, task, getTaskDialogShow, etc
            PioneerMgr.instance.recoverLocalState();
            // checkRookie
            this._cameraBeginOrthoHeight = GameMain.inst.MainCamera.orthoHeight;
            if (!UserInfoMgr.Instance.isFinishRookie) {
                const actionPioneer = PioneerMgr.instance.getCurrentPlayerPioneer();
                if (actionPioneer != null) {
                    const currentWorldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(actionPioneer.stayPos.x, actionPioneer.stayPos.y);
                    GameMain.inst.MainCamera.node.worldPosition = currentWorldPos;
                    this.scheduleOnce(() => {
                        GameMain.inst.outSceneMap.mapBG.shadowErase(actionPioneer.stayPos);
                    }, 0.2);
                    GameMain.inst.MainCamera.orthoHeight = 0.5 * this._cameraBeginOrthoHeight;
                    actionPioneer.actionType = MapPioneerActionType.dead;
                    if (this._pioneerMap.has(actionPioneer.id)) {
                        this._pioneerMap.get(actionPioneer.id).getComponent(MapPioneer).refreshUI(actionPioneer);
                    }
                }

                // const prophetess = PioneerMgr.instance.getPioneerByName("prophetess");
                // if (actionPioneer != null && prophetess != null) {
                //     const paths = GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(actionPioneer.stayPos, prophetess.stayPos);
                //     actionPioneer.purchaseMovingPioneerId = prophetess.id;
                //     PioneerMgr.instance.pioneerBeginMove(actionPioneer.id, paths);
                // }
            }
        }
    }

    private _refreshUI() {
        const decorationView = this.node.getComponent(MapBG).mapDecorationView();
        if (decorationView == null) {
            return;
        }
        const allPioneers = PioneerMgr.instance.getAllPioneer();
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

                    } else if (pioneer.type == MapPioneerType.npc) {
                        const npcModel = pioneer as MapNpcPioneerModel;
                        const task = TaskMgr.Instance.getTaskByNpcId(pioneer.id, npcModel.friendly, npcModel.hideTaskIds, UserInfoMgr.Instance.currentTaskIds, UserInfoMgr.Instance.finishedEvents);
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
                        temple.getComponent(MapItemMonster).refreshUI(pioneer, UserInfoMgr.Instance.finishedEvents);
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
            PioneerMgr.instance.pioneerDidMoveOneStep(pioneer.id);
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
                    pioneermap.getComponent(MapItemMonster).refreshUI(pioneer, UserInfoMgr.Instance.finishedEvents);
                }
            }
        }
    }

    async update(deltaTime: number) {
        // default speed
        let defaultSpeed = 130;
        const allPioneers = PioneerMgr.instance.getAllPioneer();

        // artifact effect
        let artifactSpeed = 0;
        const artifactEff = ArtifactMgr.Instance.getPropEffValue();
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

    private onRookieGuideBeginEyes(data: { node: Node }) {
        const actionPioneer = PioneerMgr.instance.getCurrentPlayerPioneer();
        if (actionPioneer != null) {
            actionPioneer.actionType = MapPioneerActionType.wakeup;
            let view: MapPioneer = null;
            if (this._pioneerMap.has(actionPioneer.id)) {
                view = this._pioneerMap.get(actionPioneer.id).getComponent(MapPioneer);
            }
            view.refreshUI(actionPioneer);
            this.scheduleOnce(() => {
                actionPioneer.actionType = MapPioneerActionType.idle;
                view.refreshUI(actionPioneer);
                GameMain.inst.UI.dialogueUI.dialogShow(TalkMgr.Instance.getTalk("talk14"), null, () => {
                    UserInfoMgr.Instance.isFinishRookie = true;
                    data.node.active = false;
                });
                GameMain.inst.UI.dialogueUI.show(true);
            }, 10);
        }
    }
    private onRookieGuideThirdEyes() {
        tween(GameMain.inst.MainCamera)
            .to(0.5, { orthoHeight: this._cameraBeginOrthoHeight })
            .start();
    }

    private _refreshFightView(fightId: string, attacker: { name: string; hp: number; hpMax: number; }, defender: { name: string; hp: number; hpMax: number; }, attackerIsSelf: boolean, fightPositons: Vec2[]) {
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
            const pioeer = PioneerMgr.instance.getPioneerById(pioneerId);
            if (pioeer != null) {
                GameMain.inst.UI.serectGuardGettedUI.dialogShow(pioeer.name);
                GameMain.inst.UI.serectGuardGettedUI.show(true);
            }
        }
        this._refreshUI();
    }
    pioneerDidHide(pioneerId: string): void {
        UserInfoMgr.Instance.hidePioneerCheckTaskFail(pioneerId);
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
    showGetTaskDialog(task: any): void {
        const talk = TalkMgr.Instance.getTalk(task.entrypoint.talk);
        GameMain.inst.UI.dialogueUI.dialogShow(talk, task);
        GameMain.inst.UI.dialogueUI.show(true);
    }

    beginFight(fightId: string, attacker: { name: string; hp: number; hpMax: number; }, defender: { name: string; hp: number; hpMax: number; }, attackerIsSelf: boolean, fightPositons: Vec2[]): void {
        this._refreshFightView(fightId, attacker, defender, attackerIsSelf, fightPositons);
    }

    fightDidAttack(fightId: string, attacker: { name: string; hp: number; hpMax: number; }, defender: { name: string; hp: number; hpMax: number; }, attackerIsSelf: boolean, fightPositons: Vec2[]): void {
        this._refreshFightView(fightId, attacker, defender, attackerIsSelf, fightPositons);
    }

    endFight(fightId: string, isEventFight: boolean, isDeadPionner: boolean, deadId: string): void {
        //fightview destroy
        if (this._fightViewMap.has(fightId)) {
            this._fightViewMap.get(fightId).node.destroy();
            this._fightViewMap.delete(fightId);
        }
        
        if (isEventFight) {
            return;
        }
        // find task to finish
        if (isDeadPionner) {
            SettlementMgr.instance.insertSettlement({
                level: UserInfoMgr.Instance.level,
                newPioneerIds: [],
                killEnemies: 1,
                gainResources: 0,
                exploredEvents: 0,
            });
            UserInfoMgr.Instance.checkCanFinishedTask("killpioneer", deadId);
            const deadPioneer = PioneerMgr.instance.getPioneerById(deadId);
            if (deadPioneer != null && !deadPioneer.friendly) {
                UserInfoMgr.Instance.explorationValue += deadPioneer.winprogress;
                if (deadPioneer.drop != null) {
                    ItemConfigDropTool.getItemByConfig(deadPioneer.drop);
                }
            }

        } else {
            //building
            UserInfoMgr.Instance.checkCanFinishedTask("destroybuilding", deadId);

            const deadBuilding = BuildingMgr.instance.getBuildingById(deadId);
            if (deadBuilding != null && deadBuilding.faction == BuildingFactionType.enemy) {
                UserInfoMgr.Instance.explorationValue += deadBuilding.winprogress;
            }
        }
    }
    exploredPioneer(pioneerId: string): void {
        const pioneer = PioneerMgr.instance.getPioneerById(pioneerId);
        if (pioneer != null && pioneer.type == MapPioneerType.gangster) {
            ItemMgr.Instance.addItem([new ItemData(ResourceCorrespondingItem.Troop, pioneer.hpMax)]);
        }
        UserInfoMgr.Instance.checkCanFinishedTask("explorewithpioneer", pioneerId);
    }
    exploredBuilding(buildingId: string): void {
        UserInfoMgr.Instance.checkCanFinishedTask("explorewithbuilding", buildingId);
        const building = BuildingMgr.instance.getBuildingById(buildingId);
        if (building != null) {
            if (building.progress > 0) UserInfoMgr.Instance.explorationValue += building.progress;
            if (building.exp > 0) UserInfoMgr.Instance.exp += building.exp;
        }
    }
    miningBuilding(actionPioneerId: string, buildingId: string): void {
        UserInfoMgr.Instance.checkCanFinishedTask("getresourcereached", buildingId);
        const building = BuildingMgr.instance.getBuildingById(buildingId);
        if (building != null && building instanceof MapResourceBuildingModel) {
            if (building.resources != null && building.resources.length > 0) {
                let isPlayer: boolean = false;
                for (const temple of PioneerMgr.instance.getPlayerPioneer()) {
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
                    const resultNum: number = Math.floor(resource.num * (1 + LvlupMgr.Instance.getTotalExtraRateByLvl(UserInfoMgr.Instance.level)));
                    actionView.getComponent(MapPioneer).playGetResourceAnim(resource.id, resultNum, () => {
                        ItemMgr.Instance.addItem([new ItemData(resource.id, resultNum)]);
                    });
                    SettlementMgr.instance.insertSettlement({
                        level: UserInfoMgr.Instance.level,
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
            if (building.progress > 0) UserInfoMgr.Instance.explorationValue += building.progress;
            if (building.exp > 0) UserInfoMgr.Instance.exp += building.exp;
        }
    }
    eventBuilding(actionPioneerId: string, buildingId: string, eventId: string): void {
        BranchEventMgr.Instance.latestActiveEventState = {
            pioneerId: actionPioneerId,
            buildingId: buildingId,
            eventId: eventId,
            prevEventId: null,
        }

        const event = BranchEventMgr.Instance.getEventById(eventId);
        if (event.length > 0) {
            GameMain.inst.UI.eventUI.eventUIShow(actionPioneerId, buildingId, event[0], (attackerPioneerId: string, enemyPioneerId: string, temporaryAttributes: Map<string, MapPioneerAttributesChangeModel>, fightOver: (succeed: boolean) => void) => {
                PioneerMgr.instance.eventFight(attackerPioneerId, enemyPioneerId, temporaryAttributes, fightOver);
            }, (nextEvent: any) => {
                PioneerMgr.instance.pioneerDealWithEvent(actionPioneerId, buildingId, nextEvent);
            });
            GameMain.inst.UI.eventUI.show(true);
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
                PioneerMgr.instance.pioneerBeginMove(pioneer.id, GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(pioneer.stayPos, v2(targetTiledPos.x, targetTiledPos.y)));
            }
        } else if (logic.type == MapPioneerLogicType.commonmove) {
            targetMapPos = logic.targetPos;
            PioneerMgr.instance.pioneerBeginMove(pioneer.id, [logic.commonMoveTilePos]);
        }
    }
    pioneerLogicMovePathPrepared(pioneer: MapPioneerModel) {
        if (this._actionShowPioneerId == pioneer.id) {
            if (this._actionPioneerFootStepViews != null) {
                for (const view of this._actionPioneerFootStepViews) {
                    view.destroy();
                }
                this._actionPioneerFootStepViews = null;
            }
            const path = [];
            for (const logic of pioneer.logics) {
                if (logic.type == MapPioneerLogicType.commonmove) {
                    path.push(logic.commonMoveTilePos);
                }
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
    }

    //---------------------------------------------
    //UserInfoEvent
    playerNameChanged(value: string): void {

    }
    getNewTask(task: string): void {
        PioneerMgr.instance.clearNpcTask(task);
    }
    finishEvent(event: FinishedEvent): void {
        this._refreshUI();
    }
    triggerTaskStepAction(action: string, delayTime: number): void {
        const temp = action.split("|");
        if (temp[0] == "pioneershow" ||
            temp[0] == "pioneerhide" ||
            temp[0] == "pioneernonfriendly" ||
            temp[0] == "pioneerfriendly" ||
            temp[0] == "fightwithpioneer" ||
            temp[0] == "maincityfightwithpioneer" ||
            temp[0] == "getnewplayer") {
            PioneerMgr.instance.dealWithTaskAction(action, delayTime);

        } else if (temp[0] == "talk") {
            const talk = TalkMgr.Instance.getTalk(temp[1]);
            GameMain.inst.UI.dialogueUI.dialogShow(talk, null);
            GameMain.inst.UI.dialogueUI.show(true);
        }
    }
    taskProgressChanged(taskId: string): void {
        GameMain.inst.UI.taskListUI.refreshUI();
    }
    taskFailed(taskId: string): void {
        GameMain.inst.UI.taskListUI.refreshUI();
    }

    getProp(propId: string, num: number): void {

    }

    gameTaskOver(): void {

        // useLanMgr
        GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("200001"));
        // GameMain.inst.UI.ShowTip("Boot ends");

    }
    generateTroopTimeCountChanged(leftTime: number): void {

    }
}