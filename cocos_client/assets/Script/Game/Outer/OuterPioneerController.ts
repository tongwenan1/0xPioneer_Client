import { _decorator, Component, instantiate, math, misc, Node, pingPong, Prefab, Quat, quat, sp, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { EventName } from '../../Basic/ConstDefine';
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
import MapPioneerModel, { MapPioneerType, MapNpcPioneerModel, MapPioneerMoveDirection, MapPioneerActionType, MapPioneerLogicModel, MapPioneerLogicType } from './Model/MapPioneerModel';
import { OuterFightView } from './View/OuterFightView';
import { OuterOtherPioneerView } from './View/OuterOtherPioneerView';
import { MapItemMonster } from './View/MapItemMonster';
import { MapPioneer } from './View/MapPioneer';


const { ccclass, property } = _decorator;

@ccclass('OuterPioneerController') 
export class OuterPioneerController extends Component implements PioneerMgrEvent, UserInfoEvent {
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

    private _pioneerMap: Map<string, Node> = new Map();
    private _movingPioneerIds: string[] = [];
    private _fightViewMap: Map<string, OuterFightView> = new Map();
    private _footPathMap: Map<string, Node[]> = new Map();

    private _started: boolean = false;
    private _dataLoaded: boolean = false;
    protected onLoad(): void {
        PioneerMgr.instance.addObserver(this);
        UserInfoMgr.Instance.addObserver(this);

        this._pioneerMap = new Map();

        EventMgr.on("Event_LoadOver", this.onLocalDataLoadOver, this);
    }

    start() {

        this._started = true;
        this._startAction();
    }

    protected onDestroy(): void {
        PioneerMgr.instance.removeObserver(this);
        UserInfoMgr.Instance.removeObserver(this);
    }

    private _startAction() {
        if (this._started && this._dataLoaded) {
            this._refreshUI();
            // recover, set, task, getTaskDialogShow, etc
            PioneerMgr.instance.recoverLocalState();
            // checkRookie
            if (!UserInfoMgr.Instance.isFinishRookie) {
                const actionPioneer = PioneerMgr.instance.getCurrentPlayerPioneer();
                const prophetess = PioneerMgr.instance.getPioneerByName("prophetess");
                if (actionPioneer != null && prophetess != null) {
                    const paths = GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(actionPioneer.stayPos, prophetess.stayPos);
                    actionPioneer.purchaseMovingPioneerId = prophetess.id;
                    PioneerMgr.instance.pioneerBeginMove(actionPioneer.id, paths, true);
                }
            }
        }
    }

    private _refreshUI() {
        const allPioneers = PioneerMgr.instance.getAllPioneer();
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
                    temple.setParent(this.node);
                    firstInit = true;
                    this._pioneerMap.set(pioneer.id, temple);
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
        const defaultSpeed = 500;
        const allPioneers = PioneerMgr.instance.getAllPioneer();
        for (var i = 0; i < allPioneers.length; i++) {
            let pioneer = allPioneers[i];
            let usedSpeed = defaultSpeed;
            for (const logic of pioneer.logics) {
                if (logic.moveSpeed > 0) {
                    usedSpeed = logic.moveSpeed;
                }                
            }
            if (this._movingPioneerIds.indexOf(pioneer.id) != -1 && this._pioneerMap.has(pioneer.id)) {
                let pioneermap = this._pioneerMap.get(pioneer.id);
                this.updateMoveStep(usedSpeed, deltaTime, pioneer, pioneermap);
            }
        }

        // sort by y 
        let pary = [];
        this._pioneerMap.forEach((pnode) => {
            pnode.setParent(null);
            pary.push(pnode);
        })

        pary.sort((a: Node, b: Node) => {
            return b.position.y - a.position.y;
        })

        for (let i = 0; i < pary.length; ++i) {
            pary[i].setParent(this.node);

            // TO DO : ?? MapPioneer.update not called ??
            // manual call
            pary[i].getComponent(MapPioneer)?.doUpdate(deltaTime);
        }
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

    private onLocalDataLoadOver() {
        this._dataLoaded = true;
        this._startAction();
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

    pioneerDidGainHpMax(pioneerId: string, value: number): void {
        this._refreshUI();
        
    }
    pioneerDidGainAttack(pioneerId: string, value: number): void {
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
            UserInfoMgr.Instance.checkCanFinishedTask("killpioneer", deadId);
            const deadPioneer = PioneerMgr.instance.getPioneerById(deadId);
            if (deadPioneer != null && !deadPioneer.friendly) {
                UserInfoMgr.Instance.explorationValue += deadPioneer.winprogress;
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
            UserInfoMgr.Instance.troop += pioneer.hpMax;
        }
        UserInfoMgr.Instance.checkCanFinishedTask("explorewithpioneer", pioneerId);
    }
    exploredBuilding(buildingId: string): void {
        UserInfoMgr.Instance.checkCanFinishedTask("explorewithbuilding", buildingId);
        const building = BuildingMgr.instance.getBuildingById(buildingId);
        if (building != null && building.progress > 0) {
            UserInfoMgr.Instance.explorationValue += building.progress;
        }
    }
    miningBuilding(actionPioneerId: string, buildingId: string): void {
        UserInfoMgr.Instance.checkCanFinishedTask("getresourcereached", buildingId);
        const building = BuildingMgr.instance.getBuildingById(buildingId);
        if (building != null && building.progress > 0) {
            UserInfoMgr.Instance.explorationValue += building.progress;
        }
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
                    actionView.getComponent(MapPioneer).playGetResourceAnim(resource.id, resource.num, () => {
                        if (resource.id == "resource_01") {
                            UserInfoMgr.Instance.wood += resource.num;
                        } else if (resource.id == "resource_02") {
                            UserInfoMgr.Instance.stone += resource.num;
                        } else if (resource.id == "resource_03") {
                            UserInfoMgr.Instance.food += resource.num;
                        } else if (resource.id == "resource_04") {
                            UserInfoMgr.Instance.troop += resource.num;
                        }
                    });
                }
            }
        }
    }
    eventBuilding(actionPioneerId: string, buildingId: string, eventId: string): void {
        const event = BranchEventMgr.Instance.getEventById(eventId);
        if (event.length > 0) {
            GameMain.inst.UI.eventUI.eventUIShow(actionPioneerId, event[0], (attackerPioneerId: string, enemyPioneerId: string, temporaryAttributes: Map<string, number>, fightOver: (succeed: boolean) => void)=> {
                PioneerMgr.instance.eventFight(attackerPioneerId, enemyPioneerId, temporaryAttributes, fightOver);
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
                targetMapPos = v2(targetTiledPos.x, targetTiledPos.y);
            }
        } else if (logic.type == MapPioneerLogicType.targetmove) {
            targetMapPos = logic.targetPos;
        } else if (logic.type == MapPioneerLogicType.patrol) {
            targetMapPos = logic.patrolTargetPos;
        }
        if (targetMapPos != null) {
            PioneerMgr.instance.pioneerBeginMove(pioneer.id, GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(pioneer.stayPos, targetMapPos));
        }
    }
    pioneerShowCount(pioneerId: string, count: number): void {

    }

    playerPioneerShowMovePath(pioneerId: string, path: TilePos[]): void {
        const footViews = [];
        for (let i = 0; i < path.length; i++) {
            if (i == path.length - 1) {

            } else {
                const currentPath = path[i];
                const nextPath = path[i + 1];
                const footView = instantiate(this.footPathPrefab);
                footView.setParent(this.node);
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
        GameMain.inst.UI.ShowTip("Boot ends");
    }
    generateTroopTimeCountChanged(leftTime: number): void {
        
    }
}


