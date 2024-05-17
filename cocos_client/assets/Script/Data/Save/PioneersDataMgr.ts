import { Vec2, v2 } from "cc";
import PioneerConfig from "../../Config/PioneerConfig";
import { TileHexDirection, TilePos } from "../../Game/TiledMap/TileTool";
import { GetPropData, MapMemberFactionType, MapMemberTargetType } from "../../Const/ConstDefine";
import {
    MapNpcPioneerObject,
    MapPioneerActionType,
    MapPioneerData,
    MapPioneerEventStatus,
    MapPioneerLogicObject,
    MapPioneerLogicPatrolObject,
    MapPioneerLogicStepMoveObject,
    MapPioneerLogicTargetMoveObject,
    MapPioneerLogicType,
    MapPioneerObject,
    MapPioneerType,
    MapPlayerPioneerObject,
    PioneerConfigData,
} from "../../Const/PioneerDefine";
import { NotificationName } from "../../Const/Notification";
import NotificationMgr from "../../Basic/NotificationMgr";
import { Ichange_pioneer_type, s2c_user } from "../../Net/msg/WebsocketMsg";
import CommonTools from "../../Tool/CommonTools";
import { TaskFactionAction, TaskNpcGetNewTalkAction, TaskShowHideAction, TaskShowHideStatus } from "../../Const/TaskDefine";
import { NFTPioneerObject } from "../../Const/NFTPioneerDefine";
import NetGlobalData from "./Data/NetGlobalData";

export class PioneersDataMgr {
    private _pioneers: MapPioneerObject[] = [];
    private _currentActionPioneerId: string = null;
    public constructor() {}
    //-------------------------------- public
    public loadObj() {
        this._initData();
    }
    //-------------- get
    public getAll(forceShow: boolean = false): MapPioneerObject[] {
        if (forceShow) {
            return this._pioneers.filter((p) => p.show == true);
        } else {
            return this._pioneers;
        }
    }
    public getAllPlayers(forceShow: boolean = false): MapPlayerPioneerObject[] {
        if (forceShow) {
            return this._pioneers.filter((p) => p.show == true && p.type == MapPioneerType.player) as MapPlayerPioneerObject[];
        } else {
            return this._pioneers.filter((p) => p.type == MapPioneerType.player) as MapPlayerPioneerObject[];
        }
    }
    public getAllNpcs(forceShow: boolean = false): MapNpcPioneerObject[] {
        if (forceShow) {
            return this._pioneers.filter((p) => p.show == true && p.type == MapPioneerType.npc) as MapNpcPioneerObject[];
        } else {
            return this._pioneers.filter((p) => p.type == MapPioneerType.npc) as MapNpcPioneerObject[];
        }
    }
    public getById(pioneerId: string, forceShow: boolean = false): MapPioneerObject | undefined {
        if (forceShow) {
            return this._pioneers.find((p) => p.show && p.id == pioneerId);
        } else {
            return this._pioneers.find((p) => p.id == pioneerId);
        }
    }
    public getByStayPos(stayPos: Vec2, forceShow: boolean = false): MapPioneerObject[] {
        if (forceShow) {
            return this._pioneers.filter((p) => p.show && p.stayPos.equals(stayPos));
        } else {
            return this._pioneers.filter((p) => p.stayPos.equals(stayPos));
        }
    }
    public getByNearPos(pos: Vec2, range: number, forceShow: boolean): MapPioneerObject[] {
        return this._pioneers.filter((pioneer: MapPioneerObject) => {
            if (Math.abs(pioneer.stayPos.x - pos.x) < range && Math.abs(pioneer.stayPos.y - pos.y) < range) {
                if (forceShow && pioneer.show) {
                    return true;
                } else {
                    return pioneer.show;
                }
            }
            return false;
        });
    }
    public getCurrentActionIsBusy(): boolean {
        let busy: boolean = false;
        const findPioneer = this._pioneers.find((pioneer) => pioneer.id === this._currentActionPioneerId);
        if (findPioneer != undefined) {
            busy = findPioneer.actionType != MapPioneerActionType.idle;
        }
        return busy;
    }
    public getCurrentPlayer(): MapPlayerPioneerObject | undefined {
        return this._pioneers.find((p) => p.id === this._currentActionPioneerId && p.type === MapPioneerType.player) as MapPlayerPioneerObject;
    }
    //-------------- change
    public changeCurrentAction(pioneerId: string) {
        this._currentActionPioneerId = pioneerId;
    }
    public changeActionType(pioneerId: string, type: MapPioneerActionType, beginTimeStamp: number = 0, useTime: number = 0, eventId: string = null) {
        const findPioneer = this.getById(pioneerId);
        if (findPioneer == undefined) return;

        findPioneer.actionType = type;
        findPioneer.actionBeginTimeStamp = beginTimeStamp;
        findPioneer.actionEndTimeStamp = beginTimeStamp + useTime;
        findPioneer.actionEventId = eventId;

        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_ACTIONTYPE_CHANGED, { id: pioneerId });
    }
    public changeEventStatus(pioneerId: string, status: MapPioneerEventStatus, beginTimeStamp: number = 0, useTime: number = 0) {
        const findPioneer = this.getById(pioneerId);
        if (findPioneer == undefined) return;

        findPioneer.eventStatus = status;
        findPioneer.actionBeginTimeStamp = beginTimeStamp;
        findPioneer.actionEndTimeStamp = beginTimeStamp + useTime;

        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_EVENTSTATUS_CHANGED, { id: pioneerId });
    }
    public changeShow(pioneerId: string, show: boolean, delayTime: number = 0): boolean {
        const pioneer = this.getById(pioneerId);
        if (pioneer == undefined) {
            return false;
        }
        if (pioneer.show == show) {
            return false;
        }
        if (delayTime > 0) {
            pioneer.showHideStruct = {
                isShow: show,
                countTime: delayTime,
            };

            return false;
        }
        pioneer.show = show;

        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_SHOW_CHANGED, { id: pioneerId, show: pioneer.show });
        return true;
    }
    public changeTalk(pioneerId: string, talkId: string, delayTime: number = 0) {
        const pioneer = this.getById(pioneerId);
        if (pioneer == undefined) {
            return;
        }
        const npcObj: MapNpcPioneerObject = pioneer as MapNpcPioneerObject;
        if (!!npcObj) {
            if (npcObj.talkId == talkId) {
                return;
            }
            if (delayTime > 0) {
                npcObj.talkCountStruct = {
                    talkId: talkId,
                    countTime: delayTime,
                };

                return;
            }
            npcObj.talkId = talkId;

            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_TALK_CHANGED, { id: pioneerId, talkId: npcObj.talkId });
        }
    }
    public changeFaction(pioneerId: string, faction: MapMemberFactionType) {
        const pioneer = this.getById(pioneerId);
        if (pioneer == undefined) {
            return;
        }
        if (pioneer.faction == faction) {
            return;
        }
        pioneer.faction = faction;

        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_FACTION_CHANGED, { id: pioneerId, faction: pioneer.faction });
    }

    public changeBeKilled(pioneerId: string, killerId: string) {
        const pioneer = this.getById(pioneerId);
        if (pioneer != undefined && pioneer.type == MapPioneerType.player) {
            const player = pioneer as MapPlayerPioneerObject;
            player.rebirthCountTime = 10;
            player.killerId = killerId;
        }
    }

    public gainHp(pioneerId: string, maxNum: number): number {
        const pioneer = this.getById(pioneerId);
        let cost: number = 0;
        if (pioneer != undefined) {
            cost = Math.min(pioneer.hpMax - pioneer.hp, maxNum);
            if (cost > 0) {
                pioneer.hp += cost;

                NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_HP_CHANGED, { id: pioneerId, gainValue: cost });
            }
        }
        return cost;
    }
    public loseHp(pioneerId: string, num: number): boolean {
        const pioneer = this.getById(pioneerId);
        let isDead: boolean = false;
        if (pioneer != undefined) {
            const cost = Math.min(pioneer.hp, num);
            if (cost > 0) {
                pioneer.hp -= cost;

                NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_HP_CHANGED, { id: pioneerId, loseValue: cost });
            }
            if (pioneer.hp <= 0) {
                isDead = true;
                this.changeActionType(pioneerId, MapPioneerActionType.idle);
                this.changeShow(pioneerId, false);
            }
        }
        return isDead;
    }
    public changeHpMax(pioneerId: string, num: number): void {
        if (num == 0) {
            return;
        }
        const pioneer = this.getById(pioneerId);
        if (pioneer != undefined) {
            pioneer.hpMax += num;

            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_HPMAX_CHANGED, { id: pioneerId });
        }
    }
    public changeAllPlayerHpMax(num: number): void {
        if (num == 0) {
            return;
        }
        for (const player of this.getAllPlayers()) {
            player.hpMax += num;

            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_HPMAX_CHANGED, { id: player.id });
        }
    }
    public changeAttack(pioneerId: string, num: number): void {
        if (num == 0) {
            return;
        }
        const pioneer = this.getById(pioneerId);
        if (pioneer != undefined) {
            pioneer.attack += num;

            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_ATTACK_CHANGED, { id: pioneerId });
        }
    }

    public changeDefend(pioneerId: string, num: number): void {
        if (num == 0) {
            return;
        }
        const pioneer = this.getById(pioneerId);
        if (pioneer != undefined) {
            pioneer.defend += num;

            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_DEFEND_CHANGED, { id: pioneerId });
        }
    }
    public changeSpeed(pioneerId: string, num: number): void {
        if (num == 0) {
            return;
        }
        const pioneer = this.getById(pioneerId);
        if (pioneer != undefined) {
            pioneer.speed += num;

            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_SPEED_CHANGED, { id: pioneerId });
        }
    }
    public rebirth(pioneerId: string, recoverHp: number, rebirthPos: Vec2): void {
        const pioneer = this.getById(pioneerId) as MapPlayerPioneerObject;
        if (!!pioneer) {
            pioneer.hp = recoverHp;
            pioneer.stayPos = rebirthPos;
            pioneer.killerId = null;
            this.changeShow(pioneerId, true);
            this.changeActionType(pioneerId, MapPioneerActionType.idle);
            this.changeEventStatus(pioneerId, MapPioneerEventStatus.None);

            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_REBIRTH_FINISHED, { id: pioneerId });
        }
    }

    public beginMove(pioneerId: string, movePaths: TilePos[], forceShowMovePath: boolean = false) {
        const findPioneer = this.getById(pioneerId);
        if (findPioneer != undefined) {
            if (movePaths.length > 0) {
                findPioneer.movePaths = movePaths;

                this.changeActionType(pioneerId, MapPioneerActionType.moving);
                let showMovePath: boolean = false;
                if (forceShowMovePath) {
                    showMovePath = true;
                } else {
                    if (findPioneer.type == MapPioneerType.player) {
                        showMovePath = true;
                    }
                }
                NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_BEGIN_MOVE, { id: pioneerId, showMovePath: showMovePath });
            } else {
                this.changeActionType(pioneerId, MapPioneerActionType.idle);
                NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_MOVE_MEETTED, { pioneerId: findPioneer.id, isStay: true });
            }
        }
    }
    public didMoveStep(pioneerId: string) {
        const findPioneer = this.getById(pioneerId);
        if (findPioneer != undefined) {
            if (findPioneer.movePaths.length > 0) {
                findPioneer.movePaths.shift();

                // enemy step trigger
                if (findPioneer.type != MapPioneerType.player && findPioneer.faction == MapMemberFactionType.enemy) {
                    NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_MOVE_MEETTED, { pioneerId: findPioneer.id, isStay: false });
                }
            }
            if (findPioneer.movePaths.length == 0) {
                // move over trigger
                this.changeActionType(pioneerId, MapPioneerActionType.idle);
                NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_MOVE_MEETTED, { pioneerId: findPioneer.id, isStay: true });
            }
            if (findPioneer.type == MapPioneerType.player) {
                NotificationMgr.triggerEvent(NotificationName.MAP_PLAYER_PIONEER_DID_MOVE_STEP, { id: pioneerId });
            }
        }
    }

    public createNFTPlayer(nft: NFTPioneerObject, originalStayPos: Vec2) {
        // const obj: MapPlayerPioneerObject  = {
        //     id: nft.uniqueId,
        //     show: true,
        //     faction: MapMemberFactionType.friend,
        //     type: MapPioneerType.player,
        //     animType: "self",
        //     name: nft.name,
        //     stayPos: originalStayPos,
        //     hpMax: nft.hp,
        //     hp: nft.hp,
        //     attack: nft.attack,
        //     defend: nft.defense,
        //     speed: nft.speed,
        //     movePaths: [],
        //     actionType: MapPioneerActionType.idle,
        //     eventStatus: MapPioneerEventStatus.None,
        //     actionBeginTimeStamp: 0,
        //     actionEndTimeStamp: 0,
        //     logics: null,
        //     winProgress: null,
        //     winExp: null,
        //     drop: null,
        //     rebirthCountTime: -1,
        //     killerId: null,
        //     NFT: nft
        // };
        // this._pioneers.push(obj);
        //
    }
    public bindPlayerNFT(pioneerId: string, NFT: NFTPioneerObject) {
        const findPioneer = this.getById(pioneerId) as MapPlayerPioneerObject;
        if (findPioneer == undefined) {
            return;
        }
        findPioneer.NFTId = NFT.uniqueId;

        this.changeHpMax(pioneerId, NFT.hp);
        this.changeAttack(pioneerId, NFT.attack);
        this.changeDefend(pioneerId, NFT.defense);
        this.changeSpeed(pioneerId, NFT.speed);
    }
    public unbindPlayerNFT(pioneerId: string, NFT: NFTPioneerObject) {}

    private _initData() {
        if (NetGlobalData.usermap == null) {
            return;
        }
        this._pioneers = [];
        const netPioneers = NetGlobalData.usermap.pioneer;
        for (const key in netPioneers) {
            const config = PioneerConfig.getById(key);
            if (config == null) {
                continue;
            }
            const temple = netPioneers[key];
            let obj = {
                id: temple.id,
                show: temple.show,
                faction: temple.faction,
                type: temple.type as MapPioneerType,
                animType: config.animType,
                name: config.name,
                hp: temple.hp,
                hpMax: temple.hpMax,
                attack: temple.attack,
                defend: temple.defend,
                speed: temple.speed,
                stayPos: v2(temple.stayPos.x, temple.stayPos.y),
                movePaths: [],
                actionType: temple.actionType as MapPioneerActionType,
                eventStatus: temple.eventStatus,
                actionBeginTimeStamp: temple.actionBeginTimeStamp,
                actionEndTimeStamp: temple.actionEndTimeStamp,
                logics: [],
                winProgress: temple.winProgress,
                winExp: temple.winExp,
                drop: [],
                showHideStruct: null,
            };
            if (obj.type == MapPioneerType.player) {
                let playerObj: MapPlayerPioneerObject;
                playerObj = {
                    ...obj,
                    NFTInitLinkId: temple.NFTInitLinkId,
                    NFTId: temple.NFTId,
                    rebirthCountTime: temple.rebirthCountTime,
                    killerId: temple.killerId,
                };
                this._pioneers.push(playerObj);
            } else if (obj.type == MapPioneerType.npc) {
                let npcObj: MapNpcPioneerObject;
                npcObj = {
                    ...obj,
                    talkId: temple.talkId,
                    talkCountStruct: null,
                };
                this._pioneers.push(npcObj);
            } else {
                this._pioneers.push(obj);
            }
        }
        console.log("exce pioneer: ", this._pioneers);
        // default player id is "0"
        this._currentActionPioneerId = "pioneer_0";

        // NetworkMgr.websocket.on("change_pioneer_res", this._onChangePioneer);
        this._initInterval();
        this._addListeners();
    }

    private _initInterval() {
        setInterval(() => {
            for (const pioneer of this._pioneers) {
                if (pioneer.showHideStruct != null) {
                    if (pioneer.showHideStruct.countTime > 0) {
                        pioneer.showHideStruct.countTime -= 1;

                        // wait server
                        NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_SHOW_HIDE_COUNT_CHANGED, { id: pioneer.id });

                        if (pioneer.showHideStruct.countTime == 0) {
                            this.changeShow(pioneer.id, pioneer.showHideStruct.isShow);
                            pioneer.showHideStruct = null;
                        }
                    }
                }
                if (pioneer.show) {
                    if (pioneer.actionType == MapPioneerActionType.idle) {
                        // xx wait player cannot do logic
                        if (pioneer.type != MapPioneerType.player && pioneer.logics.length > 0) {
                            const logic = pioneer.logics[0];
                            let logicMove: boolean = false;
                            if (logic.type == MapPioneerLogicType.stepmove) {
                                if (logic.repeat > 0 || logic.repeat == -1) {
                                    if (logic.currentCd > 0) {
                                        //move cd count
                                        logic.currentCd -= 1;
                                    }
                                    if (logic.currentCd == 0) {
                                        logicMove = true;
                                        logic.currentCd = logic.stepMove.cd;
                                        if (logic.repeat > 0) {
                                            logic.repeat -= 1;
                                        }
                                    }
                                    if (logic.repeat == 0) {
                                        pioneer.logics.splice(0, 1);
                                    }
                                }
                            } else if (logic.type == MapPioneerLogicType.targetmove) {
                                logicMove = true;
                                pioneer.logics.splice(0, 1);
                            } else if (logic.type == MapPioneerLogicType.patrol) {
                                if (logic.repeat > 0 || logic.repeat == -1) {
                                    if (logic.currentCd > 0) {
                                        logic.currentCd -= 1;
                                    }
                                    if (logic.currentCd == 0) {
                                        logic.currentCd = CommonTools.getRandomInt(logic.patrol.intervalRange[0], logic.patrol.intervalRange[1]);

                                        logicMove = true;

                                        if (logic.repeat > 0) {
                                            logic.repeat -= 1;
                                        }
                                        if (logic.repeat == 0) {
                                            pioneer.logics.splice(0, 1);
                                        }
                                    }
                                }
                            } else if (logic.type == MapPioneerLogicType.hide) {
                                this.changeShow(pioneer.id, false);
                                pioneer.logics.splice(0, 1);
                            }

                            if (logicMove) {
                                NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_LOGIC_MOVE, { id: pioneer.id, logic: logic });
                            }
                        }
                    }

                    // get new talk time count
                    if (pioneer.type == MapPioneerType.npc) {
                        const npcPioneer: MapNpcPioneerObject = pioneer as MapNpcPioneerObject;
                        if (!!npcPioneer) {
                            if (npcPioneer.talkCountStruct != null) {
                                if (npcPioneer.talkCountStruct.countTime > 0) {
                                    npcPioneer.talkCountStruct.countTime -= 1;
                                    NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_GET_TALK_COUNT_CHANGED, { id: pioneer.id });

                                    if (npcPioneer.talkCountStruct.countTime == 0) {
                                        this.changeTalk(npcPioneer.id, npcPioneer.talkCountStruct.talkId);
                                        npcPioneer.talkCountStruct = null;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (pioneer.type == MapPioneerType.player) {
                        const playerPioneer: MapPlayerPioneerObject = pioneer as MapPlayerPioneerObject;
                        if (!!playerPioneer) {
                            if (playerPioneer.rebirthCountTime > 0) {
                                playerPioneer.rebirthCountTime -= 1;

                                NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_REBIRTH_COUNT_CHANGED, { id: playerPioneer.id });
                                if (playerPioneer.rebirthCountTime == 0) {
                                    NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_REBIRTH_BEGIN, { id: playerPioneer.id });
                                }
                            }
                        }
                    }
                }
            }
        }, 1000);
    }

    private _addListeners() {
        NotificationMgr.addListener(NotificationName.MAP_MEMBER_CHANGE_SHOW_HIDE, this._onPioneerChangeShow, this);
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_GET_NEW_TALK, this._onPioneerGetTalk, this);
        NotificationMgr.addListener(NotificationName.MAP_MEMBER_CHANGE_FACTION, this._onPioneerChangeFaction, this);
        NotificationMgr.addListener(NotificationName.NFTDIDLEVELUP, this._onNFTPioneerDidLevelUp, this);
    }

    //--------------------------- notification
    private _onPioneerChangeShow(action: TaskShowHideAction) {
        if (action.type == MapMemberTargetType.pioneer) {
            this.changeShow(action.id, action.status == TaskShowHideStatus.show, action.delayTime);
        }
    }
    private _onPioneerGetTalk(action: TaskNpcGetNewTalkAction) {
        this.changeTalk(action.npcId, action.talkId, action.delayTime);
    }
    private _onPioneerChangeFaction(action: TaskFactionAction) {
        if (action.type == MapMemberTargetType.pioneer) {
            this.changeFaction(action.id, action.faction);
        }
    }

    private _onNFTPioneerDidLevelUp(NFT: NFTPioneerObject) {
        let currentPlayer: MapPlayerPioneerObject = null;
        const allPlayers = this.getAllPlayers();
        for (const player of allPlayers) {
            if (player.NFTId == NFT.uniqueId) {
                currentPlayer = player;
                break;
            }
        }
        if (currentPlayer == null) {
            return;
        }
        this.changeHpMax(currentPlayer.id, NFT.hpGrowValue);
        this.changeAttack(currentPlayer.id, NFT.attackGrowValue);
        this.changeDefend(currentPlayer.id, NFT.defenseGrowValue);
        this.changeSpeed(currentPlayer.id, NFT.speedGrowValue);
    }
    //---------------------------fake socket
    private _onChangePioneer(e: any) {
        const data: s2c_user.Ichange_pioneer_res = e;
        const findPioneer = this._pioneers.find((p) => p.id == data.pioneerId);
        if (findPioneer != undefined) {
            if (data.type == Ichange_pioneer_type.showHide) {
                findPioneer.show = data.showHide.show;
            } else if (data.type == Ichange_pioneer_type.actionType) {
                findPioneer.actionType = data.actionType.type;
            }
        }
    }
}
