import { s2c_user } from "../Net/msg/WebsocketMsg";
import { ItemConfigType } from "./Item";

export const GAME_ENV_IS_DEBUG = true;
export const PioneerGameTest = false;

export type DataMgrResData = s2c_user.Iplayer_building_delegate_nft_res | s2c_user.Iplayer_generate_troop_res | s2c_user.Iplayer_generate_energy_res | s2c_user.Iplayer_get_auto_energy_res | s2c_user.Iplayer_building_levelup_res | s2c_user.Iplayer_artifact_equip_res | s2c_user.Iplayer_artifact_remove_res | s2c_user.Iplayer_treasure_open_res | s2c_user.Iplayer_item_use_res | s2c_user.player_event_select_res | s2c_user.Iplayer_fight_res | s2c_user.Iplayer_explore_res | s2c_user.Iplayer_gather_res | s2c_user.Iplayer_talk_select_res;

export enum AttrType {
    HP = 0,
    ATTACK = 1,
}
export enum AttrChangeType {
    ADD = 1,
    MUL = 2,
}

export enum BackpackArrangeType {
    Recently = "Recently",
    Rarity = "Rarity",
    Type = "Type"
}

export enum ResourceCorrespondingItem {
    Food = "8001",
    Wood = "8002",
    Stone = "8003",
    Troop = "8004",
    Energy = "8005",
    Gold = "8006",
    NFTExp = "8007",
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

export enum GameExtraEffectType {
    CITY_ONLY_VISION_RANGE = -1,
    PIONEER_ONLY_VISION_RANGE = -2,
    CITY_AND_PIONEER_VISION_RANGE = -3,

    BUILDING_LVUP_TIME = 1, //
    BUILDING_LVLUP_RESOURCE = 2, //
    MOVE_SPEED = 3, //
    GATHER_TIME = 4, //
    ENERGY_GENERATE = 5, //
    TROOP_GENERATE_TIME = 6, //
    CITY_RADIAL_RANGE = 7,
    TREASURE_PROGRESS = 8,
    VISION_RANGE = 9,
}
export type GameSingleParamEffectType = [number];
export type GameDoubleParamEffectType = [number, number];

export const enum ECursorType {
    Common = 0,
    Action = 1,
    Error = 2,
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

export enum MapMemberTargetType {
    pioneer = 0,
    building = 1,
}

export interface MapMemberShowStruct {
    target: MapMemberTargetType;
    show: boolean;
}

export interface MapMemberShowHideCountStruct {
    countTime: number;
    isShow: boolean;
}
export interface MapMemberGetTalkCountStruct {
    countTime: number;
    talkId: string;
}
