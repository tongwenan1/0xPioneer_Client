export enum ArtifactProp {
    HP = 0,
    ATTACK = 1,
}
export enum ArtifactPropValueType {
    ADD = 1,
    MUL = 2,
}
export enum ArtifactEffectRankColor {
    RANK1 = "#333333",
    RANK2 = "#003333",
    RANK3 = "#330033",
    RANK4 = "#333300",
    RANK5 = "#666666",
}
export enum ArtifactEffectType {
    BUILDING_LVUP_TIME = 1,
    BUILDING_LVLUP_RESOURCE = 2,
    MOVE_SPEED = 3,
    GATHER_TIME = 4,
}

export default class ArtifactData {
    public artifactConfigId: number; // artifact config id
    public count: number; // count
    public addTimeStamp: number;

    public constructor(artifactConfigId: number, count: number) {
        this.artifactConfigId = artifactConfigId;
        this.count = count;
        this.addTimeStamp = 0;
    }
}

export class ArtifactConfigData {
    configId: number;
    name: string;
    rank: number; // rank 1-5
    icon: string;
    prop: number[];
    prop_value: number[][];
    effect: number[];
    des: string;
}

export class ArtifactEffectConfigData {
    effectId: number;
    name: string;
    rank: number; // rank 1-5
    type: number;
    para: number[];
    des: string;
}
