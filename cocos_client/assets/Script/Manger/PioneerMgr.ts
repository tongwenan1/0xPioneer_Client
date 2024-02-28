import { Details, Vec2, builtinResMgr, log, math, nextPow2, pingPong, resources, v2, v3 } from "cc";
import UserInfo from "./UserInfoMgr";
import CommonTools from "../Tool/CommonTools";
import { GameMain } from "../GameMain";
import { TilePos } from "../Game/TiledMap/TileTool";
import MapBuildingModel, { BuildingFactionType, MapBuildingType, MapMainCityBuildingModel } from "../Game/Outer/Model/MapBuildingModel";
import MapPioneerModel, { MapPioneerActionType, MapPioneerLogicModel, MapPlayerPioneerModel, MapPioneerType, MapNpcPioneerModel, MapPioneerLogicType } from "../Game/Outer/Model/MapPioneerModel";
import BuildingMgr from "./BuildingMgr";

export interface PioneerMgrEvent {
    pioneerActionTypeChanged(pioneerId: string, actionType: MapPioneerActionType, actionEndTimeStamp: number): void;

    pioneerDidGainHpMax(pioneerId: string, value: number): void;
    pioneerDidGainAttack(pioneerId: string, value: number): void;
    pioneerLoseHp(pioneerId: string, value: number): void;
    pionerrRebirthCount(pioneerId: string, count: number): void;
    pioneerRebirth(pioneerId: string): void;

    pioneerDidShow(pioneerId: string): void;
    pioneerDidHide(pioneerId: string): void;

    pioneerDidNonFriendly(pioneerId: string): void;
    pioneerDidFriendly(pioneerId: string): void;

    addNewOnePioneer(newPioneer: MapPioneerModel): void;
    destroyOnePioneer(pioneerId: string): void;

    pioneerTaskBeenGetted(pioneerId: string, taskId: string): void;
    showGetTaskDialog(task: any): void;

    beginFight(fightId: string, attacker: { name: string, hp: number, hpMax: number }, defender: { name: string, hp: number, hpMax: number }, attackerIsSelf: boolean, fightPositions: Vec2[]): void;
    fightDidAttack(fightId: string, attacker: { name: string, hp: number, hpMax: number }, defender: { name: string, hp: number, hpMax: number }, attackerIsSelf: boolean, fightPositions: Vec2[]): void;
    endFight(fightId: string, isEventFightOver: boolean, isDeadPionner: boolean, deadId: string): void;

    exploredPioneer(pioneerId: string): void;
    exploredBuilding(buildingId: string): void;
    miningBuilding(actionPioneerId: string, buildingId: string): void;
    eventBuilding(actionPioneerId: string, buildingId: string, eventId: string): void;

    pioneerTaskHideTimeCountChanged(pioneerId: string, timeCount: number): void;
    pioneerTaskCdTimeCountChanged(pioneerId: string, timeCount: number): void;
    pioneerLogicMoveTimeCountChanged(pioneer: MapPioneerModel): void;
    pioneerLogicMove(pioneer: MapPioneerModel, logic: MapPioneerLogicModel): void;

    pioneerShowCount(pioneerId: string, count: number): void;

    playerPioneerShowMovePath(pioneerId: string, path: TilePos[]): void;

    playerPioneerDidMoveOneStep?(pioneerId: string): void;
}

export default class PioneerMgr {

    public static get instance() {
        if (!this._instance) {
            this._instance = new PioneerMgr();
        }
        return this._instance;
    }

    public async initData() {
        await this._initData();
    }

    public pioneerIsForceMoving(pioneerId: string): boolean {
        return this._pioneerIsForceMovingMap.get(pioneerId) || false;
    }

    public addObserver(observer: PioneerMgrEvent) {
        this._observers.push(observer);
    }
    public removeObserver(observer: PioneerMgrEvent) {
        const index: number = this._observers.indexOf(observer);
        if (index != -1) {
            this._observers.splice(index, 1);
        }
    }

    public getAllPioneer() {
        return this._pioneers;
    }
    public getPlayerPioneer(): MapPlayerPioneerModel[] {
        return this._pioneers.filter((pioneer) => {
            if (pioneer.type === MapPioneerType.player) {
                return true;
            } else {
                return false;
            }
        }) as MapPlayerPioneerModel[];
    }
    public getPlayerPioneerByMapPos(pos: Vec2) {
        return this._pioneers.filter((pioneer) => {
            if (pioneer.type === MapPioneerType.player &&
                pioneer.show &&
                pioneer.stayPos.x == pos.x &&
                pioneer.stayPos.y == pos.y) {
                return true;
            }
            return false;
        });
    }
    public getSelfPioneer(): MapPioneerModel[] {
        return this._pioneers.filter(pioneer => (pioneer.type === MapPioneerType.player && pioneer.id === "pioneer_0"));
    }
    public getCurrentPlayerPioneer(): MapPlayerPioneerModel | null {
        const findPioneer = this._pioneers.filter(pioneer => (pioneer.type === MapPioneerType.player && pioneer.id === this._currentActionPioneerId));
        if (findPioneer.length > 0) {
            return findPioneer[0] as MapPlayerPioneerModel;
        }
        return null;
    }
    public getPioneerById(id: string): MapPioneerModel | null {
        const findPioneer = this._pioneers.filter(pioneer => pioneer.id === id);
        if (findPioneer.length > 0) {
            return findPioneer[0];
        }
        return null;
    }
    public getPioneerByName(name: string): MapPioneerModel | null {
        const findPioneer = this._pioneers.filter(pioneer => pioneer.name === name);
        if (findPioneer.length > 0) {
            return findPioneer[0];
        }
        return null;
    }
    public currentActionPioneerIsBusy(): boolean {
        let busy: boolean = false;
        const findPioneer = this._pioneers.filter(pioneer => pioneer.id === this._currentActionPioneerId);
        if (findPioneer.length > 0) {
            busy = (findPioneer[0].actionType != MapPioneerActionType.idle && findPioneer[0].actionType != MapPioneerActionType.defend);
        }
        return busy;
    }
    /**
     * find pioneers on pos
     * @param tiledPosX 
     * @param tiledPosY 
     * @returns one pos not only one pioneer
     */
    public getShowPioneersByMapPos(pos: Vec2): MapPioneerModel[] {
        return this._pioneers.filter((pioneer: MapPioneerModel) => {
            if (pioneer.show &&
                pioneer.stayPos.x === pos.x &&
                pioneer.stayPos.y === pos.y) {
                return true;
            }
            return false;
        });
    }
    public getShowPioneersNearMapPos(pos: Vec2, range: number): MapPioneerModel[] {
        return this._pioneers.filter((pioneer: MapPioneerModel) => {
            if (pioneer.show &&
                Math.abs(pioneer.stayPos.x - pos.x) < range &&
                Math.abs(pioneer.stayPos.y - pos.y) < range) {
                return true;
            }
            return false;
        });
    }
    public pioneerChangeHpMax(pioneerId: string, value: number) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            if (findPioneer.hp > 0) {
                // alive
                findPioneer.changeHpMax(value);
                this._savePioneerData();
                for (const observer of this._observers) {
                    observer.pioneerDidGainHpMax(pioneerId, value);
                }
            }
        }
    }
    public addNewOne() {
        const id: string = "pioneer_" + Math.floor(10000000 + Math.random() * 90000000);
        const newPioneer = new MapPioneerModel(
            true,
            0,
            id,
            true,
            MapPioneerType.player,
            id,
            100,
            100,
            50,
            v2(37, 32)
        );
        this._pioneers.push(newPioneer);
        for (const observer of this._observers) {
            observer.addNewOnePioneer(newPioneer);
        }
        this._savePioneerData();
    }
    public destroyOne(pioneerId: string) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            const index: number = this._pioneers.indexOf(findPioneer);
            if (index != -1) {
                this._pioneers.splice(index, 1);
            }
            for (const observer of this._observers) {
                observer.destroyOnePioneer(findPioneer.id);
            }
            this._savePioneerData();
            if (this._currentActionPioneerId == pioneerId) {
                this._currentActionPioneerId = this._originalActionPioneerId;
            }
        }
    }
    public changeCurrentActionPioneer(pioneerId: string) {
        this._currentActionPioneerId = pioneerId;
    }


    public pioneerBeginMove(pioneerId: string, paths: TilePos[], force: boolean = false) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            findPioneer.actionType = MapPioneerActionType.moving;
            findPioneer.movePaths = paths;
            if (findPioneer.purchaseMovingPioneerId != null) {
                findPioneer.movePaths.pop();

            } else if (findPioneer.purchaseMovingBuildingId != null) {
                const findBuilding = BuildingMgr.instance.getBuildingById(findPioneer.purchaseMovingBuildingId);
                if (findBuilding != null) {
                    const templeStayPositions = findBuilding.stayMapPositions.slice();
                    for (let i = findPioneer.movePaths.length - 1; i >= 0; i--) {
                        let isExit: boolean = false;
                        for (let j = 0; j < templeStayPositions.length; j++) {
                            if (templeStayPositions[j].x == findPioneer.movePaths[i].x &&
                                templeStayPositions[j].y == findPioneer.movePaths[i].y) {
                                isExit = true;
                                templeStayPositions.splice(j, 1);
                                break;
                            }
                        }
                        if (isExit) {
                            findPioneer.movePaths.splice(i, 1);
                        }
                        if (templeStayPositions.length == 0) {
                            break;
                        }
                    }
                }
            }
            for (const observer of this._observers) {
                observer.pioneerActionTypeChanged(pioneerId, MapPioneerActionType.moving, 0);
            }
            if (force) {
                this._pioneerIsForceMovingMap.set(pioneerId, true);
            }
            let needFootPath: boolean = false;
            for (const temple of this.getPlayerPioneer()) {
                if (temple.id == pioneerId) {
                    needFootPath = true;
                    break;
                }
            }
            if (needFootPath) {
                for (const observe of this._observers) {
                    observe.playerPioneerShowMovePath(pioneerId, paths);
                }
            }
        }
    }
    public pioneerDidMoveOneStep(pioneerId: string) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            const allBuildings = BuildingMgr.instance.getAllBuilding();
            for (const building of allBuildings) {
                if (building.show &&
                    building.faction != BuildingFactionType.netural &&
                    building.defendPioneerIds.indexOf(pioneerId) != -1) {
                    BuildingMgr.instance.removeDefendPioneer(building.id, pioneerId);
                    break;
                }
            }

            if (findPioneer.movePaths.length > 0) {
                findPioneer.movePaths.splice(0, 1);
            }
            if (findPioneer.movePaths.length == 0) {
                //moveover savelocaldata
                findPioneer.actionType = MapPioneerActionType.idle;
                this._savePioneerData();
                this._pioneerActionTypeChangedByMeetTrigger(findPioneer);
                this._pioneerIsForceMovingMap.set(pioneerId, false);
            }

            if (findPioneer.type == MapPioneerType.player) {
                for (const observe of this._observers) {
                    if (observe.playerPioneerDidMoveOneStep != null) {
                        observe.playerPioneerDidMoveOneStep(pioneerId);
                    }
                }
            }
        }
    }
    public pioneerForceStopMove(pioneerId: string) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            if (findPioneer.actionType == MapPioneerActionType.moving) {
                // only moving can stop
                findPioneer.movePaths = [];
                this._savePioneerData();
                this._pioneerActionTypeChangedByMeetTrigger(findPioneer);
            }
        }
    }
    public hidePioneer(pioneerId: string) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            findPioneer.show = false;
            for (const observe of this._observers) {
                observe.pioneerDidHide(findPioneer.id);
            }
            this._savePioneerData();
        }
    }
    public showPioneer(pioneerId: string) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            findPioneer.show = true;
            for (const observe of this._observers) {
                observe.pioneerDidShow(findPioneer.id);
            }
            this._savePioneerData();
        }
    }

    public eventFight(attackerId: string, enemyId: string, temporaryAttributes: Map<string, number>, fightOverCallback: (succeed: boolean) => void) {
        const attacker = this.getPioneerById(attackerId);
        const enemy = this.getPioneerById(enemyId);
        if (attacker != null && enemy != null) {
            attacker.actionType = MapPioneerActionType.fighting;
            for (const observer of this._observers) {
                observer.pioneerActionTypeChanged(attacker.id, attacker.actionType, attacker.actionEndTimeStamp);
            }
            const fightId: string = new Date().getTime().toString();
            let attackerAttack = attacker.attack;

            let enemyName = enemy.name;
            let enemyHp = enemy.hp;
            let enemyHpMax = enemy.hpMax;
            let enemyAttack = enemy.attack;

            // gain temporaryAttributes
            temporaryAttributes.forEach((value: number, key: string) => {
                const id = key.split("|")[0];
                const type = parseInt(key.split("|")[1]);
                if (id == enemyId) {
                    if (type == 1) {
                        enemyHp += value;
                        enemyHpMax += value;
                    } else if (type == 2) {
                        enemyAttack += value;
                    }
                } else if (id == attackerId) {
                    if (type == 2) {
                        attackerAttack += value;
                    }
                }
            });
            for (const observer of this._observers) {
                observer.beginFight(
                    fightId,
                    { name: attacker.name, hp: attacker.hp, hpMax: attacker.hpMax },
                    { name: enemyName, hp: enemyHp, hpMax: enemyHpMax },
                    attacker.friendly,
                    [attacker.stayPos]
                );
            }
            let selfAttack: boolean = true;
            const intervalId = setInterval(() => {
                let fightOver: boolean = false;
                let deadPioneer = null;
                if (selfAttack) {
                    enemyHp = Math.max(0, enemyHp - attackerAttack);
                    if (enemyHp <= 0) {
                        fightOver = true;
                        deadPioneer = enemy;
                    }
                } else {
                    attacker.loseHp(enemyAttack);
                    for (const observe of this._observers) {
                        observe.pioneerLoseHp(attacker.id, enemyAttack);
                    }
                    if (attacker.hp <= 0) {
                        this.hidePioneer(attacker.id);
                        fightOver = true;
                        deadPioneer = attacker;
                    }
                }
                selfAttack = !selfAttack;
                if (fightOver) {
                    for (const observer of this._observers) {
                        observer.endFight(fightId, true, deadPioneer instanceof MapPioneerModel, deadPioneer.id);
                    }
                    // status changed
                    attacker.actionType = MapPioneerActionType.idle;
                    for (const observer of this._observers) {
                        observer.pioneerActionTypeChanged(attacker.id, attacker.actionType, attacker.actionEndTimeStamp);
                    }
                    clearInterval(intervalId);
                    this._savePioneerData();

                    if (deadPioneer instanceof MapPlayerPioneerModel) {
                        // player dead
                        deadPioneer.rebirthCountTime = 10;
                        this._savePioneerData();
                    }
                    if (fightOverCallback != null) {
                        fightOverCallback(enemyHp <= 0);
                    }
                } else {
                    for (const observer of this._observers) {
                        observer.fightDidAttack(
                            fightId,
                            { name: attacker.name, hp: attacker.hp, hpMax: attacker.hpMax },
                            { name: enemyName, hp: enemyHp, hpMax: enemyHpMax },
                            attacker.friendly,
                            [attacker.stayPos]
                        );
                    }
                }
            }, 250);
        }
    }

    //------------------------------------------------- 
    // task
    public clearNpcTask(task: any) {
        // npc getted task
        for (const pioneer of this._pioneers) {
            if (pioneer instanceof MapNpcPioneerModel) {
                const npc = pioneer as MapNpcPioneerModel;
                if (npc.taskObj != null &&
                    npc.taskObj.id === task.id) {
                    npc.taskObj = null;
                    for (const observe of this._observers) {
                        observe.pioneerTaskBeenGetted(npc.id, task.id);
                    }
                    this._savePioneerData();
                    break;
                }
            }
        }
    }
    public dealWithTaskAction(action: string, delayTime: number): void {
        const temple = action.split("|");

        const actionTargetPioneer = this.getPioneerById(temple[1]);
        if (actionTargetPioneer == null) {
            return;
        }
        switch (temple[0]) {
            case "pioneershow": {
                if (delayTime > 0) {
                    actionTargetPioneer.showCountTime = delayTime;
                    this._savePioneerData();
                } else {
                    if (actionTargetPioneer.id == "pioneer_3") {
                        let serectGuardShow: boolean = false;
                        for (const player of this.getPlayerPioneer()) {
                            if (player.id == "pioneer_1") {
                                serectGuardShow = player.show;
                                break;
                            }
                        }
                        actionTargetPioneer.show = !serectGuardShow;
                    } else {
                        actionTargetPioneer.show = true;
                    }
                    this._savePioneerData();
                    for (const observer of this._observers) {
                        observer.pioneerDidShow(actionTargetPioneer.id);
                    }
                }
            }
                break;

            case "pioneerhide": {
                this.hidePioneer(actionTargetPioneer.id);
            }
                break;

            case "pioneernonfriendly": {
                actionTargetPioneer.friendly = false;
                this._savePioneerData();
                for (const observer of this._observers) {
                    observer.pioneerDidNonFriendly(actionTargetPioneer.id);
                }
            }
                break;

            case "pioneerfriendly": {
                actionTargetPioneer.friendly = true;
                this._savePioneerData();
                for (const observer of this._observers) {
                    observer.pioneerDidFriendly(actionTargetPioneer.id);
                }
            }
                break;

            case "fightwithpioneer": {
                actionTargetPioneer.friendly = false;
                this._savePioneerData();
                this._pioneerActionTypeChangedByMeetTrigger(this.getCurrentPlayerPioneer());
            }
                break;

            case "maincityfightwithpioneer": {
                this._pioneerActionTypeChangedByMeetTrigger(actionTargetPioneer);
            }
                break;

            default:
                break;
        }
    }

    //------------------------------------------------- 
    // recover
    public recoverLocalState() {
        const currentActionPioneer = this.getPioneerById(this._currentActionPioneerId);
        for (const pioneer of this._pioneers) {
            if (pioneer.actionType == MapPioneerActionType.moving && pioneer.movePaths.length > 0) {
                for (const observer of this._observers) {
                    observer.pioneerActionTypeChanged(pioneer.id, MapPioneerActionType.moving, 0);
                }
            } else {
                // const currentTimeStamp = new Date().getTime();
                // if (pioneer.actionEndTimeStamp > currentTimeStamp) {
                //     setTimeout(() => {
                //         // over
                //         pioneer.actionType = MapPioneerActionType.idle;
                //         pioneer.actionEndTimeStamp = 0;
                //         this._savePioneerData();
                //         for (const observer of this._observers) {
                //             observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                //         }
                //     }, pioneer.actionEndTimeStamp - currentTimeStamp);
                // }
            }
        }
    }


    private _lastTimeStamp: number = null;
    public constructor() {
        setInterval(() => {
            const currentTimeStamp = new Date().getTime();
            if (this._lastTimeStamp == null) {
                this._lastTimeStamp = currentTimeStamp;
            }
            const deltaTime = currentTimeStamp - this._lastTimeStamp;
            let isOneSecond: boolean = false;
            if (deltaTime >= 1000) {
                isOneSecond = true;
                this._lastTimeStamp = currentTimeStamp;
            }
            for (const pioneer of this._pioneers) {
                if (pioneer.showCountTime > 0 && isOneSecond) {
                    pioneer.showCountTime -= 1;
                    for (const observe of this._observers) {
                        observe.pioneerShowCount(pioneer.id, pioneer.showCountTime);
                    }
                    this._savePioneerData();
                    if (pioneer.showCountTime == 0) {
                        this.showPioneer(pioneer.id);
                    }
                }
                if (pioneer.show) {
                    if (pioneer.actionType == MapPioneerActionType.idle) {
                        if (pioneer.logics.length > 0) {
                            const logic = pioneer.logics[0];
                            let canAction: boolean = false;
                            if (logic.condition != null) {
                                if (UserInfo.Instance.finishedEvents.indexOf(logic.condition) != -1) {
                                    canAction = true;
                                }
                            } else {
                                canAction = true;
                            }
                            if (canAction) {
                                //all move logic change to move one step by step
                                if (logic.type == MapPioneerLogicType.stepmove) {
                                    if ((logic.repeat > 0 || logic.repeat == -1) && isOneSecond) {
                                        if (logic.currentCd > 0) {
                                            //move cd count
                                            logic.currentCd -= 1;
                                        }
                                        for (const observe of this._observers) {
                                            observe.pioneerLogicMoveTimeCountChanged(pioneer);
                                        }
                                        console.log('exce logic' + JSON.stringify(logic));
                                        if (logic.currentCd == 0) {
                                            logic.currentCd = logic.cd;
                                            if (logic.repeat > 0) {
                                                logic.repeat -= 1;
                                            }
                                            for (const observe of this._observers) {
                                                observe.pioneerLogicMove(pioneer, logic);
                                            }
                                        }
                                        if (logic.repeat == 0) {
                                            pioneer.logics.splice(0, 1);
                                        }
                                    }

                                } else if (logic.type == MapPioneerLogicType.targetmove) {
                                    pioneer.logics.splice(0, 1);
                                    const movePaths: TilePos[] = GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(pioneer.stayPos, logic.targetPos);
                                    for (let i = movePaths.length - 1; i >= 0; i--) {
                                        const temleLogic = new MapPioneerLogicModel(MapPioneerLogicType.commonmove);
                                        temleLogic.commonMoveTilePos = movePaths[i];
                                        pioneer.logics.splice(0, 0, temleLogic);
                                    }

                                } else if (logic.type == MapPioneerLogicType.hide) {
                                    this.hidePioneer(pioneer.id);
                                    pioneer.logics.splice(0, 1);

                                } else if (logic.type == MapPioneerLogicType.patrol) {
                                    if (logic.repeat > 0 || logic.repeat == -1) {
                                        if (logic.currentCd == -1) {
                                            // randomNextPos
                                            let getNextPos: boolean = false;
                                            do {
                                                const xNegative: boolean = CommonTools.getRandomInt(0, 1) == 0;
                                                const xChangeNum: number = CommonTools.getRandomInt(0, logic.range);
                                                const yNegative: boolean = CommonTools.getRandomInt(0, 1) == 0;
                                                const yChangeNum: number = CommonTools.getRandomInt(0, logic.range);
                                                let nextPos = logic.originalPos.clone();
                                                if (xNegative) {
                                                    nextPos.x -= xChangeNum;
                                                } else {
                                                    nextPos.x += xChangeNum;
                                                }
                                                if (yNegative) {
                                                    nextPos.y -= yChangeNum;
                                                } else {
                                                    nextPos.y += yChangeNum;
                                                }
                                                logic.patrolTargetPos = nextPos;
                                                getNextPos = GameMain.inst.outSceneMap.mapBG.isBlock(nextPos);
                                            } while (getNextPos);
                                            logic.currentCd = 0;
                                            if (logic.interval.length == 2) {
                                                logic.currentCd = CommonTools.getRandomInt(logic.interval[0], logic.interval[1]);
                                            }
                                        }
                                        if (logic.currentCd > 0) {
                                            logic.currentCd -= 1;
                                        }
                                        for (const observe of this._observers) {
                                            observe.pioneerLogicMoveTimeCountChanged(pioneer);
                                        }
                                        if (logic.currentCd == 0) {
                                            logic.currentCd = -1;
                                            if (logic.repeat > 0) {
                                                logic.repeat -= 1;
                                            }
                                            if (logic.repeat == 0) {
                                                pioneer.logics.splice(0, 1);
                                            }
                                            const movePaths: TilePos[] = GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(pioneer.stayPos, logic.patrolTargetPos);
                                            for (let i = movePaths.length - 1; i >= 0; i--) {
                                                const temleLogic = new MapPioneerLogicModel(MapPioneerLogicType.commonmove);
                                                temleLogic.commonMoveTilePos = movePaths[i];
                                                pioneer.logics.splice(0, 0, temleLogic);
                                            }
                                        }
                                    }
                                } else if (logic.type == MapPioneerLogicType.commonmove) {
                                    for (const observe of this._observers) {
                                        observe.pioneerLogicMove(pioneer, logic);
                                    }
                                    pioneer.logics.splice(0, 1);
                                }
                                this._savePioneerData();
                            }
                        }
                    }

                    // task time count
                    if (pioneer instanceof MapNpcPioneerModel) {
                        const npc = pioneer as MapNpcPioneerModel;
                        if (isOneSecond) {
                            if (npc.taskHideTime > 0) {
                                npc.taskHideTime -= 1;
                                if (npc.taskHideTime == 0) {
                                    npc.hideTaskIds.push(npc.taskObj.id);
                                    npc.taskObj = null;
                                }
                                this._savePioneerData();
                                for (const observe of this._observers) {
                                    observe.pioneerTaskHideTimeCountChanged(npc.id, npc.taskHideTime);
                                }
                            }
                            if (npc.taskCdEndTime > 0) {
                                npc.taskCdEndTime -= 1;
                                this._savePioneerData();
                                for (const observe of this._observers) {
                                    observe.pioneerTaskCdTimeCountChanged(npc.id, npc.taskCdEndTime);
                                }
                            }
                        }
                    }

                } else {
                    if (pioneer instanceof MapPlayerPioneerModel) {
                        if (isOneSecond) {
                            if (pioneer.rebirthCountTime > 0) {
                                pioneer.rebirthCountTime -= 1;
                                for (const observe of this._observers) {
                                    observe.pionerrRebirthCount(pioneer.id, pioneer.rebirthCountTime);
                                }
                                if (pioneer.rebirthCountTime == 0) {
                                    let rebirthMapPos = null;
                                    const mainCity = BuildingMgr.instance.getBuildingById("building_1");
                                    if (mainCity != null && mainCity.faction != BuildingFactionType.enemy) {
                                        rebirthMapPos = mainCity.stayMapPositions[1];
                                    }
                                    let rebirthHp: number = Math.max(1, Math.min(UserInfo.Instance.troop, pioneer.hpMax));
                                    UserInfo.Instance.troop -= rebirthHp;
                                    pioneer.rebirth(rebirthHp, rebirthMapPos);
                                    for (const observe of this._observers) {
                                        observe.pioneerRebirth(pioneer.id);
                                    }
                                }
                                this._savePioneerData();
                            }
                        }
                    }
                }
            }
        }, 200);
    }

    private static _instance: PioneerMgr;

    private _localStorageKey: string = "local_pioneers";
    private _observers: PioneerMgrEvent[] = [];
    private _pioneers: MapPioneerModel[] = [];
    private _pioneerIsForceMovingMap: Map<string, boolean> = new Map();
    private _currentActionPioneerId: string = null;
    private _originalActionPioneerId: string = null;
    private async _initData() {
        this._pioneers = [];

        let resultData: any = null;
        const localPioneers = localStorage.getItem(this._localStorageKey);
        if (localPioneers == null) {
            resultData = await new Promise((resolve, reject) => {
                resources.load("data_local/map_pioneer", (err: Error, data: any) => {
                    if (err) {
                        resolve(null);
                        return;
                    }
                    resolve(data.json);
                });
            });
            if (resultData != null) {
                for (const temple of resultData) {
                    let pioneer: MapPioneerModel = null;
                    if (temple.type == MapPioneerType.npc) {
                        pioneer = new MapNpcPioneerModel(
                            temple.show,
                            0,
                            temple.id,
                            temple.friendly,
                            temple.type,
                            temple.name,
                            temple.hp,
                            temple.hp,
                            temple.attack,
                            v2(temple.pos.x, temple.pos.y)
                        );
                    } else if (temple.type == MapPioneerType.player) {
                        pioneer = new MapPlayerPioneerModel(
                            temple.show,
                            0,
                            temple.id,
                            temple.friendly,
                            temple.type,
                            temple.name,
                            temple.hp,
                            temple.hp,
                            temple.attack,
                            v2(temple.pos.x, temple.pos.y)
                        );
                    } else {
                        pioneer = new MapPioneerModel(
                            temple.show,
                            0,
                            temple.id,
                            temple.friendly,
                            temple.type,
                            temple.name,
                            temple.hp,
                            temple.hp,
                            temple.attack,
                            v2(temple.pos.x, temple.pos.y)
                        );
                    }
                    // logic
                    if (temple.logics != null) {
                        const logics = [];
                        for (const logic of temple.logics) {
                            const model = new MapPioneerLogicModel(logic.type);
                            let checkLogicUseful: boolean = true;
                            if (logic.type == MapPioneerLogicType.stepmove) {
                                model.setStepMoveData(logic.step, logic.cd, logic.cd, v3(logic.direction.x, logic.direction.y, logic.direction.z), logic.repeat);

                            } else if (logic.type == MapPioneerLogicType.targetmove) {
                                model.targetPos = v2(logic.pos.x, logic.pos.y);

                            } else if (logic.type == MapPioneerLogicType.patrol) {
                                model.setPatrolData(pioneer.stayPos, logic.interval, logic.range, logic.repeat, -1, null);
                            } else if (logic.type == MapPioneerLogicType.commonmove) {
                                checkLogicUseful = false;
                            }
                            model.condition = logic.cond;
                            model.moveSpeed = logic.speed;
                            if (checkLogicUseful) {
                                logics.push(model);
                            }
                        }
                        pioneer.logics = logics;
                    }
                    if (temple.winprogress != null) {
                        pioneer.winprogress = temple.winprogress;
                    }
                    if (temple.animType != null) {
                        pioneer.animType = temple.animType;
                    }
                    this._pioneers.push(pioneer);
                }
            }
        } else {
            resultData = JSON.parse(localPioneers);
            for (const temple of resultData) {
                let newModel: MapPioneerModel = null;
                if (temple._type == MapPioneerType.npc) {
                    newModel = new MapNpcPioneerModel(
                        temple._show,
                        temple._showCountTime,
                        temple._id,
                        temple._friendly,
                        temple._type,
                        temple._name,
                        temple._hpMax,
                        temple._hp,
                        temple._attack,
                        v2(temple._stayPos.x, temple._stayPos.y)
                    );
                    (newModel as MapNpcPioneerModel).taskObj = temple._taskObj;
                    (newModel as MapNpcPioneerModel).hideTaskIds = temple._hideTaskIds;
                    (newModel as MapNpcPioneerModel).taskHideTime = temple._taskHideTime;
                    (newModel as MapNpcPioneerModel).taskCdEndTime = temple._taskCdEndTime;
                } else if (temple._type == MapPioneerType.player) {
                    newModel = new MapPlayerPioneerModel(
                        temple._show,
                        temple._showCountTime,
                        temple._id,
                        temple._friendly,
                        temple._type,
                        temple._name,
                        temple._hpMax,
                        temple._hp,
                        temple._attack,
                        v2(temple._stayPos.x, temple._stayPos.y)
                    );
                    (newModel as MapPlayerPioneerModel).rebirthCountTime = temple._rebirthCountTime;
                } else {
                    newModel = new MapPioneerModel(
                        temple._show,
                        temple._showCountTime,
                        temple._id,
                        temple._friendly,
                        temple._type,
                        temple._name,
                        temple._hpMax,
                        temple._hp,
                        temple._attack,
                        v2(temple._stayPos.x, temple._stayPos.y)
                    );
                }
                if (temple._actionType == MapPioneerActionType.exploring ||
                    temple._actionType == MapPioneerActionType.mining) {
                    newModel.actionType = MapPioneerActionType.idle;
                } else {
                    newModel.actionType = temple._actionType;
                }
                // movepath
                const tempMovePath = [];
                for (const tempTiled of temple._movePaths) {
                    const tilePos = new TilePos();
                    tilePos.x = tempTiled.x;
                    tilePos.y = tempTiled.y;
                    tempMovePath.push(tilePos);
                }
                newModel.movePaths = tempMovePath;
                // logic
                const logics = [];
                for (const logic of temple._logics) {
                    const model = new MapPioneerLogicModel(logic._type);
                    let checkLogicUseful: boolean = true;
                    if (logic._type == MapPioneerLogicType.stepmove) {
                        model.setStepMoveData(logic._step, logic._cd, logic._currentCd, v3(logic._direction.x, logic._direction.y, logic._direction.z), logic._repeat);

                    } else if (logic._type == MapPioneerLogicType.targetmove) {
                        model.targetPos = v2(logic._targetPos.x, logic._targetPos.y);

                    } else if (logic._type == MapPioneerLogicType.patrol) {
                        model.setPatrolData(newModel.stayPos, logic._interval, logic._range, logic._repeat, logic._currentCd, logic._patrolTargetPos);
                    } else if (logic._type == MapPioneerLogicType.commonmove) {
                        checkLogicUseful = false;
                    }
                    model.condition = logic._condition;
                    model.moveSpeed = logic._moveSpeed;
                    if (checkLogicUseful) {
                        logics.push(model);
                    }
                }
                newModel.logics = logics;
                newModel.winprogress = temple._winprogress;
                newModel.animType = temple._animType;
                this._pioneers.push(newModel);
            }
        }
        // default player id is "0"
        this._currentActionPioneerId = "pioneer_0";
        this._originalActionPioneerId = "pioneer_0";
    }

    private _pioneerActionTypeChangedByMeetTrigger(pioneer: MapPioneerModel, isStay: boolean = true) {
        let stayBuilding: MapBuildingModel = null;
        if (pioneer.purchaseMovingBuildingId != null) {
            const templeBuildings = BuildingMgr.instance.getShowBuildingsNearMapPos(pioneer.stayPos, 2);
            if (templeBuildings.length > 0) {
                // use first find building
                stayBuilding = templeBuildings[0];
            }
            pioneer.purchaseMovingBuildingId = null;
        } else {
            stayBuilding = BuildingMgr.instance.getShowBuildingByMapPos(pioneer.stayPos);
        }
        const currentTimeStamp = new Date().getTime();
        if (stayBuilding == null) {
            let stayPioneers;
            if (pioneer.purchaseMovingPioneerId != null) {
                // if target pioneer is moving, than try get it from near position;
                stayPioneers = this.getShowPioneersNearMapPos(pioneer.stayPos, 2);
                pioneer.purchaseMovingPioneerId = null;
            } else {
                stayPioneers = this.getShowPioneersByMapPos(pioneer.stayPos);
            }
            let interactPioneer: MapPioneerModel = null;
            for (const stayPioneer of stayPioneers) {
                if (stayPioneer.id != pioneer.id) {
                    interactPioneer = stayPioneer;
                    break;
                }
            }
            if (interactPioneer != null) {
                if (pioneer.friendly && interactPioneer.friendly) {
                    if (interactPioneer.type == MapPioneerType.npc) {
                        // get task
                        pioneer.actionType = MapPioneerActionType.idle;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        for (const observe of this._observers) {
                            observe.exploredPioneer(interactPioneer.id);
                        }
                        this._savePioneerData();
                        if ((interactPioneer as MapNpcPioneerModel).taskObj != null &&
                            (interactPioneer as MapNpcPioneerModel).taskCdEndTime <= 0 &&
                            (interactPioneer as MapNpcPioneerModel).taskObj.entrypoint.talk != null) {
                            for (const observer of this._observers) {
                                observer.showGetTaskDialog((interactPioneer as MapNpcPioneerModel).taskObj);
                            }
                        }
                    } else if (interactPioneer.type == MapPioneerType.gangster) {
                        // get more hp
                        const acionTime: number = 3000;
                        pioneer.actionType = MapPioneerActionType.addingtroops;
                        pioneer.actionBeginTimeStamp = currentTimeStamp;
                        pioneer.actionEndTimeStamp = currentTimeStamp + acionTime;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        setTimeout(() => {

                            pioneer.actionType = MapPioneerActionType.idle;
                            pioneer.actionEndTimeStamp = 0;
                            for (const observer of this._observers) {
                                observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                            }
                            for (const observe of this._observers) {
                                observe.exploredPioneer(interactPioneer.id);
                            }
                            this._savePioneerData();
                        }, acionTime);

                    } else {
                        pioneer.actionType = MapPioneerActionType.idle;
                        pioneer.actionEndTimeStamp = 0;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        this._savePioneerData();
                    }
                } else if (!pioneer.friendly && !interactPioneer.friendly) {
                    if (isStay) {
                        pioneer.actionType = MapPioneerActionType.idle;
                        pioneer.actionEndTimeStamp = 0;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        this._savePioneerData();
                    }
                } else {
                    // nonfriendly, fight
                    this._fight(pioneer, interactPioneer);
                }
            } else {
                if (isStay) {
                    pioneer.actionType = MapPioneerActionType.idle;
                    pioneer.actionEndTimeStamp = 0;
                    for (const observer of this._observers) {
                        observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                    }
                    this._savePioneerData();
                }
            }
        } else {
            // building
            // need changed. use manger to deal with pioneer and building 
            if (stayBuilding.type == MapBuildingType.city) {
                if (
                    (pioneer.type == MapPioneerType.player && pioneer.friendly && stayBuilding.faction == BuildingFactionType.enemy) ||
                    (pioneer.id == "gangster_3" && !pioneer.friendly && stayBuilding.faction != BuildingFactionType.enemy)
                ) {
                    const cityBuilding = stayBuilding as MapMainCityBuildingModel;
                    if (cityBuilding.taskObj != null) {
                        pioneer.actionType = MapPioneerActionType.idle;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        this._savePioneerData();
                        if (cityBuilding.taskObj.entrypoint.talk != null &&
                            cityBuilding.taskObj.entrypoint.triggerpioneerId != null &&
                            cityBuilding.taskObj.entrypoint.triggerpioneerId == pioneer.id) {
                            if (pioneer.logics.length > 0) {
                                // clear logic
                                pioneer.logics = [];
                                this._savePioneerData();
                            }
                            for (const observer of this._observers) {
                                observer.showGetTaskDialog(cityBuilding.taskObj);
                            }
                            BuildingMgr.instance.buildingClearTask(cityBuilding.id);
                        }
                    } else {
                        this._fight(pioneer, stayBuilding);
                    }
                } else {
                    if (isStay) {
                        pioneer.actionType = MapPioneerActionType.idle;
                        pioneer.actionEndTimeStamp = 0;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        this._savePioneerData();
                    }
                }

            } else if (stayBuilding.type == MapBuildingType.explore) {
                if (pioneer.type == MapPioneerType.player && pioneer.friendly) {
                    const acionTime: number = 3000;
                    pioneer.actionType = MapPioneerActionType.exploring;
                    pioneer.actionEndTimeStamp = currentTimeStamp + acionTime;
                    pioneer.actionBeginTimeStamp = currentTimeStamp;
                    for (const observer of this._observers) {
                        observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                    }
                    setTimeout(() => {
                        pioneer.actionType = MapPioneerActionType.idle;
                        pioneer.actionEndTimeStamp = 0;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        for (const observe of this._observers) {
                            observe.exploredBuilding(stayBuilding.id);
                        }
                        this._savePioneerData();
                    }, acionTime);
                } else {
                    if (pioneer.name == "gangster_3") {
                        BuildingMgr.instance.hideBuilding(stayBuilding.id, pioneer.id);
                    }
                    if (isStay) {
                        pioneer.actionType = MapPioneerActionType.idle;
                        pioneer.actionEndTimeStamp = 0;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        this._savePioneerData();
                    }
                }

            } else if (stayBuilding.type == MapBuildingType.stronghold) {
                // 0-idle 1-fight 2-defend
                let tempAction: number = 0;
                if (pioneer.type == MapPioneerType.player && pioneer.friendly) {
                    if (stayBuilding.faction != BuildingFactionType.enemy) {
                        tempAction = 2;
                        BuildingMgr.instance.changeBuildingFaction(stayBuilding.id, BuildingFactionType.self);
                        BuildingMgr.instance.insertDefendPioneer(stayBuilding.id, pioneer.id);
                        for (const observe of this._observers) {
                            observe.exploredBuilding(stayBuilding.id);
                        }
                    } else {
                        tempAction = 1;
                    }
                } else {
                    if (pioneer.id == "gangster_3" && stayBuilding.id == "building_4") {
                        if (stayBuilding.faction != BuildingFactionType.self ||
                            stayBuilding.defendPioneerIds.length <= 0) {
                            tempAction = 0;
                            BuildingMgr.instance.hideBuilding(stayBuilding.id, pioneer.id);
                        } else {
                            pioneer.loseHp(Math.floor(pioneer.hp / 2));
                            pioneer.loseAttack(Math.floor(pioneer.attack / 2));
                            tempAction = 1;
                        }
                    } else {
                        tempAction = 0;
                    }
                }
                if (tempAction == 0) {
                    if (isStay) {
                        pioneer.actionType = MapPioneerActionType.idle;
                        pioneer.actionEndTimeStamp = 0;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        this._savePioneerData();
                    }

                } else if (tempAction == 1) {
                    this._fight(pioneer, stayBuilding);
                } else if (tempAction == 2) {
                    pioneer.actionType = MapPioneerActionType.defend;
                    for (const observer of this._observers) {
                        observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                    }
                    this._savePioneerData();
                }

            } else if (stayBuilding.type == MapBuildingType.resource) {
                if (pioneer.type == MapPioneerType.player && pioneer.friendly) {
                    const acionTime: number = 3000;
                    pioneer.actionType = MapPioneerActionType.mining;
                    pioneer.actionEndTimeStamp = currentTimeStamp + acionTime;
                    pioneer.actionBeginTimeStamp = currentTimeStamp;
                    for (const observer of this._observers) {
                        observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                    }
                    setTimeout(() => {
                        pioneer.actionType = MapPioneerActionType.idle;
                        pioneer.actionEndTimeStamp = 0;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        BuildingMgr.instance.resourceBuildingCollected(stayBuilding.id);
                        for (const observe of this._observers) {
                            observe.miningBuilding(pioneer.id, stayBuilding.id);
                        }
                        this._savePioneerData();
                    }, acionTime);
                } else {
                    if (isStay) {
                        pioneer.actionType = MapPioneerActionType.idle;
                        pioneer.actionEndTimeStamp = 0;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        this._savePioneerData();
                    }
                }
            } else if (stayBuilding.type == MapBuildingType.event) {
                if (pioneer.type == MapPioneerType.player) {
                    pioneer.actionType = MapPioneerActionType.idle;
                    pioneer.actionEndTimeStamp = 0;
                    for (const observer of this._observers) {
                        observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                    }
                    for (const observe of this._observers) {
                        observe.eventBuilding(pioneer.id, stayBuilding.id, stayBuilding.eventId);
                    }
                    this._savePioneerData();
                } else {
                    if (isStay) {
                        pioneer.actionType = MapPioneerActionType.idle;
                        pioneer.actionEndTimeStamp = 0;
                        for (const observer of this._observers) {
                            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                        }
                        this._savePioneerData();
                    }
                }
            }
        }
    }

    private _fight(attacker: MapPioneerModel, defender: MapPioneerModel | MapBuildingModel) {
        attacker.actionType = MapPioneerActionType.fighting;
        for (const observer of this._observers) {
            observer.pioneerActionTypeChanged(attacker.id, attacker.actionType, attacker.actionEndTimeStamp);
        }
        if (defender instanceof MapPioneerModel) {
            defender.actionType = MapPioneerActionType.fighting;
            for (const observer of this._observers) {
                observer.pioneerActionTypeChanged(defender.id, defender.actionType, defender.actionEndTimeStamp);
            }
        }

        const fightId: string = new Date().getTime().toString();
        // begin fight
        let defenderName: string = "";
        let defenderHp: number = 0;
        let defenderHpMax: number = 0;
        let defenderAttack: number = 0;
        let defenderCenterPositions: Vec2[] = [];
        if (defender instanceof MapPioneerModel) {
            defenderName = defender.name;
            defenderHp = defender.hp;
            defenderHpMax = defender.hpMax;
            defenderAttack = defender.attack;
            defenderCenterPositions = [defender.stayPos];

        } else if (defender instanceof MapBuildingModel) {
            defenderName = defender.name;
            defenderCenterPositions = defender.stayMapPositions;
            if (defender.type == MapBuildingType.city) {
                defenderHp = (defender as MapMainCityBuildingModel).hp;
                defenderHpMax = (defender as MapMainCityBuildingModel).hpMax;
                defenderAttack = (defender as MapMainCityBuildingModel).attack;

            } else if (defender.type == MapBuildingType.stronghold) {
                for (const defenderPioneerId of defender.defendPioneerIds) {
                    const findPioneer = this.getPioneerById(defenderPioneerId);
                    if (findPioneer != null) {
                        defenderHp += findPioneer.hp;
                        defenderHpMax += findPioneer.hpMax;
                        defenderAttack += findPioneer.attack;
                    }
                }
            }
        }
        for (const observer of this._observers) {
            observer.beginFight(
                fightId,
                { name: attacker.name, hp: attacker.hp, hpMax: attacker.hpMax },
                { name: defenderName, hp: defenderHp, hpMax: defenderHpMax },
                attacker.friendly,
                defenderCenterPositions
            );
        }
        let selfAttack: boolean = true;
        const intervalId = setInterval(() => {
            let fightOver: boolean = false;
            let deadPioneer = null;
            if (selfAttack) {
                defenderHp = Math.max(0, defenderHp - attacker.attack);

                if (defender instanceof MapPioneerModel) {
                    defender.loseHp(attacker.attack);
                    for (const observe of this._observers) {
                        observe.pioneerLoseHp(defender.id, attacker.attack);
                    }
                    if (defender.hp <= 0) {
                        this.hidePioneer(defender.id);
                        fightOver = true;
                        deadPioneer = defender;
                    }

                } else if (defender instanceof MapBuildingModel) {
                    if (defender.type == MapBuildingType.city) {
                        (defender as MapMainCityBuildingModel).loseHp(attacker.attack);
                        if ((defender as MapMainCityBuildingModel).hp <= 0) {
                            fightOver = true;
                            deadPioneer = defender;
                        }
                    } else if (defender.type == MapBuildingType.stronghold) {
                        for (const pioneerId of defender.defendPioneerIds) {
                            const findPioneer = this.getPioneerById(pioneerId);
                            if (findPioneer && findPioneer.hp > 0) {
                                findPioneer.loseHp(attacker.attack);
                                for (const observe of this._observers) {
                                    observe.pioneerLoseHp(defender.id, attacker.attack);
                                }
                                if (findPioneer.hp <= 0) {
                                    this.hidePioneer(findPioneer.id);
                                }
                                break;
                            }
                        }
                        if (defenderHp <= 0) {
                            BuildingMgr.instance.hideBuilding(defender.id, attacker.id);
                            fightOver = true;
                            deadPioneer = defender;
                        }
                    }
                }
            } else {
                attacker.loseHp(defenderAttack);
                for (const observe of this._observers) {
                    observe.pioneerLoseHp(attacker.id, defenderAttack);
                }
                if (attacker.hp <= 0) {
                    this.hidePioneer(attacker.id);
                    fightOver = true;
                    deadPioneer = attacker;
                }
            }
            selfAttack = !selfAttack;
            if (fightOver) {
                // fight end
                if (deadPioneer.id == "npc_0") {
                    //after killed prophetess, city become enemy
                    BuildingMgr.instance.changeBuildingFaction("building_1", BuildingFactionType.enemy);
                }

                for (const observer of this._observers) {
                    observer.endFight(fightId, false, deadPioneer instanceof MapPioneerModel, deadPioneer.id);
                }
                // status changed
                attacker.actionType = MapPioneerActionType.idle;
                for (const observer of this._observers) {
                    observer.pioneerActionTypeChanged(attacker.id, attacker.actionType, attacker.actionEndTimeStamp);
                }
                if (defender instanceof MapPioneerModel) {
                    defender.actionType = MapPioneerActionType.idle;
                    for (const observer of this._observers) {
                        observer.pioneerActionTypeChanged(defender.id, defender.actionType, defender.actionEndTimeStamp);
                    }
                }
                clearInterval(intervalId);
                this._savePioneerData();

                if (deadPioneer instanceof MapPlayerPioneerModel) {
                    // player dead
                    deadPioneer.rebirthCountTime = 10;
                    this._savePioneerData();
                }

            } else {
                for (const observer of this._observers) {
                    observer.fightDidAttack(
                        fightId,
                        { name: attacker.name, hp: attacker.hp, hpMax: attacker.hpMax },
                        { name: defenderName, hp: defenderHp, hpMax: defenderHpMax },
                        attacker.friendly,
                        defenderCenterPositions
                    );
                }
            }
        }, 250);
    }

    private _savePioneerData() {
        localStorage.setItem(this._localStorageKey, JSON.stringify(this._pioneers));
    }
}