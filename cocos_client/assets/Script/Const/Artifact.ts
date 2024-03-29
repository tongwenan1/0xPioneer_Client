import { AttrChangeType, AttrType } from "./ConstDefine";

export enum ArtifactArrangeType {
    Recently = "Recently",
    Rarity = "Rarity",
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
    prop: AttrType[];
    prop_value: [AttrChangeType, number][];
    effect: string[];
    des: string;
}

export class ArtifactEffectConfigData {
    effectId: string;
    name: string;
    rank: number; // rank 1-5
    type: ArtifactEffectType;
    para: number[];
    des: string;
    unlock: number; // require clv
}
