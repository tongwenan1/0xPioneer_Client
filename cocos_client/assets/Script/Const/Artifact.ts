import { AttrChangeType, AttrType, GameDoubleParamEffectType, GameExtraEffectType, GameSingleParamEffectType } from "./ConstDefine";

export class ArtifactConfigData {
    configId: string;
    name: string;
    rank: number; // rank 1-5
    icon: string;
    prop: AttrType[];
    prop_value: [AttrChangeType, number][];
    effect: string[];
    eff_sp: string;
    des: string;
    ani: string;
}



export class ArtifactEffectConfigData {
    effectId: string;
    name: string;
    rank: number; // rank 1-5
    type: GameExtraEffectType;
    para: GameSingleParamEffectType | GameDoubleParamEffectType;
    des: string;
    unlock: number; // require clv
}