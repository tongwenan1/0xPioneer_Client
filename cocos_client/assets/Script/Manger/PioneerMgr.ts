import { CurveRange, Vec2 } from "cc";
import CommonTools from "../Tool/CommonTools";
import { GameExtraEffectType, MapMemberFactionType, MapMemberTargetType, ResourceCorrespondingItem } from "../Const/ConstDefine";
import { ArtifactMgr, ItemMgr, LanMgr, PioneerDevelopMgr, SettlementMgr, TaskMgr, UserInfoMgr } from "../Utils/Global";
import { UIHUDController } from "../UI/UIHUDController";
import NotificationMgr from "../Basic/NotificationMgr";
import { MapBuildingType } from "../Const/BuildingDefine";
import { CountType } from "../Const/Count";
import { EventConfigData } from "../Const/Event";
import EventConfig from "../Config/EventConfig";
import { NotificationName } from "../Const/Notification";
import GameMainHelper from "../Game/Helper/GameMainHelper";

import {
    MapPioneerType,
    MapPioneerActionType,
    MapPioneerAttributesChangeModel,
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
        this._initData();
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_MOVE_MEETTED, this._onPioneerMoveMeeted, this);
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_LOGIC_MOVE, this._onPioneerLogicMove, this);
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_REBIRTH_BEGIN, this._onPioneerRebirthBegin, this);

        const originalPioneer = DataMgr.s.pioneer.getCurrentPlayer();
        if (!!originalPioneer && originalPioneer.NFTId == null) {
            this._bindPlayerNFT(originalPioneer.id, originalPioneer.NFTInitLinkId);
        }
    }

    public pioneerHealHpToMax(pioneerId: string) {
        const costTroops: number = DataMgr.s.pioneer.gainHp(pioneerId, ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Troop));
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

    public eventFight(
        attackerId: string,
        enemyId: string,
        temporaryAttributes: Map<string, MapPioneerAttributesChangeModel>,
        fightOverCallback: (succeed: boolean) => void
    ) {
        // xx wait
        // const attacker = this.getPioneerById(attackerId);
        // const enemy = this.getPioneerById(enemyId);
        // if (attacker != null && enemy != null) {
        //     attacker.actionType = MapPioneerActionType.fighting;
        //     for (const observer of this._observers) {
        //         observer.pioneerActionTypeChanged(attacker.id, attacker.actionType, attacker.actionEndTimeStamp);
        //     }
        //     const fightId: string = new Date().getTime().toString();
        //     let attackerAttack = attacker.attack;
        //     let attackerDefend = attacker.defend;
        //     let enemyId = enemy.id;
        //     let isBuilding = false;
        //     let enemyName = enemy.name;
        //     let enemyHp = enemy.hp;
        //     let enemyHpMax = enemy.hpMax;
        //     let enemyAttack = enemy.attack;
        //     let enemyDefend = enemy.defend;
        //     // gain temporaryAttributes
        //     temporaryAttributes.forEach((model: MapPioneerAttributesChangeModel, key: string) => {
        //         const id = key.split("|")[0];
        //         const type = parseInt(key.split("|")[1]);
        //         if (id == enemyId) {
        //             if (type == 1) {
        //                 // hp
        //                 if (model.type == AttrChangeType.ADD) {
        //                     enemyHpMax += model.value;
        //                 } else if (model.type == AttrChangeType.MUL) {
        //                     enemyHpMax += enemy.originalHpMax * model.value;
        //                 }
        //                 enemyHpMax = Math.max(1, enemyHpMax);
        //                 enemyHp = enemyHpMax;
        //             } else if (type == 2) {
        //                 // attack
        //                 if (model.type == AttrChangeType.ADD) {
        //                     enemyAttack += model.value;
        //                 } else if (model.type == AttrChangeType.MUL) {
        //                     enemyAttack += enemy.originalAttack * model.value;
        //                 }
        //             }
        //         } else if (id == attackerId) {
        //             if (type == 2) {
        //                 if (model.type == AttrChangeType.ADD) {
        //                     attackerAttack += model.value;
        //                 } else if (model.type == AttrChangeType.MUL) {
        //                     attackerAttack += attacker.originalAttack * model.value;
        //                 }
        //             }
        //         }
        //     });
        //     for (const observer of this._observers) {
        //         if (observer.beginFight != null) {
        //             observer.beginFight(
        //                 fightId,
        //                 { id: attacker.id, name: attacker.name, hp: attacker.hp, hpMax: attacker.hpMax },
        //                 { id: enemyId, isBuilding: isBuilding, name: enemyName, hp: enemyHp, hpMax: enemyHpMax },
        //                 attacker.faction == MapMemberFactionType.friend,
        //                 [attacker.stayPos]
        //             );
        //         }
        //     }
        //     let selfAttack: boolean = true;
        //     const intervalId = setInterval(() => {
        //         let fightOver: boolean = false;
        //         let deadPioneer = null;
        //         let killer = null;
        //         if (selfAttack) {
        //             const damage = Math.max(1, attackerAttack - enemyDefend);
        //             if (damage > 0) {
        //                 enemyHp = Math.max(0, enemyHp - damage);
        //                 if (enemyHp <= 0) {
        //                     fightOver = true;
        //                     deadPioneer = enemy;
        //                     killer = attacker;
        //                 }
        //             }
        //         } else {
        //             const damage = Math.max(1, enemyAttack - attackerDefend);
        //             if (damage > 0) {
        //                 attacker.loseHp(damage);
        //                 for (const observe of this._observers) {
        //                     observe.pioneerLoseHp(attacker.id, damage);
        //                 }
        //                 if (attacker.hp <= 0) {
        //                     this.hidePioneer(attacker.id);
        //                     fightOver = true;
        //                     deadPioneer = attacker;
        //                     killer = enemy;
        //                 }
        //             }
        //         }
        //         selfAttack = !selfAttack;
        //         for (const observer of this._observers) {
        //             if (observer.fightDidAttack != null) {
        //                 observer.fightDidAttack(
        //                     fightId,
        //                     { id: attacker.id, name: attacker.name, hp: attacker.hp, hpMax: attacker.hpMax },
        //                     { id: attacker.id, isBuilding: isBuilding, name: enemyName, hp: enemyHp, hpMax: enemyHpMax },
        //                     attacker.faction == MapMemberFactionType.friend,
        //                     [attacker.stayPos]
        //                 );
        //             }
        //         }
        //         if (fightOver) {
        //             if (deadPioneer == enemy && deadPioneer.winexp > 0) {
        //                 // win fight, add exp
        //                 UserInfoMgr.exp += enemy.winexp;
        //             }
        //             for (const observer of this._observers) {
        //                 if (observer.endFight != null) {
        //                     observer.endFight(fightId, true, deadPioneer instanceof MapPioneerModel, deadPioneer.id, deadPioneer == enemy, attacker.id);
        //                 }
        //             }
        //             NotificationMgr.triggerEvent(NotificationName.FIGHT_FINISHED, {
        //                 attacker: {
        //                     name: attacker.name,
        //                     avatarIcon: "icon_player_avatar", // todo
        //                     hp: attacker.hp,
        //                     hpMax: attacker.hpMax,
        //                 },
        //                 defender: {
        //                     name: enemy.name,
        //                     avatarIcon: "icon_player_avatar",
        //                     hp: enemyHp,
        //                     hpMax: enemyHpMax,
        //                 },
        //                 attackerIsSelf: attacker.faction == MapMemberFactionType.friend,
        //                 buildingId: null,
        //                 position: attacker.stayPos,
        //                 fightResult: attacker.hp != 0 ? "win" : "lose",
        //                 rewards: [],
        //             });
        //             // status changed
        //             attacker.actionType = MapPioneerActionType.idle;
        //             for (const observer of this._observers) {
        //                 observer.pioneerActionTypeChanged(attacker.id, attacker.actionType, attacker.actionEndTimeStamp);
        //             }
        //             clearInterval(intervalId);
        //             this._savePioneerData();
        //             if (deadPioneer instanceof MapPlayerPioneerModel) {
        //                 // player dead
        //                 deadPioneer.rebirthCountTime = 10;
        //                 deadPioneer.killerId = killer.id;
        //                 this._savePioneerData();
        //                 // useLanMgr
        //                 let tips = LanMgr.replaceLanById("106001", [LanMgr.getLanById(deadPioneer.name)]);
        //                 // let tips = LanMgr.getLanById(deadPioneer.name) + " is dead, please wait for the resurrection";
        //                 UIHUDController.showCenterTip(tips);
        //             }
        //             if (fightOverCallback != null) {
        //                 fightOverCallback(enemyHp <= 0);
        //             }
        //         }
        //     }, 250);
        // }
    }
    public setMovingTarget(pioneerId: string, target: MapMemberTargetType, id: string) {
        if (pioneerId != null && id != null) {
            this._movingTargetDataMap.set(pioneerId, { target: target, id: id });
        }
    }

    public _initData() {}
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
                    this._fight(pioneer, interactPioneer, null);
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
                        this._fight(pioneer, null, stayBuilding);
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
                    this._fight(pioneer, null, stayBuilding);
                } else if (tempAction == 2) {
                    pioneerDataMgr.changeActionType(pioneerId, MapPioneerActionType.defend);
                }
            } else if (stayBuilding.type == MapBuildingType.resource) {
                if (pioneer.type == MapPioneerType.player && pioneer.faction != MapMemberFactionType.enemy) {
                    // artifact
                    const artifactEff = ArtifactMgr.getEffectiveEffect(UserInfoMgr.artifactStoreLevel);
                    let artifactGather = 0;
                    if (artifactEff.has(GameExtraEffectType.GATHER_TIME)) {
                        artifactGather = artifactEff.get(GameExtraEffectType.GATHER_TIME);
                    }

                    let actionTime: number = 3000;
                    // artifact eff
                    actionTime = Math.floor(actionTime - actionTime * artifactGather);
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

    private _fight(attacker: MapPioneerObject, pioneerDefender: MapPioneerObject, buildingDefender: MapBuildingObject, isEventFight: boolean = false) {
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
                            UserInfoMgr.explorationValue += buildingDefender.winprogress;
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
                    TaskMgr.pioneerKilled(selfKillPioneer.id);
                    // pioneer win reward
                    UserInfoMgr.exp += selfKillPioneer.winExp;
                    UserInfoMgr.explorationValue += selfKillPioneer.winProgress;
                    if (selfKillPioneer.drop != null) {
                        ItemConfigDropTool.getItemByConfig(selfKillPioneer.drop);
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
            }
        }, 250);
    }

    private _bindPlayerNFT(id: string, linkId: string ) {
        const NFT = PioneerDevelopMgr.generateNewNFT(linkId);
        DataMgr.s.pioneer.bindPlayerNFT(id, NFT.uniqueId);
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
            let rebirthHp: number = Math.max(1, Math.min(ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Troop), pioneer.hpMax));
            ItemMgr.subItem(ResourceCorrespondingItem.Troop, rebirthHp);
            DataMgr.s.pioneer.rebirth(data.id, rebirthHp, rebirthMapPos);
        }
    }
}
