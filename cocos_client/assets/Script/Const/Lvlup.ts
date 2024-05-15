import { ItemConfigType } from "./Item";

export type LvlupConfigItemId = string;
export type LvlupConfigItemCount = number;

export interface LvlupConfigData {
    id: string;
    exp: number;
    extra_res: number;
    hp_max: number;
    city_vision: number;
    city_feature: number;
    event_building: string[] | null;
    reward: [ItemConfigType, string, number][] | null;
    psyc_limit: number;
    p_exp: number;
    p_rank_1: [LvlupConfigItemId, LvlupConfigItemCount][];
    p_rank_2: [LvlupConfigItemId, LvlupConfigItemCount][];
    p_rank_3: [LvlupConfigItemId, LvlupConfigItemCount][];
    p_rank_4: [LvlupConfigItemId, LvlupConfigItemCount][];
    p_rank_5: [LvlupConfigItemId, LvlupConfigItemCount][];
}
