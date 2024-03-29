import { Details, Vec2, builtinResMgr, log, math, nextPow2, pingPong, resources, v2, v3 } from "cc";
import CommonTools from "../Tool/CommonTools";
import { GameMain } from "../GameMain";
import { TilePos } from "../Game/TiledMap/TileTool";
import { GetPropData, ResourceCorrespondingItem } from "../Const/ConstDefine";
import { ArtifactMgr, BuildingMgr, CountMgr, ItemMgr, LanMgr, SettlementMgr, UserInfoMgr } from "../Utils/Global";
import { PioneerMgrEvent } from "../Const/Manager/PioneerMgrDefine";
import MapBuildingModel, { MapMainCityBuildingModel } from "../Game/Outer/Model/MapBuildingModel";
import { MapPioneerType, MapPioneerActionType, MapPioneerAttributesChangeModel, MapPioneerEventStatus, MapPioneerAttributesChangeType, MapPioneerLogicType } from "../Const/Model/MapPioneerModelDefine";
import MapPioneerModel, { MapPlayerPioneerModel, MapNpcPioneerModel, MapPioneerLogicModel } from "../Game/Outer/Model/MapPioneerModel";
import { UIHUDController } from "../UI/UIHUDController";
import NotificationMgr from "../Basic/NotificationMgr";
import { ArtifactEffectType } from "../Const/Artifact";
import { BuildingFactionType, MapBuildingType } from "../Const/BuildingDefine";
import { FinishedEvent } from "../Const/UserInfoDefine";
import { CountType } from "../Const/Count";
import { EventConfigData } from "../Const/Event";
import EventConfig from "../Config/EventConfig";
import { NotificationName } from "../Const/Notification";

export default class PioneerMgr {

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
            busy = (
                findPioneer[0].actionType != MapPioneerActionType.dead &&
                findPioneer[0].actionType != MapPioneerActionType.wakeup &&
                findPioneer[0].actionType != MapPioneerActionType.idle &&
                findPioneer[0].actionType != MapPioneerActionType.defend &&
                findPioneer[0].actionType != MapPioneerActionType.eventing);
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

    public pioneerHealHpToMax(pioneerId: string) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            const healValue: number = Math.min(findPioneer.hpMax - findPioneer.hp, ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Troop));
            if (healValue > 0) {
                findPioneer.gainHp(healValue);
                ItemMgr.subItem(ResourceCorrespondingItem.Troop, healValue);
                this._savePioneerData();
                for (const observe of this._observers) {
                    if (observe.pioneerGainHp != null) {
                        observe.pioneerGainHp(pioneerId, healValue);
                    }
                }
            }
        }
    }
    public pioneerChangeOriginalHpMax(pioneerId: string, value: number) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            findPioneer.gainOriginalHpMax(value);
            this._savePioneerData();
            for (const observe of this._observers) {
                observe.pioneerHpMaxChanged(pioneerId);
            }
        }
    }
    public pioneerChangeHpMax(pioneerId: string, change: MapPioneerAttributesChangeModel) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            findPioneer.changeHpMax(change);
            this._savePioneerData();
            for (const observe of this._observers) {
                observe.pioneerHpMaxChanged(pioneerId);
            }
        }
    }
    public pioneerChangeAttack(pioneerId: string, change: MapPioneerAttributesChangeModel) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            findPioneer.changeAttack(change);
            this._savePioneerData();
            for (const observe of this._observers) {
                observe.pioneerAttackChanged(pioneerId);
            }
        }
    }

    public pioneerChangeAllPlayerOriginalHpMax(value: number) {
        for (const pioneer of this.getPlayerPioneer()) {
            this.pioneerChangeOriginalHpMax(pioneer.id, value);
        }
    }
    public pioneerChangeAllPlayerHpMax(change: MapPioneerAttributesChangeModel) {
        for (const pioneer of this.getPlayerPioneer()) {
            this.pioneerChangeHpMax(pioneer.id, change);
        }
    }
    public pioneerChangeAllPlayerAttack(change: MapPioneerAttributesChangeModel) {
        for (const pioneer of this.getPlayerPioneer()) {
            this.pioneerChangeAttack(pioneer.id, change);
        }
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


    public pioneerBeginMove(pioneerId: string, paths: TilePos[]) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            if (paths.length > 0) {
                findPioneer.actionType = MapPioneerActionType.moving;
                findPioneer.movePaths = paths;
                
                for (const observer of this._observers) {
                    observer.pioneerActionTypeChanged(pioneerId, MapPioneerActionType.moving, 0);
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
            } else {
                findPioneer.actionType = MapPioneerActionType.idle;
                this._savePioneerData();
                this._pioneerActionTypeChangedByMeetTrigger(findPioneer);
            }
        }
    }
    public pioneerDidMoveOneStep(pioneerId: string) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            const allBuildings = BuildingMgr.getAllBuilding();
            for (const building of allBuildings) {
                if (building.show &&
                    building.faction != BuildingFactionType.netural &&
                    building.defendPioneerIds.indexOf(pioneerId) != -1) {
                    BuildingMgr.removeDefendPioneer(building.id, pioneerId);
                    break;
                }
            }

            if (findPioneer.movePaths.length > 0) {
                findPioneer.movePaths.splice(0, 1);
                if (findPioneer.type != MapPioneerType.player && !findPioneer.friendly) {
                    // enemy one step over to check will fight
                    this._pioneerActionTypeChangedByMeetTrigger(findPioneer, false);
                }
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
            if (!findPioneer.show) {
                return;
            }
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
            if (findPioneer.show) {
                return;
            }
            if (findPioneer.type == MapPioneerType.player) {
                // get new pioneer
                SettlementMgr.insertSettlement({
                    level: UserInfoMgr.level,
                    newPioneerIds: [pioneerId],
                    killEnemies: 0,
                    gainResources: 0,
                    consumeResources: 0,
                    gainTroops: 0,
                    consumeTroops: 0,
                    gainEnergy: 0,
                    consumeEnergy: 0,
                    exploredEvents: 0
                });
            }
            if (pioneerId == "pioneer_3") {
                let serectGuardShow: boolean = false;
                for (const player of this.getPlayerPioneer()) {
                    if (player.id == "pioneer_1") {
                        serectGuardShow = player.show;
                        break;
                    }
                }
                findPioneer.show = !serectGuardShow;
            } else {
                findPioneer.show = true;
            }
            if (findPioneer.show) {
                for (const observe of this._observers) {
                    observe.pioneerDidShow(findPioneer.id);
                }
                this._savePioneerData();
            }
        }
    }
    public pioneerToIdle(pioneerId: string) {
        const findPioneer = this.getPioneerById(pioneerId);
        if (findPioneer != null) {
            findPioneer.actionType = MapPioneerActionType.idle;
            findPioneer.eventStatus = MapPioneerEventStatus.None;
            findPioneer.actionEndTimeStamp = 0;
            for (const observer of this._observers) {
                observer.pioneerActionTypeChanged(findPioneer.id, findPioneer.actionType, findPioneer.actionEndTimeStamp);
            }
            for (const building of BuildingMgr.getStrongholdBuildings()) {
                if (building.defendPioneerIds.indexOf(pioneerId) != -1) {
                    BuildingMgr.removeDefendPioneer(building.id, pioneerId);
                    break;
                }
            }
            this._savePioneerData();
        }
    }
    public pioneerDealWithEvent(pioneerId: string, buildingId: string, currentEvent: EventConfigData) {
        const pioneer = this.getPioneerById(pioneerId);
        if (pioneer == null) {
            return;
        }
        if (currentEvent == null) {
            return;
        }
        const currentTimeStamp = new Date().getTime();
        pioneer.actionType = MapPioneerActionType.eventing;
        pioneer.actionEventId = currentEvent.id;
        for (const observer of this._observers) {
            observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
        }
        let canShowDialog: boolean = false;
        if (pioneer.eventStatus == MapPioneerEventStatus.Waited) {
            canShowDialog = true;

        } else if (pioneer.eventStatus == MapPioneerEventStatus.Waiting) {

        } else if (pioneer.eventStatus == MapPioneerEventStatus.None) {
            if (currentEvent.wait_time != null &&
                currentEvent.wait_time > 0) {
                pioneer.actionBeginTimeStamp = currentTimeStamp;
                pioneer.actionEndTimeStamp = currentTimeStamp + currentEvent.wait_time * 1000;
                pioneer.eventStatus = MapPioneerEventStatus.Waiting;
                for (const observer of this._observers) {
                    observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                }
                setTimeout(() => {
                    pioneer.actionEndTimeStamp = 0;
                    pioneer.eventStatus = MapPioneerEventStatus.Waited;
                    for (const observer of this._observers) {
                        observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
                    }
                    this._savePioneerData();
                }, currentEvent.wait_time * 1000);
            } else {
                canShowDialog = true;
            }
        }
        if (canShowDialog) {
            pioneer.eventStatus = MapPioneerEventStatus.None;
            this._savePioneerData();
            for (const observer of this._observers) {
                observer.pioneerActionTypeChanged(pioneer.id, pioneer.actionType, pioneer.actionEndTimeStamp);
            }
            for (const observe of this._observers) {
                observe.eventBuilding(pioneer.id, buildingId, currentEvent.id);
            }
        }
    }

    public eventFight(attackerId: string, enemyId: string, temporaryAttributes: Map<string, MapPioneerAttributesChangeModel>, fightOverCallback: (succeed: boolean) => void) {
        const attacker = this.getPioneerById(attackerId);
        const enemy = this.getPioneerById(enemyId);
        if (attacker != null && enemy != null) {
            attacker.actionType = MapPioneerActionType.fighting;
            for (const observer of this._observers) {
                observer.pioneerActionTypeChanged(attacker.id, attacker.actionType, attacker.actionEndTimeStamp);
            }
            const fightId: string = new Date().getTime().toString();
            let attackerAttack = attacker.attack;
            let attackerDefend = attacker.defend;

            let enemyId = enemy.id;
            let isBuilding = false;
            let enemyName = enemy.name;
            let enemyHp = enemy.hp;
            let enemyHpMax = enemy.hpMax;
            let enemyAttack = enemy.attack;
            let enemyDefend = enemy.defend;

            // gain temporaryAttributes
            temporaryAttributes.forEach((model: MapPioneerAttributesChangeModel, key: string) => {
                const id = key.split("|")[0];
                const type = parseInt(key.split("|")[1]);
                if (id == enemyId) {
                    if (type == 1) {
                        // hp
                        if (model.type == MapPioneerAttributesChangeType.ADD) {
                            enemyHpMax += model.value;
                        } else if (model.type == MapPioneerAttributesChangeType.MUL) {
                            enemyHpMax += enemy.originalHpMax * model.value;
                        }
                        enemyHpMax = Math.max(1, enemyHpMax);
                        enemyHp = enemyHpMax;
                    } else if (type == 2) {
                        // attack
                        if (model.type == MapPioneerAttributesChangeType.ADD) {
                            enemyAttack += model.value;
                        } else if (model.type == MapPioneerAttributesChangeType.MUL) {
                            enemyAttack += enemy.originalAttack * model.value;
                        }
                    }
                } else if (id == attackerId) {
                    if (type == 2) {
                        if (model.type == MapPioneerAttributesChangeType.ADD) {
                            attackerAttack += model.value;
                        } else if (model.type == MapPioneerAttributesChangeType.MUL) {
                            attackerAttack += attacker.originalAttack * model.value;
                        }
                    }
                }
            });
            for (const observer of this._observers) {
                if (observer.beginFight != null) {
                    observer.beginFight(
                        fightId,
                        { id: attacker.id, name: attacker.name, hp: attacker.hp, hpMax: attacker.hpMax },
                        { id: enemyId, isBuilding: isBuilding, name: enemyName, hp: enemyHp, hpMax: enemyHpMax },
                        attacker.friendly,
                        [attacker.stayPos]
                    );
                }
            }
            let selfAttack: boolean = true;
            const intervalId = setInterval(() => {
                let fightOver: boolean = false;
                let deadPioneer = null;
                if (selfAttack) {
                    const damage = Math.max(1, attackerAttack - enemyDefend);
                    if (damage > 0) {
                        enemyHp = Math.max(0, enemyHp - damage);
                        if (enemyHp <= 0) {
                            fightOver = true;
                            deadPioneer = enemy;
                        }
                    }
                } else {
                    const damage = Math.max(1, enemyAttack - attackerDefend);
                    if (damage > 0) {
                        attacker.loseHp(damage);
                        for (const observe of this._observers) {
                            observe.pioneerLoseHp(attacker.id, damage);
                        }
                        if (attacker.hp <= 0) {
                            this.hidePioneer(attacker.id);
                            fightOver = true;
                            deadPioneer = attacker;
                        }
                    }
                }
                selfAttack = !selfAttack;
                for (const observer of this._observers) {
                    if (observer.fightDidAttack != null) {
                        observer.fightDidAttack(
                            fightId,
                            { id: attacker.id, name: attacker.name, hp: attacker.hp, hpMax: attacker.hpMax },
                            { id: attacker.id, isBuilding: isBuilding, name: enemyName, hp: enemyHp, hpMax: enemyHpMax },
                            attacker.friendly,
                            [attacker.stayPos]
                        );
                    }
                }
                if (fightOver) {
                    if (deadPioneer == enemy &&
                        deadPioneer.winexp > 0) {
                        // win fight, add exp
                        UserInfoMgr.exp += enemy.winexp;
                    }
                    for (const observer of this._observers) {
                        if (observer.endFight != null) {
                            observer.endFight(fightId, true, deadPioneer instanceof MapPioneerModel, deadPioneer.id, deadPioneer == enemy, attacker.id);
                        }
                    }

                    NotificationMgr.triggerEvent(NotificationName.FIGHT_FINISHED, {
                        attacker: {
                            name: attacker.name,
                            avatarIcon: "icon_player_avatar", // todo
                            hp: attacker.hp,
                            hpMax: attacker.hpMax,
                        },
                        defender: {
                            name: enemy.name,
                            avatarIcon: "icon_player_avatar",
                            hp: enemyHp,
                            hpMax: enemyHpMax,
                        },
                        attackerIsSelf: attacker.friendly,
                        buildingId: null,
                        position: attacker.stayPos,
                        fightResult: attacker.hp != 0 ? "win" : "lose",
                        rewards: [],
                    });

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

                        // useLanMgr
                        let tips = LanMgr.replaceLanById("106001", [LanMgr.getLanById(deadPioneer.name)]);
                        // let tips = LanMgr.getLanById(deadPioneer.name) + " is dead, please wait for the resurrection";

                        UIHUDController.showCenterTip(tips);
                    }
                    if (fightOverCallback != null) {
                        fightOverCallback(enemyHp <= 0);
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
                    this.showPioneer(actionTargetPioneer.id);
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


    public constructor() {

    }

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
                for (const key in resultData) {
                    const temple = resultData[key];
                    let pioneer: MapPioneerModel = null;
                    let templePos = null;
                    if (temple.pos.length > 0) {
                        templePos = v2(temple.pos[0].x, temple.pos[0].y);
                    }
                    if (templePos == null) {
                        continue;
                    }
                    if (temple.type == MapPioneerType.npc) {
                        pioneer = new MapNpcPioneerModel(
                            temple.show == 1,
                            0,
                            temple.id,
                            temple.friendly == 1,
                            temple.type,
                            temple.name,
                            temple.hp,
                            temple.hp,
                            temple.hp,
                            temple.attack,
                            temple.attack,
                            temple.def,
                            temple.def,
                            templePos
                        );
                    } else if (temple.type == MapPioneerType.player) {
                        pioneer = new MapPlayerPioneerModel(
                            temple.show == 1,
                            0,
                            temple.id,
                            temple.friendly == 1,
                            temple.type,
                            temple.name,
                            temple.hp,
                            temple.hp,
                            temple.hp,
                            temple.attack,
                            temple.attack,
                            temple.def,
                            temple.def,
                            templePos
                        );
                    } else {
                        pioneer = new MapPioneerModel(
                            temple.show == 1,
                            0,
                            temple.id,
                            temple.friendly == 1,
                            temple.type,
                            temple.name,
                            temple.hp,
                            temple.hp,
                            temple.hp,
                            temple.attack,
                            temple.attack,
                            temple.def,
                            temple.def,
                            templePos
                        );
                    }
                    // logic
                    if (temple.logics != null) {
                        const logics = [];
                        for (const logic of temple.logics) {
                            const model = new MapPioneerLogicModel(logic.type);
                            let checkLogicUseful: boolean = true;
                            if (logic.type == MapPioneerLogicType.stepmove) {
                                model.setStepMoveData(logic.step, logic.cd, logic.cd, logic.direction, logic.repeat);

                            } else if (logic.type == MapPioneerLogicType.targetmove) {
                                if (logic.posx != null && logic.posy != null) {
                                    model.targetPos = v2(logic.posx, logic.posy);
                                }

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
                    if (temple.exp != null) {
                        pioneer.winexp = temple.exp;
                    }
                    if (temple.drop != null) {
                        let dropDatas: GetPropData[] = [];
                        for (const dropData of temple.drop) {
                            if (dropData.length != 3) {
                                continue;
                            }
                            dropDatas.push({
                                type: dropData[0],
                                propId: dropData[1],
                                num: dropData[2]
                            });
                        }
                        pioneer.drop = dropDatas;
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
                        temple._originalHpMax,
                        temple._hpMax,
                        temple._hp,
                        temple._originalAttack,
                        temple._attack,
                        temple._originalDefend,
                        temple._defend,
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
                        temple._originalHpMax,
                        temple._hpMax,
                        temple._hp,
                        temple._originalAttack,
                        temple._attack,
                        temple._originalDefend,
                        temple._defend,
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
                        temple._originalHpMax,
                        temple._hpMax,
                        temple._hp,
                        temple._originalAttack,
                        temple._attack,
                        temple._originalDefend,
                        temple._defend,
                        v2(temple._stayPos.x, temple._stayPos.y)
                    );
                }
                if (temple._actionType == MapPioneerActionType.exploring ||
                    temple._actionType == MapPioneerActionType.mining) {
                    newModel.actionType = MapPioneerActionType.idle;
                } else {
                    newModel.actionType = temple._actionType;
                }
                newModel.actionEventId = temple._actionEventId;
                newModel.eventStatus = temple._eventStatus;
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
                        model.setStepMoveData(logic._step, logic._cd, logic._currentCd, logic._direction, logic._repeat);

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
                newModel.winexp = temple._winexp;
                newModel.drop = temple._drop;
                newModel.animType = temple._animType;
                this._pioneers.push(newModel);
            }
        }
        // default player id is "0"
        this._currentActionPioneerId = "pioneer_0";
        this._originalActionPioneerId = "pioneer_0";

        setInterval(() => {
            if (GameMain.inst == null) {
                return;
            }
            for (const pioneer of this._pioneers) {
                if (pioneer.showCountTime > 0) {
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
                            if (logic.condition != null && logic.condition != FinishedEvent.NoCondition) {
                                if (UserInfoMgr.finishedEvents.indexOf(logic.condition) != -1) {
                                    canAction = true;
                                }
                            } else {
                                canAction = true;
                            }
                            if (canAction) {
                                //all move logic change to move one step by step
                                if (logic.type == MapPioneerLogicType.stepmove) {
                                    if (logic.repeat > 0 || logic.repeat == -1) {
                                        if (logic.currentCd > 0) {
                                            //move cd count
                                            logic.currentCd -= 1;
                                        }
                                        for (const observe of this._observers) {
                                            observe.pioneerLogicMoveTimeCountChanged(pioneer);
                                        }
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
                                    for (const observe of this._observers) {
                                        observe.pioneerLogicMove(pioneer, logic);
                                    }
                                    pioneer.logics.splice(0, 1);

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

                                                getNextPos = false;
                                                if (GameMain.inst.outSceneMap.mapBG.isBlock(nextPos)) {
                                                    getNextPos = true;
                                                } else {
                                                    const pioneers = this.getShowPioneersByMapPos(nextPos);
                                                    if (pioneers.length > 0) {
                                                        for (const temple of pioneers) {
                                                            if (temple.type != MapPioneerType.player) {
                                                                getNextPos = true;
                                                                break;
                                                            }
                                                        }
                                                    } else {
                                                        const buildings = BuildingMgr.getShowBuildingByMapPos(nextPos);
                                                        if (buildings != null) {
                                                            getNextPos = true;
                                                        }
                                                    }
                                                }
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
                                            for (const observe of this._observers) {
                                                observe.pioneerLogicMove(pioneer, logic);
                                            }
                                            if (logic.repeat == 0) {
                                                pioneer.logics.splice(0, 1);
                                            }
                                            for (const observe of this._observers) {
                                                if (observe.pioneerLogicMovePathPrepared != null) {
                                                    observe.pioneerLogicMovePathPrepared(pioneer, logic);
                                                }
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

                } else {
                    if (pioneer instanceof MapPlayerPioneerModel) {
                        if (pioneer.rebirthCountTime > 0) {
                            pioneer.rebirthCountTime -= 1;
                            for (const observe of this._observers) {
                                observe.pionerrRebirthCount(pioneer.id, pioneer.rebirthCountTime);
                            }
                            if (pioneer.rebirthCountTime == 0) {
                                let rebirthMapPos = null;
                                const mainCity = BuildingMgr.getBuildingById("building_1");
                                if (mainCity != null && mainCity.faction != BuildingFactionType.enemy) {
                                    rebirthMapPos = mainCity.stayMapPositions[1];
                                } else {
                                    rebirthMapPos = v2(pioneer.stayPos.x - 1, pioneer.stayPos.y);
                                }
                                let rebirthHp: number = Math.max(1, Math.min(ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Troop), pioneer.hpMax));
                                ItemMgr.subItem(ResourceCorrespondingItem.Troop, rebirthHp);
                                pioneer.rebirth(rebirthHp, rebirthMapPos);
                                pioneer.eventStatus = MapPioneerEventStatus.None;
                                pioneer.actionType = MapPioneerActionType.idle;
                                for (const observe of this._observers) {
                                    observe.pioneerRebirth(pioneer.id);
                                }
                            }
                            this._savePioneerData();
                        }
                    }
                }
            }
        }, 1000);
    }

    private _pioneerActionTypeChangedByMeetTrigger(pioneer: MapPioneerModel, isStay: boolean = true) {
        let stayBuilding: MapBuildingModel = null;
        if (pioneer.purchaseMovingBuildingId != null) {
            const templeBuildings = BuildingMgr.getShowBuildingsNearMapPos(pioneer.stayPos, 2);
            if (templeBuildings.length > 0) {
                // use first find building
                stayBuilding = templeBuildings[0];
            }
            pioneer.purchaseMovingBuildingId = null;
        } else {
            stayBuilding = BuildingMgr.getShowBuildingByMapPos(pioneer.stayPos);
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
                if (pioneer.type == MapPioneerType.player ||
                    interactPioneer.type == MapPioneerType.player) {
                    CountMgr.addNewCount({
                        type: CountType.actionPioneer,
                        timeStamp: new Date().getTime(),
                        data: {
                            actionPid: pioneer.id,
                            interactPid: interactPioneer.id
                        }
                    });
                }
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
            if (pioneer.type == MapPioneerType.player) {
                CountMgr.addNewCount({
                    type: CountType.actionBuilding,
                    timeStamp: new Date().getTime(),
                    data: {
                        actionPid: pioneer.id,
                        interactBId: stayBuilding.id
                    }
                });
            }
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
                            BuildingMgr.buildingClearTask(cityBuilding.id);
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
                        BuildingMgr.hideBuilding(stayBuilding.id, pioneer.id);
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
                        BuildingMgr.changeBuildingFaction(stayBuilding.id, BuildingFactionType.self);
                        BuildingMgr.insertDefendPioneer(stayBuilding.id, pioneer.id);
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
                            BuildingMgr.hideBuilding(stayBuilding.id, pioneer.id);
                        } else {
                            pioneer.loseHp(Math.floor(pioneer.hp / 2));
                            pioneer.changeAttack({
                                type: MapPioneerAttributesChangeType.MUL,
                                value: -0.5
                            });
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

                    // artifact
                    const artifactEff = ArtifactMgr.getPropEffValue(UserInfoMgr.level);
                    let artifactGather = 0;
                    if (artifactEff.eff[ArtifactEffectType.GATHER_TIME]) {
                        artifactGather = artifactEff.eff[ArtifactEffectType.GATHER_TIME];
                    }

                    let acionTime: number = 3000;
                    // artifact eff
                    acionTime = Math.floor(acionTime - (acionTime * artifactGather));
                    if (acionTime < 0) acionTime = 1;

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
                        BuildingMgr.resourceBuildingCollected(stayBuilding.id);
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
                    let currentEvent = EventConfig.getById(stayBuilding.eventId);
                    if (currentEvent != null) {
                        this.pioneerDealWithEvent(pioneer.id, stayBuilding.id, currentEvent);
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
            }
        }
    }

    private _fight(attacker: MapPioneerModel, defender: MapPioneerModel | MapBuildingModel) {
        let canFight: boolean = true;
        if (attacker.actionType != MapPioneerActionType.moving &&
            attacker.actionType != MapPioneerActionType.idle) {
            canFight = false;
        } else {
            if (defender instanceof MapPioneerModel) {
                if (defender.actionType != MapPioneerActionType.moving &&
                    defender.actionType != MapPioneerActionType.idle) {
                    canFight = false;
                }
            }
        }

        if (attacker.type == MapPioneerType.hred &&
            defender.type != MapPioneerType.player) {
            canFight = false;
        }
        if (!canFight) {
            return;
        }

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
        let defenderId: string = "";
        let defenderIsBuilding: boolean = false;
        let defenderHp: number = 0;
        let defenderHpMax: number = 0;
        let defenderAttack: number = 0;
        let defenderDefned: number = 0;
        let defenderCenterPositions: Vec2[] = [];
        if (defender instanceof MapPioneerModel) {
            defenderName = defender.name;
            defenderId = defender.id;
            defenderIsBuilding = false;
            defenderHp = defender.hp;
            defenderHpMax = defender.hpMax;
            defenderAttack = defender.attack;
            defenderCenterPositions = [defender.stayPos];
            defenderDefned = defender.defend;

        } else if (defender instanceof MapBuildingModel) {
            defenderName = defender.name;
            defenderId = defender.id;
            defenderIsBuilding = true;
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
            if (observer.beginFight != null) {
                observer.beginFight(
                    fightId,
                    { id: attacker.id, name: attacker.name, hp: attacker.hp, hpMax: attacker.hpMax },
                    { id: defenderId, isBuilding: defenderIsBuilding, name: defenderName, hp: defenderHp, hpMax: defenderHpMax },
                    attacker.friendly,
                    defenderCenterPositions
                );
            }
        }
        let selfAttack: boolean = true;
        const intervalId = setInterval(() => {
            let fightOver: boolean = false;
            let deadPioneer = null;
            if (selfAttack) {
                const damage: number = Math.max(1, attacker.attack - defenderDefned);
                if (damage > 0) {
                    defenderHp = Math.max(0, defenderHp - damage);
                    if (defender instanceof MapPioneerModel) {
                        defender.loseHp(damage);
                        for (const observe of this._observers) {
                            observe.pioneerLoseHp(defender.id, damage);
                        }
                        if (defender.hp <= 0) {
                            this.hidePioneer(defender.id);
                            fightOver = true;
                            deadPioneer = defender;
                        }

                    } else if (defender instanceof MapBuildingModel) {
                        if (defender.type == MapBuildingType.city) {
                            (defender as MapMainCityBuildingModel).loseHp(damage);
                            if ((defender as MapMainCityBuildingModel).hp <= 0) {
                                fightOver = true;
                                deadPioneer = defender;
                            }
                        } else if (defender.type == MapBuildingType.stronghold) {
                            for (const pioneerId of defender.defendPioneerIds) {
                                const findPioneer = this.getPioneerById(pioneerId);
                                if (findPioneer && findPioneer.hp > 0) {
                                    findPioneer.loseHp(damage);
                                    for (const observe of this._observers) {
                                        observe.pioneerLoseHp(defender.id, damage);
                                    }
                                    if (findPioneer.hp <= 0) {
                                        this.hidePioneer(findPioneer.id);
                                    }
                                    break;
                                }
                            }
                            if (defenderHp <= 0) {
                                BuildingMgr.hideBuilding(defender.id, attacker.id);
                                fightOver = true;
                                deadPioneer = defender;
                            }
                        }
                    }
                }
            } else {
                const damage: number = Math.max(1, defenderAttack - attacker.defend);
                if (damage > 0) {
                    attacker.loseHp(damage);
                    for (const observe of this._observers) {
                        observe.pioneerLoseHp(attacker.id, damage);
                    }
                    if (attacker.hp <= 0) {
                        this.hidePioneer(attacker.id);
                        fightOver = true;
                        deadPioneer = attacker;
                    }
                }
            }
            selfAttack = !selfAttack;
            for (const observer of this._observers) {
                if (observer.fightDidAttack != null) {
                    observer.fightDidAttack(
                        fightId,
                        { id: attacker.id, name: attacker.name, hp: attacker.hp, hpMax: attacker.hpMax },
                        { id: defenderId, isBuilding: defenderIsBuilding, name: defenderName, hp: defenderHp, hpMax: defenderHpMax },
                        attacker.friendly,
                        defenderCenterPositions
                    );
                }
            }
            if (fightOver) {
                // fight end
                if (deadPioneer.id == "npc_0") {
                    //after killed prophetess, city become enemy
                    BuildingMgr.changeBuildingFaction("building_1", BuildingFactionType.enemy);
                }

                let isSelfWin: boolean = false;
                let playerPioneerId: string = null;
                if (deadPioneer instanceof MapPioneerModel &&
                    deadPioneer.type != MapPioneerType.player &&
                    deadPioneer.winexp > 0) {
                    UserInfoMgr.exp += deadPioneer.winexp;
                    isSelfWin = true;
                }
                if (attacker.type == MapPioneerType.player) {
                    playerPioneerId = attacker.id;

                } else if (defender instanceof MapPioneerModel &&
                    defender.type == MapPioneerType.player) {
                    playerPioneerId = defender.id;
                }

                for (const observer of this._observers) {
                    if (observer.endFight != null) {
                        observer.endFight(fightId, false, deadPioneer instanceof MapPioneerModel, deadPioneer.id, isSelfWin, playerPioneerId);
                    }
                }

                NotificationMgr.triggerEvent(NotificationName.FIGHT_FINISHED, {
                    attacker: {
                        name: attacker.name,
                        avatarIcon: "icon_player_avatar", // todo
                        hp: attacker.hp,
                        hpMax: attacker.hpMax,
                    },
                    defender: {
                        name: defender.name,
                        avatarIcon: "icon_player_avatar",
                        hp: defenderHp,
                        hpMax: defenderHpMax,
                    },
                    attackerIsSelf: attacker.friendly,
                    buildingId: defender instanceof MapBuildingModel ?? (defender as MapBuildingModel).id,
                    position: defenderCenterPositions[0],
                    fightResult: attacker.hp != 0 ? "win" : "lose",
                    rewards: [],
                });

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

                    // useLanMgr
                    let tips = LanMgr.replaceLanById("106001", [LanMgr.getLanById(deadPioneer.name)]);
                    // let tips = LanMgr.getLanById(deadPioneer.name) + " is dead, please wait for the resurrection";

                    UIHUDController.showCenterTip(tips);
                }

            }
        }, 250);
    }

    private _savePioneerData() {
        localStorage.setItem(this._localStorageKey, JSON.stringify(this._pioneers));
    }
}