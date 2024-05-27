import { Vec2, v2 } from "cc";
import PioneerConfig from "../../Config/PioneerConfig";
import { TileHexDirection, TilePos } from "../../Game/TiledMap/TileTool";
import { GetPropData, MapMemberFactionType, MapMemberTargetType } from "../../Const/ConstDefine";
import PioneerDefine, {
    MapNpcPioneerObject,
    MapPioneerActionType,
    MapPioneerLogicType,
    MapPioneerObject,
    MapPioneerType,
    MapPlayerPioneerObject,
} from "../../Const/PioneerDefine";
import { NotificationName } from "../../Const/Notification";
import NotificationMgr from "../../Basic/NotificationMgr";
import { Ichange_pioneer_type, s2c_user, share } from "../../Net/msg/WebsocketMsg";
import CommonTools from "../../Tool/CommonTools";
import { PioneerFactionAction, TaskFactionAction, TaskNpcGetNewTalkAction, TaskShowHideAction, TaskShowHideStatus } from "../../Const/TaskDefine";
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
    public replaceData(index: number, data: share.Ipioneer_data) {
        const newObj = PioneerDefine.convertNetDataToObject(data);
        this._pioneers[index] = newObj;
        return newObj;
    }
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
    public changeTalk(pioneerId: string, talkId: string) {
        const pioneer = this.getById(pioneerId);
        if (pioneer == undefined) {
            return;
        }
        const npcObj: MapNpcPioneerObject = pioneer as MapNpcPioneerObject;
        if (!!npcObj) {
            if (npcObj.talkId == talkId) {
                return;
            }
            npcObj.talkId = talkId;
            NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_TALK_CHANGED, { id: pioneerId, talkId: npcObj.talkId });
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
            this._pioneers.push(PioneerDefine.convertNetDataToObject(netPioneers[key]));
        }
        // default player id is "0"
        this._currentActionPioneerId = "pioneer_0";

        // NetworkMgr.websocket.on("change_pioneer_res", this._onChangePioneer);
        this._initInterval();
        this._addListeners();
    }

    private _initInterval() {
        setInterval(() => {
            for (const pioneer of this._pioneers) {
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
                                // this.changeShow(pioneer.id, false);
                                pioneer.logics.splice(0, 1);
                            }

                            if (logicMove) {
                                NotificationMgr.triggerEvent(NotificationName.MAP_PIONEER_LOGIC_MOVE, { id: pioneer.id, logic: logic });
                            }
                        }
                    }
                }
            }
        }, 1000);
    }

    private _addListeners() {
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_GET_NEW_TALK, this._onPioneerGetTalk, this);
        NotificationMgr.addListener(NotificationName.NFTDIDLEVELUP, this._onNFTPioneerDidLevelUp, this);
    }

    //--------------------------- notification
    private _onPioneerGetTalk(data: { npcId: string, talkId: string }) {
        this.changeTalk(data.npcId, data.talkId);
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
}
