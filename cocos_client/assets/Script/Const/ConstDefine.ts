import { ItemConfigType } from "./Item";

export const GAME_ENV_IS_DEBUG = false;
export const PioneerGameTest = false;

export enum AttrType {
    HP = 0,
    ATTACK = 1,
}
export enum AttrChangeType {
    ADD = 1,
    MUL = 2,
}

export enum ResourceCorrespondingItem {
    Food = "8001",
    Wood = "8002",
    Stone = "8003",
    Troop = "8004",
    Energy = "8005",
    Gold = "8006",
    NFTExp = "8007"
}

export enum NPCNameLangType {
    Prophetess = "502001",
    DefaultPlayer = "502002",
    DoomsdayGangSpy = "502003",
    Hunter = "502004",
    SecretGuard = "502005",
    DoomsdayGangBigTeam = "502006",
    Artisan = "502007",
}

export const enum ECursorType {
    Common = 0,
    Action = 1,
    Error = 2
}

export const enum ECursorStyle {
    url = "url",
    default = "default",
    auto = "auto",
    crosshair = "crosshair",
    pointer = "pointer",
    move = "move",
    e_resize = "e-resize",
    ne_resize = "ne-resize",
    nw_resize = "nw-resize",
    n_resize = "n-resize",
    se_resize = "se-resize",
    sw_resize = "sw-resize",
    s_resize = "s-resize",
    w_resize = "w-resize",
    text = "text",
    wait = "wait",
    help = "help",
}

export interface GetPropData {
    type: ItemConfigType;
    propId: string;
    num: number;
}

export interface ResourceData {
    type: ResourceCorrespondingItem;
    num: number;
}

export enum GetPropRankColor {
    RANK1 = "#40ffa3",
    RANK2 = "#409aff",
    RANK3 = "#dd40ff",
    RANK4 = "#ff9e40",
    RANK5 = "#ff4040",
}

export enum MapMemberFactionType {
    enemy = 0,
    friend = 1,
    neutral = 2,
}

export interface MapMemberShowHideCountStruct {
    countTime: number,
    isShow: boolean
}
export interface MapMemberGetTalkCountStruct {
    countTime: number,
    talkId: string
}
