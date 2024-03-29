import { AttrChangeType } from "../ConstDefine";

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
    commonmove = -1,
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