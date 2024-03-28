import { ItemConfigType } from "./ConstDefine";

export interface LvlupConfigData {
    id: string;
    exp: number;
    extra_res: number;
    hp_max: number;
    city_vision: number;
    city_feature: number;
    event_building: string[] | null;
    reward: [ItemConfigType, string, number][] | null;
}