import { ItemType } from "./ConstDefine";

export default class ItemData{
    itemId:number;
    itemType: ItemType;
    cout:number;

    /**
     * 
     * @param itemType 
     * @param cout 
     * @param itemId reserved, use first itemType
     */
    public constructor(itemType:ItemType, cout:number,itemId:number = 0) {
        this.itemId = itemId;
        this.itemType = itemType;
        this.cout = cout;
    }
    
}