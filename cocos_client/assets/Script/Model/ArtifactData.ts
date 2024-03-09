export enum ArtifactProp {
    HP = 0,
    ATTACK = 1,
}
export enum ArtifactPropValueType {
    ADD = 1,
    MUL = 2,
}
export enum ArtifactEffectRankColor {
    RANK1 = "#FFFFFF",
    RANK2 = "#00FF1F",
    RANK3 = "#01F5FF",
    RANK4 = "#CD00FF",
    RANK5 = "#393939",
}
export enum ArtifactEffectType {
    BUILDING_LVUP_TIME = 1,
    BUILDING_LVLUP_RESOURCE = 2,
    MOVE_SPEED = 3,
    GATHER_TIME = 4,
}

export default class ArtifactData {
    public artifactConfigId: string; // artifact config id
    public count: number; // count
    public addTimeStamp: number;

    public constructor(artifactConfigId: string, count: number) {
        this.artifactConfigId = artifactConfigId;
        this.count = count;
        this.addTimeStamp = 0;
    }
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
}
