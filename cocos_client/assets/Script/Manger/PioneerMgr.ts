import { CurveRange, Vec2 } from "cc";
import CommonTools from "../Tool/CommonTools";
import { GameExtraEffectType, MapMemberFactionType, MapMemberTargetType, ResourceCorrespondingItem } from "../Const/ConstDefine";
import { GameMgr, ItemMgr, LanMgr } from "../Utils/Global";
import { UIHUDController } from "../UI/UIHUDController";
import NotificationMgr from "../Basic/NotificationMgr";
import { MapBuildingType } from "../Const/BuildingDefine";
import { EventConfigData } from "../Const/Event";
import EventConfig from "../Config/EventConfig";
import { NotificationName } from "../Const/Notification";
import GameMainHelper from "../Game/Helper/GameMainHelper";

import {
    MapPioneerType,
    MapPioneerActionType,
    MapPioneerEventStatus,
    MapPioneerLogicType,
    MapPioneerObject,
    MapPioneerLogicObject,
    MapPlayerPioneerObject,
} from "../Const/PioneerDefine";
import { DataMgr } from "../Data/DataMgr";
import { PioneersDataMgr } from "../Data/Save/PioneersDataMgr";
import { MapBuildingMainCityObject, MapBuildingObject } from "../Const/MapBuilding";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";

export default class PioneerMgr {
    public initData() {
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_MOVE_MEETTED, this._onPioneerMoveMeeted, this);
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_LOGIC_MOVE, this._onPioneerLogicMove, this);
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_REBIRTH_BEGIN, this._onPioneerRebirthBegin, this);

        const originalPioneer = DataMgr.s.pioneer.getCurrentPlayer();
        if (!!originalPioneer && originalPioneer.NFTId == null) {
            this._bindPlayerNFT(originalPioneer.id, originalPioneer.NFTInitLinkId);
        }
    }
    public pioneerHealHpToMax(pioneerId: string) {
        const costTroops: number = DataMgr.s.pioneer.gainHp(pioneerId, DataMgr.s.item.getObj_item_count(ResourceCorrespondingItem.Troop));
        if (costTroops > 0) {
            ItemMgr.subItem(ResourceCorrespondingItem.Troop, costTroops);
        }
    }
    public pioneerChangeHpMax(pioneerId: string, num: number) {
        DataMgr.s.pioneer.changeHpMax(pioneerId, num);
    }
    public pioneerChangeAttack(pioneerId: string, num: number) {
        DataMgr.s.pioneer.changeAttack(pioneerId, num);
    }
    public pioneerChangeAllPlayerHpMax(num: number) {
        for (const pioneer of DataMgr.s.pioneer.getAllPlayers()) {
            DataMgr.s.pioneer.changeHpMax(pioneer.id, num);
        }
    }
    public pioneerChangeAllPlayerAttack(num: number) {
        for (const pioneer of DataMgr.s.pioneer.getAllPlayers()) {
            DataMgr.s.pioneer.changeAttack(pioneer.id, num);
        }
    }
    public pioneerDidMoveOneStep(pioneerId: string) {
        const findPioneer = DataMgr.s.pioneer.getById(pioneerId);
        if (findPioneer != undefined) {
            const allBuildings = DataMgr.s.mapBuilding.getObj_building();
            for (const building of allBuildings) {
                if (building.show && building.faction != MapMemberFactionType.neutral && building.defendPioneerIds.indexOf(pioneerId) != -1) {
                    DataMgr.s.mapBuilding.removeDefendPioneer(building.id, pioneerId);
                    break;
                }
            }
            DataMgr.s.pioneer.didMoveStep(pioneerId);
        }
    }
    public showPioneer(pioneerId: string) {
        if (DataMgr.s.pioneer.changeShow(pioneerId, true)) {
            const pioneer = DataMgr.s.pioneer.getById(pioneerId);
            if (pioneer.type == MapPioneerType.player) {
                DataMgr.s.settlement.addObj({
                    level: DataMgr.s.userInfo.data.level,
                    newPioneerIds: [pioneerId],
                    killEnemies: 0,
                    gainResources: 0,
                    consumeResources: 0,
                    gainTroops: 0,
                    consumeTroops: 0,
                    gainEnergy: 0,
                    consumeEnergy: 0,
                    exploredEvents: 0,
                });
                const player = pioneer as MapPlayerPioneerObject;
                if (!!player && player.NFTId == null) {
                    this._bindPlayerNFT(player.id, player.NFTInitLinkId);
                }
            }
        }
    }
    // public linkNFTToPioneer(pioneerId: string, NFTId: string) {
    //     const findPioneer = this.getPioneerById(pioneerId);
    //     if (findPioneer != null) {
    //         findPioneer.NFTId = NFTId;
    //         this._savePioneerData();
    //     }
    // }
    public pioneerToIdle(pioneerId: string) {
        DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.idle);
        DataMgr.s.pioneer.changeEventStatus(pioneerId, MapPioneerEventStatus.None);
        for (const building of DataMgr.s.mapBuilding.getStrongholdBuildings()) {
            if (building.defendPioneerIds.indexOf(pioneerId) != -1) {
                DataMgr.s.mapBuilding.removeDefendPioneer(building.id, pioneerId);
                break;
            }
        }
    }
    public pioneerEventStatusToNone(pioneerId: string) {
        DataMgr.s.pioneer.changeEventStatus(pioneerId, MapPioneerEventStatus.None);
    }
    public pioneerDealWithEvent(pioneerId: string, buildingId: string, currentEvent: EventConfigData) {
        const pioneer = DataMgr.s.pioneer.getById(pioneerId);
        if (pioneer == undefined) {
            return;
        }
        if (currentEvent == null) {
            return;
        }
        DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.eventing, 0, 0, currentEvent.id);

        const currentTimeStamp = new Date().getTime();
        let canShowDialog: boolean = false;
        if (pioneer.eventStatus == MapPioneerEventStatus.Waited) {
            canShowDialog = true;
        } else if (pioneer.eventStatus == MapPioneerEventStatus.Waiting) {
        } else if (pioneer.eventStatus == MapPioneerEventStatus.None) {
            if (currentEvent.wait_time != null && currentEvent.wait_time > 0) {
                DataMgr.s.pioneer.changeEventStatus(pioneerId, MapPioneerEventStatus.Waiting, currentTimeStamp, currentEvent.wait_time * 1000);
                setTimeout(() => {
                    DataMgr.s.pioneer.changeEventStatus(pioneerId, MapPioneerEventStatus.Waited, 0, 0);
                }, currentEvent.wait_time * 1000);
            } else {
                canShowDialog = true;
            }
        }
        if (canShowDialog) {
            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EVENT_BUILDING, {
                pioneerId: pioneer.id,
                buildingId: buildingId,
                eventId: currentEvent.id,
            });
        }
    }

    public fight(
        attacker: MapPioneerObject,
        pioneerDefender: MapPioneerObject,
        buildingDefender: MapBuildingObject,
        isEventFight: boolean = false,
        fightOverCallback: (isSelfWin: boolean) => void = null
    ) {
        const pioneerDataMgr: PioneersDataMgr = DataMgr.s.pioneer;
        const isAttackBuilding: boolean = buildingDefender != null;
        const isSelfAttack: boolean = attacker.type == MapPioneerType.player;
        let canFight: boolean = true;
        if (attacker.actionType != MapPioneerActionType.moving && attacker.actionType != MapPioneerActionType.idle) {
            canFight = false;
        } else {
            if (!isAttackBuilding) {
                if (pioneerDefender.actionType != MapPioneerActionType.moving && pioneerDefender.actionType != MapPioneerActionType.idle) {
                    canFight = false;
                }
            }
        }
        if (attacker.type == MapPioneerType.hred) {
            if (isAttackBuilding) {
                canFight = false;
            } else {
                if (pioneerDefender.type != MapPioneerType.player) {
                    canFight = false;
                }
            }
        }
        if (!canFight) {
            return;
        }
        pioneerDataMgr.changeActionType(attacker.id, MapPioneerActionType.fighting);

        if (!isAttackBuilding) {
            pioneerDataMgr.changeActionType(pioneerDefender.id, MapPioneerActionType.fighting);
        }

        const fightId: string = new Date().getTime().toString();
        // begin fight
        let defenderName: string = "";
        let defenderId: string = "";
        let defenderHp: number = 0;
        let defenderHpMax: number = 0;
        let defenderAttack: number = 0;
        let defenderDefned: number = 0;
        let defenderCenterPositions: Vec2[] = [];
        if (!isAttackBuilding) {
            defenderName = pioneerDefender.name;
            defenderId = pioneerDefender.id;
            defenderHp = pioneerDefender.hp;
            defenderHpMax = pioneerDefender.hpMax;
            defenderAttack = pioneerDefender.attack;
            defenderCenterPositions = [pioneerDefender.stayPos];
            defenderDefned = pioneerDefender.defend;
        } else {
            defenderName = buildingDefender.name;
            defenderId = buildingDefender.id;
            defenderCenterPositions = buildingDefender.stayMapPositions;
            if (buildingDefender.type == MapBuildingType.city) {
                const mainCity = buildingDefender as MapBuildingMainCityObject;
                if (!!mainCity) {
                    defenderHp = mainCity.hp;
                    defenderHpMax = mainCity.hpMax;
                    defenderAttack = mainCity.attack;
                }
            } else if (buildingDefender.type == MapBuildingType.stronghold) {
                for (const defenderPioneerId of buildingDefender.defendPioneerIds) {
                    const findPioneer = pioneerDataMgr.getById(defenderPioneerId);
                    if (findPioneer != null) {
                        defenderHp += findPioneer.hp;
                        defenderHpMax += findPioneer.hpMax;
                        defenderAttack += findPioneer.attack;
                    }
                }
            }
        }
        const useData = {
            fightId: fightId,
            isSelfAttack: isSelfAttack,
            isAttackBuilding: isAttackBuilding,
            attackerInfo: {
                id: attacker.id,
                name: attacker.name,
                hp: attacker.hp,
                hpMax: attacker.hpMax,
            },
            defenderInfo: {
                id: defenderId,
                name: defenderName,
                hp: defenderHp,
                hpMax: defenderHpMax,
            },
            centerPos: defenderCenterPositions,
        };

        NotificationMgr.triggerEvent(NotificationName.MAP_MEMEBER_FIGHT_BEGIN, useData);

        let attackRound: boolean = true;
        const intervalId = setInterval(() => {
            let fightOver: boolean = false;
            let isAttackWin: boolean = false;
            if (attackRound) {
                const damage: number = Math.max(1, attacker.attack - defenderDefned);
                if (damage > 0) {
                    useData.defenderInfo.hp = Math.max(0, defenderHp - damage);
                    if (!isAttackBuilding) {
                        const isDead: boolean = pioneerDataMgr.loseHp(pioneerDefender.id, damage);
                        if (isDead) {
                            fightOver = true;
                            isAttackWin = true;
                        }
                    } else {
                        if (buildingDefender.type == MapBuildingType.city) {
                            if (useData.defenderInfo.hp <= 0) {
                                fightOver = true;
                                isAttackWin = true;
                            }
                        } else if (buildingDefender.type == MapBuildingType.stronghold) {
                            for (const pioneerId of buildingDefender.defendPioneerIds) {
                                const findPioneer = pioneerDataMgr.getById(pioneerId);
                                if (findPioneer != undefined && findPioneer.hp > 0) {
                                    pioneerDataMgr.loseHp(findPioneer.id, damage);
                                    break;
                                }
                            }
                            if (useData.defenderInfo.hp <= 0) {
                                DataMgr.s.mapBuilding.hideBuilding(buildingDefender.id, attacker.id);
                                fightOver = true;
                                isAttackWin = true;
                            }
                        }
                    }
                }
            } else {
                const damage: number = Math.max(1, defenderAttack - attacker.defend);
                if (damage > 0) {
                    useData.attackerInfo.hp = Math.max(0, attacker.hp - damage);
                    const isDead: boolean = pioneerDataMgr.loseHp(attacker.id, damage);
                    if (isDead) {
                        fightOver = true;
                        isAttackWin = false;
                    }
                }
            }
            attackRound = !attackRound;
            NotificationMgr.triggerEvent(NotificationName.MAP_MEMEBER_FIGHT_DID_ATTACK, useData);

            if (fightOver) {
                // fight end

                let isSelfWin: boolean = false;
                if ((isSelfAttack && isAttackWin) || (!isSelfAttack && !isAttackWin)) {
                    isSelfWin = true;
                }

                let selfKillPioneer: MapPioneerObject = null;
                let killerId: string = null;
                let selfDeadName: string = null;
                if (isSelfWin) {
                    if (isSelfAttack) {
                        if (isAttackBuilding) {
                            if (buildingDefender.winprogress > 0) {
                                const effectProgress = GameMgr.getAfterExtraEffectPropertyByPioneer(
                                    null,
                                    GameExtraEffectType.TREASURE_PROGRESS,
                                    buildingDefender.winprogress
                                );
                                DataMgr.s.userInfo.gainTreasureProgress(effectProgress);
                            }
                        } else {
                            selfKillPioneer = pioneerDefender;
                        }
                    } else {
                        selfKillPioneer = attacker;
                    }
                } else {
                    if (isSelfAttack) {
                        selfDeadName = attacker.name;
                        if (isAttackBuilding) {
                            killerId = buildingDefender.id;
                        } else {
                            killerId = pioneerDefender.id;
                        }
                    } else {
                        if (isAttackBuilding) {
                        } else {
                            selfDeadName = pioneerDefender.name;
                        }
                        killerId = attacker.id;
                    }
                }
                if (selfKillPioneer != null) {
                    // task
                    DataMgr.s.task.pioneerKilled(selfKillPioneer.id);
                    // pioneer win reward
                    DataMgr.s.userInfo.gainExp(selfKillPioneer.winExp);
                    if (selfKillPioneer.winProgress > 0) {
                        const effectProgress = GameMgr.getAfterExtraEffectPropertyByPioneer(
                            null,
                            GameExtraEffectType.TREASURE_PROGRESS,
                            selfKillPioneer.winProgress
                        );
                        DataMgr.s.userInfo.gainTreasureProgress(effectProgress);
                    }
                    if (selfKillPioneer.drop != null) {
                        ItemConfigDropTool.getItemByConfig(selfKillPioneer.drop);
                    }
                    // settle
                    DataMgr.s.settlement.addObj({
                        level: DataMgr.s.userInfo.data.level,
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
                }
                let playerPioneerId: string = null;
                if (isSelfAttack) {
                    playerPioneerId = attacker.id;
                } else {
                    if (isAttackBuilding) {
                    } else {
                        if (pioneerDefender.type == MapPioneerType.player) {
                            playerPioneerId = pioneerDefender.id;
                        }
                    }
                }

                NotificationMgr.triggerEvent(NotificationName.MAP_MEMEBER_FIGHT_END, {
                    fightId: fightId,
                    isSelfWin: isSelfWin,
                    playerPioneerId: playerPioneerId,
                });

                NotificationMgr.triggerEvent(NotificationName.FIGHT_FINISHED, {
                    attacker: {
                        name: useData.attackerInfo.name,
                        avatarIcon: "icon_player_avatar", // todo
                        hp: useData.attackerInfo.hp,
                        hpMax: useData.attackerInfo.hpMax,
                    },
                    defender: {
                        name: useData.defenderInfo.name,
                        avatarIcon: "icon_player_avatar",
                        hp: useData.defenderInfo.hp,
                        hpMax: useData.defenderInfo.hpMax,
                    },
                    attackerIsSelf: isSelfAttack,
                    buildingId: isAttackBuilding ?? buildingDefender.id,
                    position: defenderCenterPositions[0],
                    fightResult: attacker.hp != 0 ? "win" : "lose",
                    rewards: [],
                });

                // status changed
                pioneerDataMgr.changeActionType(attacker.id, MapPioneerActionType.idle);

                if (!isAttackBuilding) {
                    pioneerDataMgr.changeActionType(pioneerDefender.id, MapPioneerActionType.idle);
                }
                clearInterval(intervalId);

                if (killerId != null && selfDeadName != null) {
                    pioneerDataMgr.changeBeKilled(playerPioneerId, killerId);
                    let tips = LanMgr.replaceLanById("106001", [LanMgr.getLanById(selfDeadName)]);
                    UIHUDController.showCenterTip(tips);
                }
                if (fightOverCallback != null) {
                    fightOverCallback(isSelfWin);
                }
            }
        }, 250);
    }
    public setMovingTarget(pioneerId: string, target: MapMemberTargetType, id: string) {
        if (pioneerId != null && id != null) {
            this._movingTargetDataMap.set(pioneerId, { target: target, id: id });
        }
    }

    private _movingTargetDataMap: Map<string, { target: MapMemberTargetType; id: string }> = new Map();
    public constructor() {}

    private _moveMeeted(pioneerId: string, isStay: boolean = true) {
        const pioneerDataMgr: PioneersDataMgr = DataMgr.s.pioneer;
        const pioneer: MapPioneerObject = pioneerDataMgr.getById(pioneerId);
        if (pioneer == undefined) {
            return;
        }
        const movingTargetData = this._movingTargetDataMap.get(pioneer.id);
        let stayBuilding: MapBuildingObject = null;
        if (movingTargetData != null && movingTargetData.target == MapMemberTargetType.building) {
            const templeBuildings = DataMgr.s.mapBuilding.getShowBuildingsNearMapPos(pioneer.stayPos, 2);
            if (templeBuildings.length > 0) {
                // use first find building
                stayBuilding = templeBuildings[0];
            }
            this._movingTargetDataMap.delete(pioneer.id);
        } else {
            stayBuilding = DataMgr.s.mapBuilding.getShowBuildingByMapPos(pioneer.stayPos);
        }
        const currentTimeStamp = new Date().getTime();
        if (stayBuilding == null) {
            let stayPioneers;
            if (movingTargetData != null && movingTargetData.target == MapMemberTargetType.pioneer) {
                // if target pioneer is moving, than try get it from near position;
                stayPioneers = pioneerDataMgr.getByNearPos(pioneer.stayPos, 2, true);
                this._movingTargetDataMap.delete(pioneer.id);
            } else {
                stayPioneers = pioneerDataMgr.getByStayPos(pioneer.stayPos, true);
            }
            let interactPioneer: MapPioneerObject = null;
            for (const stayPioneer of stayPioneers) {
                if (stayPioneer.id != pioneer.id) {
                    interactPioneer = stayPioneer;
                    break;
                }
            }
            if (interactPioneer != null) {
                if (pioneer.type == MapPioneerType.player || interactPioneer.type == MapPioneerType.player) {
                    DataMgr.s.count.addObj_actionPioneer({
                        actionPid: pioneer.id,
                        interactPid: interactPioneer.id,
                    });
                }
                if (pioneer.faction == MapMemberFactionType.friend && interactPioneer.faction == MapMemberFactionType.friend) {
                    if (interactPioneer.type == MapPioneerType.npc) {
                        // get task
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EXPLORED_PIONEER, { id: interactPioneer.id });
                    } else if (interactPioneer.type == MapPioneerType.gangster) {
                        // get more hp
                        const actionTime: number = 3000;
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.addingtroops, currentTimeStamp, actionTime);
                        setTimeout(() => {
                            pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EXPLORED_PIONEER, { id: interactPioneer.id });
                        }, actionTime);
                    } else {
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                    }
                } else if (pioneer.faction == MapMemberFactionType.enemy && interactPioneer.faction == MapMemberFactionType.enemy) {
                    if (isStay) {
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                    }
                } else {
                    // nonfriendly, fight
                    this.fight(pioneer, interactPioneer, null);
                }
            } else {
                if (isStay) {
                    pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                }
            }
        } else {
            // building
            // need changed. use manger to deal with pioneer and building
            if (pioneer.type == MapPioneerType.player) {
                DataMgr.s.count.addObj_actionBuilding({
                    actionPid: pioneer.id,
                    interactBId: stayBuilding.id,
                });
            }
            if (stayBuilding.type == MapBuildingType.city) {
                if (
                    (pioneer.type == MapPioneerType.player &&
                        pioneer.faction == MapMemberFactionType.friend &&
                        stayBuilding.faction == MapMemberFactionType.enemy) ||
                    (pioneer.id == "gangster_3" && pioneer.faction == MapMemberFactionType.enemy && stayBuilding.faction != MapMemberFactionType.enemy)
                ) {
                    const cityBuilding = stayBuilding as MapBuildingMainCityObject;
                    if (cityBuilding.taskObj != null) {
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                        // wait xx
                        // if (
                        //     cityBuilding.taskObj.entrypoint.talk != null &&
                        //     cityBuilding.taskObj.entrypoint.triggerpioneerId != null &&
                        //     cityBuilding.taskObj.entrypoint.triggerpioneerId == pioneer.id
                        // ) {
                        //     if (pioneer.logics.length > 0) {
                        //         // clear logic
                        //         pioneer.logics = [];
                        //         this._savePioneerData();
                        //     }
                        //     // for (const observer of this._observers) {
                        //     //     observer.showGetTaskDialog(cityBuilding.taskObj);
                        //     // }
                        //     DataMgr.s.mapBuilding.buildingClearTask(cityBuilding.id);
                        // }
                    } else {
                        this.fight(pioneer, null, stayBuilding);
                    }
                } else {
                    if (isStay) {
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                    }
                }
            } else if (stayBuilding.type == MapBuildingType.explore) {
                if (pioneer.type == MapPioneerType.player && pioneer.faction == MapMemberFactionType.friend) {
                    const actionTime: number = 3000;
                    pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.exploring, currentTimeStamp, actionTime);
                    setTimeout(() => {
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EXPLORED_BUILDING, { id: stayBuilding.id });
                    }, actionTime);
                } else {
                    if (pioneer.name == "gangster_3") {
                        DataMgr.s.mapBuilding.hideBuilding(stayBuilding.id, pioneer.id);
                    }
                    if (isStay) {
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                    }
                }
            } else if (stayBuilding.type == MapBuildingType.stronghold) {
                // 0-idle 1-fight 2-defend
                let tempAction: number = 0;
                if (pioneer.type == MapPioneerType.player && pioneer.faction == MapMemberFactionType.friend) {
                    if (stayBuilding.faction != MapMemberFactionType.enemy) {
                        tempAction = 2;
                        DataMgr.s.mapBuilding.changeBuildingFaction(stayBuilding.id, MapMemberFactionType.friend);
                        DataMgr.s.mapBuilding.insertDefendPioneer(stayBuilding.id, pioneer.id);
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EXPLORED_BUILDING, { id: stayBuilding.id });
                    } else {
                        tempAction = 1;
                    }
                } else {
                    if (pioneer.id == "gangster_3" && stayBuilding.id == "building_4") {
                        if (stayBuilding.faction != MapMemberFactionType.friend || stayBuilding.defendPioneerIds.length <= 0) {
                            tempAction = 0;
                            DataMgr.s.mapBuilding.hideBuilding(stayBuilding.id, pioneer.id);
                        } else {
                            // wait xx
                            // pioneer.loseHp(Math.floor(pioneer.hp / 2));
                            // pioneer.changeAttack({
                            //     type: AttrChangeType.MUL,
                            //     value: -0.5,
                            // });
                            tempAction = 1;
                        }
                    } else {
                        tempAction = 0;
                    }
                }
                if (tempAction == 0) {
                    if (isStay) {
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                    }
                } else if (tempAction == 1) {
                    this.fight(pioneer, null, stayBuilding);
                } else if (tempAction == 2) {
                    pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.defend);
                }
            } else if (stayBuilding.type == MapBuildingType.resource) {
                if (pioneer.type == MapPioneerType.player && pioneer.faction != MapMemberFactionType.enemy) {
                    // artifact
                    let actionTime: number = 3000;
                    actionTime = GameMgr.getAfterExtraEffectPropertyByPioneer(pioneer.id, GameExtraEffectType.GATHER_TIME, actionTime);
                    if (actionTime <= 0) actionTime = 1;
                    pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.mining, currentTimeStamp, actionTime);
                    setTimeout(() => {
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                        DataMgr.s.mapBuilding.resourceBuildingCollected(stayBuilding.id);
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_MINING_BUILDING, { actionId: pioneer.id, id: stayBuilding.id });
                    }, actionTime);
                } else {
                    if (isStay) {
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
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
                        pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.idle);
                    }
                }
            }
        }
    }

    private _bindPlayerNFT(id: string, linkId: string) {
        const NFT = DataMgr.s.nftPioneer.generateNewNFT(linkId);
        DataMgr.s.pioneer.bindPlayerNFT(id, NFT);
    }

    //------------------------------- notification
    private _onPioneerMoveMeeted(data: { pioneerId: string; isStay: boolean }) {
        this._moveMeeted(data.pioneerId, data.isStay);
    }
    private _onPioneerLogicMove(data: { id: string; logic: MapPioneerLogicObject }) {
        const pioneer = DataMgr.s.pioneer.getById(data.id);
        if (pioneer == undefined) {
            return;
        }
        let targetMapPos: Vec2 = null;
        if (data.logic.type == MapPioneerLogicType.stepmove) {
            // get target pos
            const targetTiledPos = GameMainHelper.instance.tiledMapGetAroundByDirection(pioneer.stayPos, data.logic.stepMove.direction);
            if (targetTiledPos != null) {
                targetMapPos = new Vec2(targetTiledPos.x, targetTiledPos.y);
            }
        } else if (data.logic.type == MapPioneerLogicType.targetmove) {
            targetMapPos = data.logic.targetMove.targetPos;
        } else if (data.logic.type == MapPioneerLogicType.patrol) {
            // randomNextPos
            do {
                const xNegative: boolean = CommonTools.getRandomInt(0, 1) == 0;
                const xChangeNum: number = CommonTools.getRandomInt(0, data.logic.patrol.range);
                const yNegative: boolean = CommonTools.getRandomInt(0, 1) == 0;
                const yChangeNum: number = CommonTools.getRandomInt(0, data.logic.patrol.range);
                let nextPos = data.logic.patrol.originalPos.clone();
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
                targetMapPos = nextPos;
                if (GameMainHelper.instance.tiledMapIsBlock(nextPos)) {
                    // isblock
                    targetMapPos = null;
                } else {
                    const pioneers = DataMgr.s.pioneer.getByStayPos(nextPos, true);
                    if (pioneers.length > 0) {
                        for (const temple of pioneers) {
                            if (temple.type != MapPioneerType.player) {
                                targetMapPos = null;
                                break;
                            }
                        }
                    } else {
                        const buildings = DataMgr.s.mapBuilding.getShowBuildingByMapPos(nextPos);
                        if (buildings != null) {
                            targetMapPos = null;
                        }
                    }
                }
            } while (targetMapPos == null);
        }
        if (targetMapPos != null) {
            const moveData = GameMainHelper.instance.tiledMapGetTiledMovePathByTiledPos(pioneer.stayPos, targetMapPos);
            if (moveData.canMove) {
                DataMgr.s.pioneer.beginMove(pioneer.id, moveData.path);
            }
        }
    }
    private _onPioneerRebirthBegin(data: { id: string }) {
        const pioneer = DataMgr.s.pioneer.getById(data.id) as MapPlayerPioneerObject;
        if (!!pioneer) {
            let rebirthMapPos = null;
            const mainCity = DataMgr.s.mapBuilding.getBuildingById("building_1");
            if (mainCity != null && mainCity.faction != MapMemberFactionType.enemy) {
                rebirthMapPos = mainCity.stayMapPositions[1];
            } else {
                if (pioneer.killerId != null && pioneer.killerId.includes("building")) {
                    const killerBuilding = DataMgr.s.mapBuilding.getBuildingById(pioneer.killerId);
                    if (killerBuilding != null) {
                        rebirthMapPos = new Vec2(killerBuilding.stayMapPositions[0].x - 1, killerBuilding.stayMapPositions[0].y);
                    }
                } else {
                    rebirthMapPos = new Vec2(pioneer.stayPos.x - 1, pioneer.stayPos.y);
                }
            }
            let rebirthHp: number = Math.max(1, Math.min(DataMgr.s.item.getObj_item_count(ResourceCorrespondingItem.Troop), pioneer.hpMax));
            ItemMgr.subItem(ResourceCorrespondingItem.Troop, rebirthHp);
            DataMgr.s.pioneer.rebirth(data.id, rebirthHp, rebirthMapPos);
        }
    }
}
