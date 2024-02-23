export enum ItemType {
    TaskItem = 1,
    AddProp = 2, // coin, energy, wood, food, stone, troop
}

export default class ItemData {

    public itemConfigId: number; // item config id 
    public count: number; // count
    public addTimeStamp: number;

    public constructor(itemConfigId: number, count: number) {
        this.itemConfigId = itemConfigId;
        this.count = count;
        this.addTimeStamp = 0;
    }
}

export class ItemConfigData {
    configId: number;
    itemType: ItemType; // item type
    itemName: string;
    itemDesc: string;
    grade: number; // grade 1-5
    // gain prop config, itemType = ItemType.GainProp
    gainPropName: string;
    gainPropCount: number;
}