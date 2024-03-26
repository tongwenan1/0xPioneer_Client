export enum ArtifactArrangeType {
    Recently = "Recently",
    Rarity = "Rarity",
}

export enum ArtifactProp {
    HP = 0,
    ATTACK = 1,
}

export enum ArtifactPropValueType {
    ADD = 1,
    MUL = 2,
}

export enum ArtifactEffectRankColor {
    RANK1 = "#40ffa3",
    RANK2 = "#409aff",
    RANK3 = "#dd40ff",
    RANK4 = "#ff9e40",
    RANK5 = "#ff4040",
}

export enum ArtifactEffectType {
    BUILDING_LVUP_TIME = 1,
    BUILDING_LVLUP_RESOURCE = 2,
    MOVE_SPEED = 3,
    GATHER_TIME = 4,
}

export class ArtifactConfigData {
    configId: string;
    name: string;
    rank: number; // rank 1-5
    icon: string;
    prop: number[];
    prop_value: number[][];
    effect: string[];
    des: string;
}

export class ArtifactEffectConfigData {
    effectId: string;
    name: string;
    rank: number; // rank 1-5
    type: number;
    para: number[];
    des: string;
    unlock: number; // require clv
}
