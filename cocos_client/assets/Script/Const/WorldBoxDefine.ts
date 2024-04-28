export type WorldBoxConfigItemId = string;
export type WorldBoxConfigItemNum = number;
export type WorldBoxConfigItemLimitTotalNum = number;

export interface WorldBoxConfigData {
    id: string;
    day: number;
    rank: number;
    level: number;
    reward: [WorldBoxConfigItemId, WorldBoxConfigItemNum, WorldBoxConfigItemLimitTotalNum][];
}