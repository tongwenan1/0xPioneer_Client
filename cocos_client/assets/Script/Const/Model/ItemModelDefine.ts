export enum ItemType {
    Resource = 0,
    TaskItem = 1,
    AddProp = 2, // coin, energy, wood, food, stone, troop
}

export class ItemConfigData {
    configId: string;
    itemType: ItemType; // item type
    icon: string;
    itemName: string;
    itemDesc: string;
    grade: number; // grade 1-5
    // gain prop config, itemType = ItemType.GainProp
    // gainPropId: string;
    // gainPropCount: number;
    gain_item: null | [number, string, number];
}