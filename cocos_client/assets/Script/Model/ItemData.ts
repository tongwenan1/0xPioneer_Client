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