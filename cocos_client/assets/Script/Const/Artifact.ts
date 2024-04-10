import { AttrChangeType, AttrType } from "./ConstDefine";

export enum ArtifactArrangeType {
    Recently = "Recently",
    Rarity = "Rarity",
}

export enum ArtifactEffectType {
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
    VISION_RANGE = 9
}

export class ArtifactConfigData {
    configId: string;
    name: string;
    rank: number; // rank 1-5
    icon: string;
    prop: AttrType[];
    prop_value: [AttrChangeType, number][];
    effect: string[];
    des: string;
}

export type ArtifactNumEffectType = [number];
export type ArtifactVisionEffectType = [number, number];

export class ArtifactEffectConfigData {
    effectId: string;
    name: string;
    rank: number; // rank 1-5
    type: ArtifactEffectType;
    para: ArtifactNumEffectType | ArtifactVisionEffectType;
    des: string;
    unlock: number; // require clv
}
