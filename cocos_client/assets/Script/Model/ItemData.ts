export enum ItemType{
    TaskItem = 1,
    AddProp = 2, // coin, energy, wood, food, stone, troop
}

export default class ItemData{
    itemId:number; // item unique id
    itemConfigId:number; // item config id 
    count:number; // count

    /**
     * 
     * @param count 
     * @param itemId reserved, use first itemType
     */
    public constructor(count:number, itemConfigId:number, itemId:number = 0) {
        this.itemId = itemId;
        this.count = count;
        this.itemConfigId = itemConfigId;
    }
    
}

export class ItemConfigData {
    Id:number;
    itemType: ItemType; // item type
    itemName:string;
    itemDesc:string;
    grade:number; // grade 1-5

    // gain prop config, itemType = ItemType.GainProp
    gainPropName:string;
    gainPropCount:number;
}