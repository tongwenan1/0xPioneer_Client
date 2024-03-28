export enum ItemArrangeType {
    Recently = "Recently",
    Rarity = "Rarity",
    Type = "Type",
}

export enum ItemType {
    Resource = 0,
    TaskItem = 1,
    AddProp = 2, // coin, energy, wood, food, stone, troop
}

export enum ItemConfigType {
    Item = 1,
    Artifact = 3,
    Drop = 4,
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
    gain_item: null | [ItemConfigType, string, number];
}

export default class ItemData {
    public itemConfigId: string; // item config id
    public count: number; // count
    public addTimeStamp: number;

    public constructor(itemConfigId: string, count: number) {
        this.itemConfigId = itemConfigId;
        this.count = count;
        this.addTimeStamp = 0;
    }
}
