import { Vec2 } from "cc";
import NotificationMgr from "../Basic/NotificationMgr";
import { InnerBuildingType, MapBuildingType } from "../Const/BuildingDefine";
import { AttrChangeType, DataMgrResData, GameExtraEffectType, GetPropData, MapMemberFactionType, ResourceCorrespondingItem } from "../Const/ConstDefine";
import ItemData, { ItemConfigType, ItemType } from "../Const/Item";
import { NotificationName } from "../Const/Notification";
import {
    MapNpcPioneerObject,
    MapPioneerActionType,
    MapPioneerAttributesChangeModel,
    MapPioneerEventAttributesChangeType,
    MapPioneerObject,
    MapPioneerType,
} from "../Const/PioneerDefine";
import { c2s_user, s2c_user, share } from "../Net/msg/WebsocketMsg";
import CLog from "../Utils/CLog";
import { RunData } from "./RunData";
import { SaveData } from "./SaveData";
import { MapBuildingMainCityObject, MapBuildingWormholeObject } from "../Const/MapBuilding";
import { GameMgr, LanMgr, PioneerMgr } from "../Utils/Global";
import NetGlobalData from "./Save/Data/NetGlobalData";
import { NetworkMgr } from "../Net/NetworkMgr";
import ArtifactData from "../Model/ArtifactData";
import { UIHUDController } from "../UI/UIHUDController";
import UIPanelManger from "../Basic/UIPanelMgr";
import { UIName } from "../Const/ConstUIDefine";
import { TreasureGettedUI } from "../UI/TreasureGettedUI";
import CommonTools from "../Tool/CommonTools";
import ItemConfig from "../Config/ItemConfig";
import { ItemGettedUI } from "../UI/ItemGettedUI";
import EventConfig from "../Config/EventConfig";
import { EVENT_STEPEND_DATA } from "../Const/Event";
import { TilePos } from "../Game/TiledMap/TileTool";
import GameMainHelper from "../Game/Helper/GameMainHelper";

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
                NetGlobalData.artifacts = p.data.info.artifact;
                NetGlobalData.usermap = p.data.info.usermap;
                NetGlobalData.nfts = p.data.info.nfts;
                NetGlobalData.mapBuildings = p.data.info.mapbuilding;
                NetGlobalData.tasks = p.data.info.tasks;
                NetGlobalData.shadows = p.data.info.shadows;
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

    public static sinfo_change = (e: any) => {
        const p: s2c_user.Isinfo_change = e.data;
        const localData = DataMgr.s.userInfo.data;
        DataMgr.s.userInfo.replaceData(p.info);
        // exp
        if (localData.exp != p.info.exp) {
            NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_EXP, { exp: p.info.exp - localData.exp });
        }
        // treasure progress
        if (localData.exploreProgress != p.info.treasureProgress) {
            NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_TREASURE_PROGRESS);
        }
        // heat
        if (localData.heatValue.currentHeatValue != p.info.heatValue.currentHeatValue) {
            NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_HEAT);
        }
    };
    //------------------------------------- item
    public static storhouse_change = async (e: any) => {
        const p: s2c_user.Istorhouse_change = e.data;
        const nonResourceGettedItems = [];
        for (const item of p.iteminfo) {
            const change = new ItemData(item.itemConfigId, item.count);
            change.addTimeStamp = item.addTimeStamp;
            DataMgr.s.item.countChanged(change);

            if (item.count > 0) {
                const config = ItemConfig.getById(item.itemConfigId);
                if (config != null && config.itemType != ItemType.Resource) {
                    nonResourceGettedItems.push(item);
                }
            }
        }
        if (nonResourceGettedItems.length > 0) {
            const result = await UIPanelManger.inst.pushPanel(UIName.ItemGettedUI);
            if (!result.success) {
                return;
            }
            result.node.getComponent(ItemGettedUI).showItem(nonResourceGettedItems);
        }
    };
    //------------------------------------ artifact
    public static artifact_change = (e: any) => {
        const p: s2c_user.Iartifact_change = e.data;
        for (const artifact of p.iteminfo) {
            const change = new ArtifactData(artifact.artifactConfigId, artifact.count);
            change.addTimeStamp = artifact.addTimeStamp;
            DataMgr.s.artifact.countChanged(change);
        }
    };
    public static player_artifact_equip_res = (e: any) => {
        const p: s2c_user.Iplayer_artifact_equip_res = e.data;
        if (p.res !== 1) {
            return;
        }
        DataMgr.s.artifact.changeObj_artifact_effectIndex(p.data.artifactConfigId, p.data.effectIndex);
    };
    public static player_artifact_remove_res = (e: any) => {
        const p: s2c_user.Iplayer_artifact_equip_res = e.data;
        if (p.res !== 1) {
            return;
        }
        DataMgr.s.artifact.changeObj_artifact_effectIndex(p.data.artifactConfigId, p.data.effectIndex);
    };
    //------------------------------------- inner building
    public static building_change = (e: any) => {
        const p: s2c_user.Ibuilding_change = e.data;
        for (const netBuilding of p.buildings) {
            const currentData = DataMgr.s.innerBuilding.data.get(netBuilding.id as InnerBuildingType);
            if (currentData == null) {
                continue;
            }
            DataMgr.s.innerBuilding.replaceData(netBuilding);
            if (currentData.troopIng != netBuilding.troopIng || currentData.upgrading != netBuilding.upgradeIng) {
                NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_DATA_CHANGE);
            }
            if (currentData.upgrading && !netBuilding.upgradeIng) {
                // upgrade finish
                NotificationMgr.triggerEvent(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, currentData.buildType);
            }
        }
    };

    //------------------------------------- map
    public static pioneer_change = (e: any) => {
        const p: s2c_user.Ipioneer_change = e.data;
        const localDatas = DataMgr.s.pioneer.getAll();
        for (const temple of p.pioneers) {
            for (let i = 0; i < localDatas.length; i++) {
                if (temple.id == localDatas[i].id) {
                    const oldData = localDatas[i];
                    const newData = DataMgr.s.pioneer.replaceData(i, temple);
                    // show
                    if (oldData.show != newData.show) {
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_SHOW_CHANGED, { id: newData.id, show: newData.show });
                    }
                    // faction
                    if (oldData.faction != newData.faction) {
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_FACTION_CHANGED, { id: newData.id, show: newData.show });
                    }
                    // action type
                    if (oldData.actionType != newData.actionType || oldData.actionEndTimeStamp != newData.actionEndTimeStamp) {
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_ACTIONTYPE_CHANGED, { id: newData.id });
                    }
                    // event
                    if (oldData.actionEventId != newData.actionEventId) {
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EVENTID_CHANGE);
                        const stepEndData: EVENT_STEPEND_DATA = {
                            pioneerId: newData.id,
                            buildingId: newData.actionBuildingId,
                            eventId: newData.actionEventId,
                            hasNextStep:
                                newData.actionEventId != "-1" && newData.actionEventId != "-2" && newData.actionEventId != "" && newData.actionEventId != null,
                        };
                        NotificationMgr.triggerEvent(NotificationName.EVENT_STEPEND, stepEndData);
                    }
                    // fight
                    if ((oldData.fightData == null && newData.fightData != null) || (oldData.fightData != null && newData.fightData == null)) {
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_FIGHT_CHANGE);
                    }
                    if (oldData.stayPos.x != newData.stayPos.x || oldData.stayPos.y != newData.stayPos.y) {
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_STAY_POSITION_CHANGE, { id: newData.id });
                    }
                    break;
                }
            }
        }
    };
    public static mappioneer_reborn_change = (e: any) => {
        NotificationMgr.triggerEvent(NotificationName.USERESOURCEGETTEDVIEWSHOWTIP, LanMgr.getLanById("106009"));
    };
    public static mapbuilding_reborn_change = (e: any) => {
        NotificationMgr.triggerEvent(NotificationName.USERESOURCEGETTEDVIEWSHOWTIP, LanMgr.getLanById("106010"));
    };

    public static mapbuilding_change = (e: any) => {
        const p: s2c_user.Imappbuilding_change = e.data;
        const localDatas = DataMgr.s.mapBuilding.getObj_building();
        for (const temple of p.mapbuildings) {
            for (let i = 0; i < localDatas.length; i++) {
                if (temple.id == localDatas[i].id) {
                    const oldData = localDatas[i];
                    const newData = DataMgr.s.mapBuilding.replaceData(i, temple);
                    if (oldData.show != newData.show) {
                        NotificationMgr.triggerEvent(NotificationName.MAP_BUILDING_SHOW_CHANGE, { id: newData.id });
                    }
                    if (oldData.faction != newData.faction) {
                        NotificationMgr.triggerEvent(NotificationName.MAP_BUILDING_FACTION_CHANGE, { id: newData.id });
                    }
                    if (oldData.type == MapBuildingType.wormhole && newData.type == MapBuildingType.wormhole) {
                        const oldWorm = oldData as MapBuildingWormholeObject;
                        const newWorm = newData as MapBuildingWormholeObject;
                        if (!CommonTools.mapsAreEqual(oldWorm.attacker, newWorm.attacker)) {
                            NotificationMgr.triggerEvent(NotificationName.MAP_BUILDING_WORMHOLE_ATTACKER_CHANGE);
                            if (NetGlobalData.wormholeAttackBuildingId != null) {
                                NetworkMgr.websocketMsg.player_wormhole_fight_start({
                                    buildingId: NetGlobalData.wormholeAttackBuildingId,
                                });
                                NetGlobalData.wormholeAttackBuildingId = null;
                            }
                        }
                        if (oldWorm.wormholdCountdownTime != newWorm.wormholdCountdownTime) {
                            NotificationMgr.triggerEvent(NotificationName.MAP_BUILDING_WORMHOLE_ATTACK_COUNT_DONW_TIME_CHANGE);
                        }
                    }
                    break;
                }
            }
        }
    };
    public static player_explore_npc_start_res = (e: any) => {
        const p: s2c_user.Iplayer_explore_npc_start_res = e.data;
        if (p.res !== 1) {
            return;
        }
        const npcObj = DataMgr.s.pioneer.getById(p.npcId) as MapNpcPioneerObject;
        if (!!npcObj && npcObj.talkId != null) {
            NotificationMgr.triggerEvent(NotificationName.DIALOG_SHOW, npcObj.talkId);
        }
    };
    public static player_move_res = (e: any) => {
        const p: s2c_user.Iplayer_move_res = e.data;
        if (p.res !== 1) {
            return;
        }
        const movePath: TilePos[] = [];
        for (const temple of p.movePath) {
            movePath.push(GameMainHelper.instance.tiledMapGetTiledPos(temple.x, temple.y));
        }
        DataMgr.s.pioneer.beginMove(p.pioneerId, movePath);
    };
    public static player_event_select_res = (e: any) => {
        const p: s2c_user.Iplayer_event_select_res = e.data;
        if (p.res !== 1) {
            return;
        }
        const eventConfig = EventConfig.getById(p.eventId);
        if (eventConfig.type == 4) {
            // reward change
            if (eventConfig.cost == null) {
                return;
            }
            let showTip: string = "";
            for (const temple of eventConfig.cost) {
                const type: ItemConfigType = temple[0];
                const id: string = temple[1];
                const num: number = temple[2];
                if (type == ItemConfigType.Item) {
                    const itemConf = ItemConfig.getById(id);
                    if (itemConf == null) {
                        continue;
                    }
                    showTip += LanMgr.replaceLanById("207008", [num, LanMgr.getLanById(itemConf.itemName)]) + "\n";
                }
            }
            UIHUDController.showCenterTip(showTip);
        } else if (eventConfig.type == 5) {
            // attributes change
            if (eventConfig.change != null) {
                let showTip: string = "";
                for (const tempChange of eventConfig.change) {
                    const isPlayer: boolean = tempChange[0] == "-1";
                    // 1-hp 2-attack
                    const changedType: MapPioneerEventAttributesChangeType = tempChange[1];
                    if (isPlayer) {
                        if (changedType == 1) {
                            showTip += LanMgr.getLanById("207001") + "\n";
                        } else {
                            showTip += LanMgr.getLanById("207002") + "\n";
                        }
                    } else {
                        const pioneerInfo = DataMgr.s.pioneer.getById(tempChange[0]);
                        if (pioneerInfo == null) {
                            if (changedType == 1) {
                                showTip += LanMgr.getLanById("207003") + "\n";
                            } else {
                                showTip += LanMgr.getLanById("207004") + "\n";
                            }
                        } else {
                            if (changedType == 1) {
                                showTip += LanMgr.replaceLanById("207005", [pioneerInfo.name]) + "\n";
                            } else {
                                showTip += LanMgr.replaceLanById("207006", [pioneerInfo.name]) + "\n";
                            }
                        }
                    }
                }
                UIHUDController.showCenterTip(showTip);
            }
        }
    };

    //------------------------------------- nft
    public static nft_change = (e: any) => {
        const p: s2c_user.Inft_change = e.data;
        for (const nft of p.nfts) {
            DataMgr.s.nftPioneer.replaceData(nft);
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
    public static player_wormhole_fight_attacked_res = (e: any) => {
        const p: s2c_user.Iplayer_wormhole_fight_attacked_res = e.data;
        if (p.res !== 1) {
            return;
        }
        if (DataMgr.s.userInfo.data.id != p.defenderUid) {
            return;
        }
        PioneerMgr.showFakeWormholeFight(p.attackerName);
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
        const isSelfAttack: boolean = DataMgr.s.userInfo.data.id != p.defenderUid;
        const selfName: string = isSelfAttack ? p.attackerName : p.defenderName + " " + LanMgr.getLanById("110010");
        const otherName: string = !isSelfAttack ? p.attackerName : p.defenderName + " " + LanMgr.getLanById("110010");
        const isSelfWin: boolean = isSelfAttack && p.fightResult;
        NotificationMgr.triggerEvent(NotificationName.FIGHT_FINISHED, {
            attacker: {
                name: selfName,
                avatarIcon: "icon_player_avatar", // todo
                hp: isSelfWin ? 100 : 0,
                hpMax: 100,
            },
            defender: {
                name: otherName,
                avatarIcon: "icon_player_avatar",
                hp: isSelfWin ? 0 : 50,
                hpMax: 50,
            },
            attackerIsSelf: true,
            buildingId: null,
            position: null,
            fightResult: isSelfWin ? "win" : "lose",
            rewards: [],
        });
        NotificationMgr.triggerEvent(NotificationName.USERESOURCEGETTEDVIEWSHOWTIP, LanMgr.getLanById("106007"));
    };

    //----------------------------------- psyc
    public static fetch_user_psyc_res = (e: any) => {
        const p: s2c_user.Ifetch_user_psyc_res = e.data;
        if (p.res !== 1) {
            return;
        }
        DataMgr.s.userInfo.data.energyDidGetTimes += 1;
    };

    //----------------------------------- world treasure
    public static player_world_treasure_lottery_res = async (e: any) => {
        const p: s2c_user.Iplayer_world_treasure_lottery_res = e.data;
        if (p.res !== 1) {
            return;
        }
        DataMgr.s.userInfo.data.heatValue.lotteryTimes += 1;
        const result = await UIPanelManger.inst.pushPanel(UIName.TreasureGettedUI);
        if (result.success) {
            result.node.getComponent(TreasureGettedUI).dialogShow([new ItemData(p.itemId, p.num)], []);
        }
    };
    public static get_treasure_info_res = (e: any) => {
        const p: s2c_user.Iget_treasure_info_res = e.data;
        if (p.res !== 1) {
            return;
        }
        for (const key in p.data) {
            NetGlobalData.worldTreasureTodayRewards = p.data[key];
            break;
        }
    };
    public static player_world_treasure_pool_change_res = (e: any) => {
        const p: s2c_user.Iplayer_world_treasure_pool_change_res = e.data;
        if (p.res !== 1) {
            return;
        }
        NetworkMgr.websocketMsg.get_treasure_info({});
    };

    public static get_pioneers_res = (e: any) => {
        let p: s2c_user.Iget_pioneers_res = e.data;
        // TODO: update all pioneers data
    };

    public static player_talk_select_res = (e: any) => {};
    // public static player_gather_res = (e: any) => {
    //     if (DataMgr.socketSendData.has("player_gather_res")) {
    //         const data: s2c_user.Iplayer_gather_res = DataMgr.socketSendData.get("player_gather_res") as s2c_user.Iplayer_gather_res;
    //         const { pioneerId, buildingId } = data;
    //         const currentTimeStamp = new Date().getTime();
    //         let actionTime: number = 3000;
    //         actionTime = GameMgr.getAfterExtraEffectPropertyByPioneer(pioneerId, GameExtraEffectType.GATHER_TIME, actionTime);
    //         if (actionTime <= 0) actionTime = 1;
    //         DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.mining, currentTimeStamp, actionTime);
    //         setTimeout(() => {
    //             DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.idle);

    //             NotificationMgr.triggerEvent(NotificationName.MINING_FINISHED, {
    //                 buildingId: buildingId,
    //                 pioneerId: pioneerId,
    //                 duration: 3000, //todo see assets/Script/Manger/PioneerMgr.ts:1225
    //                 rewards: [], // no item loots by now
    //             });
    //         }, actionTime);
    //     }
    // };
    public static player_explore_res = (e: any) => {
        if (DataMgr.socketSendData.has("player_explore_res")) {
            const data: s2c_user.Iplayer_explore_res = DataMgr.socketSendData.get("player_explore_res") as s2c_user.Iplayer_explore_res;
            const { pioneerId, isExporeBuilding, exploreId, actionType } = data;
            const currentTimeStamp = new Date().getTime();
            if (isExporeBuilding) {
                if (actionType == MapPioneerActionType.defend) {
                    DataMgr.s.pioneer.changeActionType(pioneerId, actionType);
                    // DataMgr.s.mapBuilding.changeBuildingFaction(exploreId, MapMemberFactionType.friend);
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
                    }, actionTime);
                } else {
                    DataMgr.s.pioneer.changeActionType(pioneerId, MapPioneerActionType.idle);
                }
            }
        }
    };
    public static player_fight_res = (e: any) => {
        const p: s2c_user.Iplayer_fight_res = e.data;
        if (p.res !== 1) {
            return;
        }
        if (DataMgr.socketSendData.has("player_fight_res")) {
            const data: s2c_user.Ilocal_player_fight_res = DataMgr.socketSendData.get("player_fight_res") as s2c_user.Ilocal_player_fight_res;

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
                    attack: attacker.attack,
                    defend: attacker.defend,
                },
                defenderInfo: {
                    id: defenderId,
                    name: defenderName,
                    hp: defenderHp,
                    hpMax: defenderHpMax,
                    attack: defenderAttack,
                    defend: defenderDefned,
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
                                // if (isDead) {
                                //     fightOver = true;
                                //     isAttackWin = true;
                                // }
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
                                            break;
                                        }
                                    }
                                    if (useData.defenderInfo.hp <= 0) {
                                        // DataMgr.s.mapBuilding.hideBuilding(buildingDefender.id, attacker.id);
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
                        // if (isDead) {
                        //     fightOver = true;
                        //     isAttackWin = false;
                        // }
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
                        // pioneer win reward
                        if (selfKillPioneer.winProgress > 0) {
                            const effectProgress = GameMgr.getAfterExtraEffectPropertyByPioneer(
                                null,
                                GameExtraEffectType.TREASURE_PROGRESS,
                                selfKillPioneer.winProgress
                            );
                        }
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

    public static player_treasure_open_res = (e: any) => {
        const key: string = "player_treasure_open_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_treasure_open_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_treasure_open_res;
            DataMgr.s.userInfo.getExplorationReward(data.boxId);
        }
    };
    public static player_point_treasure_open_res = (e: any) => {
        const key: string = "player_point_treasure_open_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_point_treasure_open_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_point_treasure_open_res;
            DataMgr.s.userInfo.getPointExplorationReward(data.boxId);
        }
    };
    public static player_generate_energy_res = (e: any) => {
        const key: string = "player_generate_energy_res";
        if (DataMgr.socketSendData.has(key)) {
            const data: s2c_user.Iplayer_generate_energy_res = DataMgr.socketSendData.get(key) as s2c_user.Iplayer_generate_energy_res;
            // upload resource changed inner_building-generate_energy
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

    public static player_rookie_finish_res = (e: any) => {
        DataMgr.s.userInfo.finishRookie();
    };

    public static player_lvlup_change = (e: any) => {
        const p: s2c_user.Iplayer_lvlup_change = e.data;
        DataMgr.s.userInfo.data.level = p.newLv;
        DataMgr.s.userInfo.data.energyGetLimitTimes = p.newPsycLimit;
        if (p.items.length > 0) {
            let items: ItemData[] = [];

            for (let i = 0; i < p.items.length; i++) {
                items.push(new ItemData(p.items[i].itemConfigId, p.items[i].count, p.items[i].addTimeStamp));
            }
            p.items = items;
        }
        NotificationMgr.triggerEvent(NotificationName.USERINFO_DID_CHANGE_LEVEL, p);
    };

    ///////////////// websocketTempData
    public static setTempSendData(key: string, data: DataMgrResData) {
        DataMgr.socketSendData.set(key, data);
    }

    /////////////// task
    public static user_task_action_getnewtalk = (e: any) => {
        let p: s2c_user.Iuser_task_action_getnewtalk = e.data;
        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_GET_NEW_TALK, { npcId: p.npcId, talkId: p.talkId });
    };
    public static user_task_did_change = (e: any) => {
        let p: s2c_user.Iuser_task_did_change = e.data;
        const runDatas = DataMgr.s.task.getAll();
        for (let i = 0; i < runDatas.length; i++) {
            if (runDatas[i].taskId == p.task.taskId) {
                if (!runDatas[i].isGetted && p.task.isGetted) {
                    NotificationMgr.triggerEvent(NotificationName.TASK_NEW_GETTED);
                }
                runDatas[i] = p.task;
                NotificationMgr.triggerEvent(NotificationName.TASK_DID_CHANGE);
                break;
            }
        }
    };
    public static get_user_task_info_res = (e: any) => {
        let p: s2c_user.Iget_user_task_info_res = e.data;
        if (p.res == 1) {
            NetGlobalData.tasks = p.tasks;
            DataMgr.s.task.loadObj();
            NotificationMgr.triggerEvent(NotificationName.TASK_LIST);
        }
    };

    //------------------------------------- settlement
    public static get_user_settlement_info_res = (e: any) => {
        const p: s2c_user.Iget_user_settlement_info_res = e.data;
        if (p.res !== 1) {
            return;
        }
        DataMgr.s.settlement.refreshData(p.data);
        NotificationMgr.triggerEvent(NotificationName.SETTLEMENT_DATA_CHANGE);
    };
}
