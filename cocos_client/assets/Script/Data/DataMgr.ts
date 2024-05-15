import { Vec2 } from "cc";
import NotificationMgr from "../Basic/NotificationMgr";
import { InnerBuildingType, MapBuildingType } from "../Const/BuildingDefine";
import { AttrChangeType, DataMgrResData, GameExtraEffectType, GetPropData, MapMemberFactionType, ResourceCorrespondingItem } from "../Const/ConstDefine";
import ItemData from "../Const/Item";
import { NotificationName } from "../Const/Notification";
import {
    MapPioneerActionType,
    MapPioneerAttributesChangeModel,
    MapPioneerEventAttributesChangeType,
    MapPioneerEventStatus,
    MapPioneerObject,
    MapPioneerType,
    MapPlayerPioneerObject,
} from "../Const/PioneerDefine";
import { c2s_user, s2c_user, share } from "../Net/msg/WebsocketMsg";
import CLog from "../Utils/CLog";
import { RunData } from "./RunData";
import { SaveData } from "./SaveData";
import { MapBuildingMainCityObject, MapBuildingWormholeObject } from "../Const/MapBuilding";
import { GameMgr, LanMgr, PioneerMgr } from "../Utils/Global";
import NetGlobalData from "./Save/Data/NetGlobalData";
import { NetworkMgr } from "../Net/NetworkMgr";

export class DataMgr {
    public static r: RunData;
    public static s: SaveData;
    public static socketSendData: Map<string, DataMgrResData>;

    public static async init(): Promise<boolean> {
        DataMgr.r = new RunData();
        DataMgr.s = new SaveData();
        DataMgr.socketSendData = new Map();
        return true;
    }

    public static async save() {
        await this.s.save();
    }
    ///////////////// websocket
    public static onmsg = (e: any) => {
        CLog.debug("DataMgr/onmsg: e => " + JSON.stringify(e));
    };

    public static enter_game_res = async (e: any) => {
        let p: s2c_user.Ienter_game_res = e.data;
        if (p.res === 1) {
            if (p.data) {
                // set new global data
                NetGlobalData.userInfo = p.data.info.sinfo;
                NetGlobalData.innerBuildings = p.data.info.buildings;
                NetGlobalData.storehouse = p.data.info.storehouse;
                NetGlobalData.usermap = p.data.info.usermap;
                NetGlobalData.nfts = p.data.info.nfts;
                // load save data
                await DataMgr.s.load(this.r.wallet.addr);

                NotificationMgr.triggerEvent(NotificationName.USER_LOGIN_SUCCEED);
            }
            // reconnect
            if (DataMgr.r.reconnects > 0) {
                DataMgr.r.reconnects = 0;
            }
        }
    };
    public static player_exp_change = (e: any) => {
        const p: s2c_user.Iplayer_exp_change = e.data;
        DataMgr.s.userInfo.data.exp = p.newExp;
        if (p.newLevel != null) {
            DataMgr.s.userInfo.data.level = p.newLevel;
        }
        NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_EXP, { exp: p.addExp });
    };
    public static player_treasure_progress_change = (e: any) => {
        const p: s2c_user.Iplayer_treasure_progress_change = e.data;
        DataMgr.s.userInfo.data.exploreProgress = p.newProgress;
        NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_TREASURE_PROGRESS);
    };
    //------------------------------------- item
    public static storhouse_change = (e: any) => {
        const p: s2c_user.Istorhouse_change = e.data;
        for (const item of p.iteminfo) {
            const change = new ItemData(item.itemConfigId, item.count);
            change.addTimeStamp = item.addTimeStamp;
            DataMgr.s.item.countChanged(change);
        }
    };
    public static player_item_use_res = (e: any) => {
        const p: s2c_user.Iplayer_item_use_res = e.data;
        if (p.res === 1) {
        }
    };

    //------------------------------------- inner building
    public static player_building_levelup_res = (e: any) => {
        const p: s2c_user.Iplayer_building_levelup_res = e.data;
        if (p.res !== 1) {
            return;
        }
        DataMgr.s.userInfo.beginInnerBuildingUpgrade(p.data.id as InnerBuildingType, p.data.upgradeCountTime, p.data.upgradeTotalTime);
    };

    //------------------------------------- map
    public static player_pioneer_change_show_res = (e: any) => {
        const p: s2c_user.Iplayer_pioneer_change_show_res = e.data;
        if (p.res !== 1) {
            return;
        }
        const pioneer = DataMgr.s.pioneer.getById(p.pioneerId);
        if (pioneer == undefined) {
            return;
        }
        if (pioneer.show == p.show) {
            return;
        }
        pioneer.show = p.show;

        if (pioneer.type == MapPioneerType.player) {
            const player = pioneer as MapPlayerPioneerObject;
            if (!!player && player.NFTId == null) {
                PioneerMgr.bindPlayerNFT(player.id);
            }
        }

        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_SHOW_CHANGED, { id: p.pioneerId, show: p.show });
    };
    public static player_actiontype_change = (e: any) => {
        const p: s2c_user.Iplayer_actiontype_change = e.data;
        if (p.res !== 1) {
            return;
        }
        DataMgr.s.pioneer.changeActionType(p.data.pioneerId, p.data.actiontype as MapPioneerActionType);
    };
    public static player_move_res = (e: any) => {
        const p: s2c_user.Iplayer_move_res = e.data;
        if (p.res !== 1) {
            return;
        }
        if (!DataMgr.socketSendData.has("player_move_res")) {
            return;
        }
        const localData: s2c_user.Iplayer_move_res_local_data = DataMgr.socketSendData.get("player_move_res") as s2c_user.Iplayer_move_res_local_data;
        DataMgr.s.pioneer.beginMove(localData.pioneerId, localData.movePath);
    };
    public static player_event_res = (e: any) => {
        const p: s2c_user.Iplayer_event_res = e.data;
        if (p.res !== 1) {
            return;
        }
    };

    //------------------------------------- nft
    public static player_bind_nft_res = (e: any) => {
        const p: s2c_user.Iplayer_bind_nft_res = e.data;
        if (p.res !== 1) {
            return;
        }
        const newNFTObj = DataMgr.s.nftPioneer.NFTGetNew(p.nftData);
        DataMgr.s.pioneer.bindPlayerNFT(p.pioneerData.id, newNFTObj);

        // bind succeed then set defender
        let emptyIndex: number = -1;
        const defenderIds: string[] = DataMgr.s.userInfo.data.wormholeDefenderIds;
        for (let i = 0; i < defenderIds.length; i++) {
            if (defenderIds[i] == "") {
                emptyIndex = i;
                break;
            }
        }
        if (emptyIndex >= 0) {
            NetworkMgr.websocketMsg.player_wormhole_set_defender({
                pioneerId: p.pioneerData.id,
                index: emptyIndex,
            });
        }
    };
    public static player_nft_lvlup_res = (e: any) => {
        const p: s2c_user.Iplayer_nft_lvlup_res = e.data;
        if (p.res !== 1) {
            return;
        }
        DataMgr.s.nftPioneer.NFTLevelUp(p.nftData);
    };
    public static player_nft_rankup_res = (e: any) => {
        const p: s2c_user.Iplayer_nft_rankup_res = e.data;
        if (p.res !== 1) {
            return;
        }
        DataMgr.s.nftPioneer.NFTRankUp(p.nftData);
    };

    //------------------------------------- wormhole
    public static player_wormhole_set_defender_res = (e: any) => {
        const p: s2c_user.Iplayer_wormhole_set_defender_res = e.data;
        if (p.res !== 1) {
            return;
        }
        for (const key in p.defender) {
            DataMgr.s.userInfo.data.wormholeDefenderIds[parseInt(key)] = p.defender[key];
        }
        console.log("exce w: " + JSON.stringify(DataMgr.s.userInfo.data.wormholeDefenderIds));
    };
    public static player_wormhole_set_attacker_res = (e: any) => {
        const p: s2c_user.Iplayer_wormhole_set_attacker_res = e.data;
        if (p.res !== 1) {
            return;
        }
        let buildingId: string = null;
        const useAttacker = p.attacker;
        for (const key in useAttacker) {
            const temp = useAttacker[key];
            const building = DataMgr.s.mapBuilding.getBuildingById(temp.buildingId);
            if (building == undefined) {
                continue;
            }
            building.defendPioneerIds[parseInt(key)] = temp.pioneerId;

            buildingId = building.id;
        }
        // currentBuilding
        const buildingData = DataMgr.s.mapBuilding.getBuildingById(buildingId);
        if (buildingData.type == MapBuildingType.wormhole) {
            const wormholeBuilding = buildingData as MapBuildingWormholeObject;
            if (!!wormholeBuilding) {
                let canWormholeAttack: boolean = true;
                for (let i = 0; i < 3; i++) {
                    if (buildingData.defendPioneerIds[i] == "" || buildingData.defendPioneerIds[i] == undefined || buildingData.defendPioneerIds[i] == null) {
                        canWormholeAttack = false;
                        break;
                    }
                }
                if (canWormholeAttack) {
                    wormholeBuilding.wormholdCountdownTime = 30;
                    DataMgr.s.mapBuilding.saveObj_building();
                }
            }
        }
        console.log("exce defner: " + JSON.stringify(DataMgr.s.mapBuilding.getBuildingById(buildingId).defendPioneerIds));
        NotificationMgr.triggerEvent(NotificationName.BUILDING_INSERT_DEFEND_PIONEER);
        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EXPLORED_BUILDING, { id: buildingId });
    };
    public static player_wormhole_fight_res = (e: any) => {
        const p: s2c_user.Iplayer_wormhole_fight_res = e.data;
        if (p.res !== 1) {
            return;
        }
        const building = DataMgr.s.mapBuilding.getBuildingById(p.buildingId);
        if (building == null) {
            return;
        }
        const tempIds = building.defendPioneerIds.slice();
        for (const pioneerId of tempIds) {
            PioneerMgr.pioneerToIdle(pioneerId);
        }
        NotificationMgr.triggerEvent(NotificationName.FIGHT_FINISHED, {
            attacker: {
                name: DataMgr.s.userInfo.data.name,
                avatarIcon: "icon_player_avatar", // todo
                hp: p.fightResult ? 100 : 0,
                hpMax: 100,
            },
            defender: {
                name: p.defenderWallet,
                avatarIcon: "icon_player_avatar",
                hp: 50,
                hpMax: 50,
            },
            attackerIsSelf: true,
            buildingId: null,
            position: building.stayMapPositions,
            fightResult: p.fightResult ? "win" : "lose",
            rewards: [],
        });
    };

    //----------------------------------- psyc
    public static fetch_user_psyc_res = (e: any) => {
        const p: s2c_user.Ifetch_user_psyc_res = e.data;
        if (p.res !== 1) {
            return;
        }
        DataMgr.s.userInfo.data.energyDidGetTimes += 1;
    };

    public static get_pioneers_res = (e: any) => {
        let p: s2c_user.Iget_pioneers_res = e.data;
        // TODO: update all pioneers data
    };

    public static player_talk_select_res = (e: any) => {};
    public static player_gather_res = (e: any) => {
        if (DataMgr.socketSendData.has("player_gather_res")) {
            const data: s2c_user.Iplayer_gather_res = DataMgr.socketSendData.get("player_gather_res") as s2c_user.Iplayer_gather_res;
            const { pioneerId, buildingId } = data;
            const currentTimeStamp = new Date().getTime();
            let actionTime: number = 3000;
            actionTime = GameMgr.getAfterExtraEffectPropertyByPioneer(pioneerId, GameExtraEffectType.GATHER_TIME, actionTime);
            if (actionTime <= 0) actionTime = 1;
            DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.mining, currentTimeStamp, actionTime);
            setTimeout(() => {
                DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.idle);
                DataMgr.s.mapBuilding.resourceBuildingCollected(buildingId);
                NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_MINING_BUILDING, { actionId: pioneerId, id: buildingId });
            }, actionTime);
        }
    };
    public static player_explore_res = (e: any) => {
        if (DataMgr.socketSendData.has("player_explore_res")) {
            const data: s2c_user.Iplayer_explore_res = DataMgr.socketSendData.get("player_explore_res") as s2c_user.Iplayer_explore_res;
            const { pioneerId, isExporeBuilding, exploreId, actionType } = data;
            const currentTimeStamp = new Date().getTime();
            if (isExporeBuilding) {
                if (actionType == MapPioneerActionType.defend) {
                    DataMgr.s.pioneer.changeActionType(pioneerId, actionType);
                    DataMgr.s.mapBuilding.changeBuildingFaction(exploreId, MapMemberFactionType.friend);
                    DataMgr.s.mapBuilding.insertDefendPioneer(exploreId, pioneerId);
                    NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EXPLORED_BUILDING, { id: exploreId });
                } else if (actionType == MapPioneerActionType.exploring) {
                    const actionTime: number = 3000;
                    DataMgr.s.pioneer.changeActionType(pioneerId, actionType, currentTimeStamp, actionTime);
                    setTimeout(() => {
                        DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.idle);
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EXPLORED_BUILDING, { id: exploreId });
                    }, actionTime);
                }
            } else {
                if (actionType == MapPioneerActionType.addingtroops) {
                    const actionTime: number = 3000;
                    DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.addingtroops, currentTimeStamp, actionTime);
                    setTimeout(() => {
                        DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.idle);
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EXPLORED_PIONEER, { id: exploreId });
                    }, actionTime);
                } else {
                    DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.idle);
                    NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EXPLORED_PIONEER, { id: exploreId });
                }
            }
        }
    };
    public static player_fight_res = (e: any) => {
        if (DataMgr.socketSendData.has("player_fight_res")) {
            const data: s2c_user.Iplayer_fight_res = DataMgr.socketSendData.get("player_fight_res") as s2c_user.Iplayer_fight_res;

            const {
                isAttackBuilding,
                isSelfAttack,
                attacker,
                pioneerDefender,
                buildingDefender,
                isEventFight,
                eventCenterPositions,
                temporaryAttributes,
                fightOverCallback,
            } = data;

            const pioneerDataMgr = DataMgr.s.pioneer;
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
            // event deal
            if (isEventFight) {
                if (eventCenterPositions != null) {
                    defenderCenterPositions = eventCenterPositions;
                }
                if (temporaryAttributes != null) {
                    temporaryAttributes.forEach((value: MapPioneerAttributesChangeModel, key: string) => {
                        if (key == defenderId) {
                            if (value.method == AttrChangeType.ADD) {
                                if (value.type == MapPioneerEventAttributesChangeType.HP) {
                                    defenderHpMax += value.value;
                                } else if (value.type == MapPioneerEventAttributesChangeType.ATTACK) {
                                    defenderAttack += value.value;
                                }
                            } else if (value.method == AttrChangeType.MUL) {
                                if (value.type == MapPioneerEventAttributesChangeType.HP) {
                                    defenderHpMax += defenderHpMax * value.value;
                                } else if (value.type == MapPioneerEventAttributesChangeType.ATTACK) {
                                    defenderAttack += defenderAttack * value.value;
                                }
                            }
                            defenderHp = defenderHpMax;
                        }
                    });
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
                    let useAttack: number = attacker.attack;
                    if (isEventFight) {
                        if (temporaryAttributes != null) {
                            temporaryAttributes.forEach((value: MapPioneerAttributesChangeModel, key: string) => {
                                if (key == attacker.id) {
                                    if (value.type == MapPioneerEventAttributesChangeType.HP) {
                                        if (value.method == AttrChangeType.ADD) {
                                            useAttack += value.value;
                                        } else if (value.method == AttrChangeType.MUL) {
                                            useAttack += useAttack * value.value;
                                        }
                                    }
                                }
                            });
                        }
                    }
                    const damage: number = Math.max(1, useAttack - defenderDefned);
                    if (damage > 0) {
                        useData.defenderInfo.hp = Math.max(0, useData.defenderInfo.hp - damage);
                        if (isEventFight) {
                            if (useData.defenderInfo.hp <= 0) {
                                fightOver = true;
                                isAttackWin = true;
                            }
                        } else {
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
                        if (selfKillPioneer.winProgress > 0) {
                            const effectProgress = GameMgr.getAfterExtraEffectPropertyByPioneer(
                                null,
                                GameExtraEffectType.TREASURE_PROGRESS,
                                selfKillPioneer.winProgress
                            );
                        }
                        if (selfKillPioneer.drop != null) {
                            // upload resource changed fight
                            NotificationMgr.triggerEvent(NotificationName.GAME_SHOW_PROP_GET, { props: selfKillPioneer.drop });
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
                        NotificationMgr.triggerEvent(NotificationName.GAME_SHOW_CENTER_TIP, {
                            tip: LanMgr.replaceLanById("106001", [LanMgr.getLanById(selfDeadName)]),
                        });
                    }
                    if (fightOverCallback != null) {
                        fightOverCallback(isSelfWin);
                    }
                }
            }, 250);
        }
    };
    public static player_event_select_res = (e: any) => {
        if (DataMgr.socketSendData.has("player_event_select_res")) {
            const data: s2c_user.player_event_select_res = DataMgr.socketSendData.get("player_event_select_res") as s2c_user.player_event_select_res;
            const pioneerId = data.pioneerId;
            const currentEvent = data.eventData;
            const buildingId = data.buildingId;
            const pioneer = DataMgr.s.pioneer.getById(pioneerId);
            if (pioneer == undefined) {
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
    };

    public static player_treasure_open_res = (e: any) => {
        const key: string = "player_treasure_open_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_treasure_open_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_treasure_open_res;
            // upload resource changed treasure-open
            if (data.items != null && data.items.length > 0) {
                DataMgr.s.item.addObj_item(data.items);
            }
            if (data.artifacts != null && data.artifacts.length > 0) {
                DataMgr.s.artifact.addObj_artifact(data.artifacts);
            }
            if (data.subItems != null) {
                for (const temple of data.subItems) {
                    DataMgr.s.item.subObj_item(temple.itemConfigId, temple.count);
                }
            }
            DataMgr.s.userInfo.getExplorationReward(data.boxId);
        }
    };
    public static player_point_treasure_open_res = (e: any) => {
        const key: string = "player_point_treasure_open_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_point_treasure_open_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_point_treasure_open_res;
            // upload resource changed point_treasure-open
            if (data.items != null && data.items.length > 0) {
                DataMgr.s.item.addObj_item(data.items);
            }
            if (data.artifacts != null && data.artifacts.length > 0) {
                DataMgr.s.artifact.addObj_artifact(data.artifacts);
            }
            if (data.subItems != null) {
                for (const temple of data.subItems) {
                    DataMgr.s.item.subObj_item(temple.itemConfigId, temple.count);
                }
            }
            DataMgr.s.userInfo.getPointExplorationReward(data.boxId);
        }
    };
    public static player_artifact_equip_res = (e: any) => {
        const key: string = "player_artifact_equip_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_artifact_equip_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_artifact_equip_res;
            DataMgr.s.artifact.changeObj_artifact_effectIndex(data.artifactId, data.effectIndex);
        }
    };
    public static player_artifact_remove_res = (e: any) => {
        const key: string = "player_artifact_remove_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_artifact_remove_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_artifact_remove_res;
            DataMgr.s.artifact.changeObj_artifact_effectIndex(data.artifactId, data.effectIndex);
        }
    };

    public static player_get_auto_energy_res = (e: any) => {
        const key: string = "player_get_auto_energy_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_get_auto_energy_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_get_auto_energy_res;
            // upload resource changed inner_building-get_auto_energy
            DataMgr.s.item.addObj_item([new ItemData(ResourceCorrespondingItem.Energy, data.num)]);
            DataMgr.s.userInfo.generateEnergyGetted();
        }
    };
    public static player_generate_energy_res = (e: any) => {
        const key: string = "player_generate_energy_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_generate_energy_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_generate_energy_res;
            for (const temple of data.subItems) {
                DataMgr.s.item.subObj_item(temple.itemConfigId, temple.count);
            }
            // upload resource changed inner_building-generate_energy
            DataMgr.s.item.addObj_item([new ItemData(ResourceCorrespondingItem.Energy, data.num)]);
        }
    };
    public static player_generate_troop_res = (e: any) => {
        const key: string = "player_generate_troop_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_generate_troop_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_generate_troop_res;
            for (const temple of data.subItems) {
                DataMgr.s.item.subObj_item(temple.itemConfigId, temple.count);
            }
            DataMgr.s.userInfo.beginGenerateTroop(data.time, data.num);
        }
    };
    public static player_building_delegate_nft_res = (e: any) => {
        const key: string = "player_building_delegate_nft_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_building_delegate_nft_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_building_delegate_nft_res;
            DataMgr.s.nftPioneer.NFTChangeWork(data.nftId, data.innerBuildingId as InnerBuildingType);
        }
    };

    public static player_nft_skill_learn_res = (e: any) => {
        const key: string = "player_nft_skill_learn_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_nft_skill_learn_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_nft_skill_learn_res;
            for (const cost of data.subItems) {
                DataMgr.s.item.subObj_item(cost.itemConfigId, cost.count);
            }
            DataMgr.s.nftPioneer.NFTLearnSkill(data.nftId, data.skillId);
        }
    };
    public static player_nft_skill_forget_res = (e: any) => {
        const key: string = "player_nft_skill_forget_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_nft_skill_forget_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_nft_skill_forget_res;
            DataMgr.s.nftPioneer.NFTForgetSkill(data.nftId, data.skillIndex);
        }
    };

    public static player_heat_value_change_res = (e: any) => {
        const data: s2c_user.Iplayer_heat_value_change_res = e.data;
        DataMgr.s.userInfo.data.heatValue.currentHeatValue = data.currentHeatValue;
    };
    public static player_world_treasure_lottery_res = (e: any) => {
        const data: s2c_user.Iplayer_world_treasure_lottery_res = e.data;
        // upload resource changed player_world_treasure_lottery
        DataMgr.s.item.addObj_item([new ItemData(data.itemId, data.num)]);
    };

    public static player_rookie_finish_res = (e: any) => {
        DataMgr.s.userInfo.finishRookie();
        // DataMgr.s.task.gameStarted();
        // DataMgr.s.item.addObj_item(
        //     [
        //         new ItemData(ResourceCorrespondingItem.Energy, 2000),
        //         new ItemData(ResourceCorrespondingItem.Food, 2000),
        //         new ItemData(ResourceCorrespondingItem.Stone, 2000),
        //         new ItemData(ResourceCorrespondingItem.Wood, 2000),
        //         new ItemData(ResourceCorrespondingItem.Troop, 2000),
        //     ],
        //     false
        // );
    };

    ///////////////// websocketTempData
    public static setTempSendData(key: string, data: DataMgrResData) {
        DataMgr.socketSendData.set(key, data);
    }
}
