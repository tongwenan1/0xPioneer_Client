import { Vec2 } from "cc";
import { TileHexDirection, TilePos } from "../Game/TiledMap/TileTool";
import { AttrChangeType, GetPropData, MapMemberFactionType, MapMemberGetTalkCountStruct, MapMemberShowHideCountStruct } from "./ConstDefine";
import { ItemConfigType } from "./Item";

export interface PioneerConfigData {
    id: string;
    name: string;
    type: string;
    friendly: number;
    show: number;
    level: number;
    nft_pioneer: string;
    hp: number;
    attack: number;
    def: number;
    winprogress: number;
    exp: number;
    animType: string;
    drop: [ItemConfigType, string, number][];
    pos: { x: number, y: number }[];
    logics: { type: number, posx: number, posy: number, step: number, cd: number, direction: number, repeat: number, interval: [number, number], range: number, speed: number }[];
}


export enum MapPioneerActionType {
    dead = "dead",
    wakeup = "wakeup",
    idle = "idle",
    defend = "defend",
    moving = "moving",
    mining = "mining",
    fighting = "fighting",
    exploring = "exploring",
    eventing = "eventing",
    addingtroops = "addingtroops"
}

export enum MapPioneerType {
    player = "1",
    npc = "2",
    hred = "4",
    gangster = "3",
}

export enum MapPioneerLogicType {
    stepmove = 2,
    targetmove = 1,
    hide = 3,
    patrol = 4,
}

export enum MapPioneerMoveDirection {
    left = "left",
    right = "right",
    top = "top",
    bottom = "bottom",
}

export enum MapPioneerEventStatus {
    None,
    Waiting,
    Waited
}

export interface MapPioneerAttributesChangeModel {
    type: AttrChangeType;
    value: number;
}

export interface MapPioneerLogicStepMoveData {
    step: number;
    cd: number;
    direction: TileHexDirection;
}
 
export interface MapPioneerLogicStepMoveObject extends MapPioneerLogicStepMoveData { }

export interface MapPioneerLogicPatrolData {
    originalPos: MapPosStruct;
    intervalRange: [number, number];
    range: number;
}

export interface MapPioneerLogicPatrolObject extends MapPioneerLogicPatrolData { 
    originalPos: Vec2;
}

export interface MapPioneerLogicTargetMoveData {
    targetPos: MapPosStruct;
}

export interface MapPioneerLogicTargetMoveObject extends MapPioneerLogicTargetMoveData {
    targetPos: Vec2;
}

export interface MapPosStruct {
    x: number;
    y: number;
}

export interface MapPioneerLogicData {
    type: MapPioneerLogicType;
    currentCd: number;
    repeat: number;
    moveSpeed: number;

    stepMove?: MapPioneerLogicStepMoveData;
    patrol?: MapPioneerLogicPatrolData;
    targetMove?: MapPioneerLogicTargetMoveData;
}

export interface MapPioneerLogicObject extends MapPioneerLogicData {
    stepMove?: MapPioneerLogicStepMoveObject;
    patrol?: MapPioneerLogicPatrolObject;
    targetMove?: MapPioneerLogicTargetMoveObject;
}

export interface MapPioneerData {
    id: string;
    show: boolean;
    faction: MapMemberFactionType;
    type: MapPioneerType;
    animType: string;
    name: string;
    stayPos: MapPosStruct;

    hpMax: number;
    hp: number;
    attack: number;
    defend: number;

    movePaths: MapPosStruct[];

    actionType: MapPioneerActionType;
    actionBeginTimeStamp: number;
    actionEndTimeStamp: number;

    logics: MapPioneerLogicData[];
    moveSpeed: number;

    winProgress: number;
    winExp: number;
    drop: GetPropData[];

    showHideStruct?: MapMemberShowHideCountStruct;
    moveDirection?: MapPioneerMoveDirection;

    actionEventId?: string;
    eventStatus?: MapPioneerEventStatus;

    purchaseMovingBuildingId?: string;
    purchaseMovingPioneerId?: string;
}

export interface MapPlayerPioneerData extends MapPioneerData {
    rebirthCountTime: number;
    killerId: string;
    NFTLinkId: string,
}

export interface MapNpcPioneerData extends MapPioneerData {
    talkId: string;
    talkCountStruct: MapMemberGetTalkCountStruct;
}




export interface MapPioneerObject extends MapPioneerData {
    stayPos: Vec2;
    movePaths: TilePos[];
    logics: MapPioneerLogicObject[];
}

export interface MapPlayerPioneerObject extends MapPlayerPioneerData {
    stayPos: Vec2;
    movePaths: TilePos[];
    logics: MapPioneerLogicObject[];
}

export interface MapNpcPioneerObject extends MapNpcPioneerData {
    stayPos: Vec2;
    movePaths: TilePos[];
    logics: MapPioneerLogicObject[];
}