import { ItemConfigType } from "./Item";

export interface DropConfigData {
    id: string;
    type: number;
    drop_group: [ItemConfigType, number, number, string][];
}
