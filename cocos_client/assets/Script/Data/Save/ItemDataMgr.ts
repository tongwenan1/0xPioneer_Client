import { Vec2 } from "cc";
import ItemConfig from "../../Config/ItemConfig";
import ItemData, { ItemArrangeType, ItemType } from "../../Const/Item";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import { ResourceCorrespondingItem } from "../../Const/ConstDefine";
import { DataMgr } from "../DataMgr";
import ItemConfigDropTool from "../../Tool/ItemConfigDropTool";

export class ItemDataMgr {
    private _data: ItemData[];
    private _key: string = "item_data";
    private _maxItemLength: number = 100;

    public async loadObj() {
        if (this._data == null) {
            this._data = [];
            const data = localStorage.getItem(this._key);
            if (data) {
                this._data = JSON.parse(data);
            }
        }
    }

    public getObj() {
        return this._data;
    }

    public getObj_item_maxLength() {
        return this._maxItemLength;
    }

    public getObj_item_count(itemConfigId: string): number {
        let count: number = 0;
        for (const item of this._data) {
            if (item.itemConfigId == itemConfigId) {
                count += item.count;
            }
        }
        return count;
    }

    public getObj_item_sort(sortType: ItemArrangeType) {
        const singleItems: Map<string, ItemData> = new Map();
        for (let i = 0; i < this._data.length; i++) {
            const item = this._data[i];
            if (singleItems.has(item.itemConfigId)) {
                const savedItem = singleItems.get(item.itemConfigId);
                savedItem.count += item.count;
                savedItem.addTimeStamp = Math.max(savedItem.addTimeStamp, item.addTimeStamp);
                this._data.splice(i, 1);
                i--;
            } else {
                singleItems.set(item.itemConfigId, item);
            }
        }

        this.saveObj();

        // sort
        if (sortType == ItemArrangeType.Recently) {
            this._data.sort((a, b) => {
                return b.addTimeStamp - a.addTimeStamp;
            });
        } else if (sortType == ItemArrangeType.Rarity) {
            //bigger in front
            this._data.sort((a, b) => {
                return ItemConfig.getById(b.itemConfigId).grade - ItemConfig.getById(a.itemConfigId).grade;
            });
        } else if (sortType == ItemArrangeType.Type) {
            //smaller in front
            this._data.sort((a, b) => {
                return ItemConfig.getById(a.itemConfigId).itemType - ItemConfig.getById(b.itemConfigId).itemType;
            });
        }

        NotificationMgr.triggerEvent(NotificationName.ITEM_CHANGE);
    }

    public getObj_item_skillbook(): ItemData[] {
        return this._data.filter((item) => {
            const config = ItemConfig.getById(item.itemConfigId);
            if (config == null) {
                return false;
            }
            return config.itemType == ItemType.SkillBook;
        });
    }

    public getObj_item_backpack(): ItemData[] {
        return this._data.filter((item) => {
            const config = ItemConfig.getById(item.itemConfigId);
            if (config == null) {
                return false;
            }
            return config.itemType != ItemType.Resource;
        });
    }

    // public addObj_item(items: ItemData[], needSettlement: boolean = true): void {
    //     if (items.length <= 0) {
    //         return;
    //     }
    //     let changed: boolean = false;
    //     for (const item of items) {
    //         const itemConfig = ItemConfig.getById(item.itemConfigId);
    //         if (itemConfig == null) {
    //         } else {
    //             if (itemConfig.itemType == ItemType.Resource) {
    //                 NotificationMgr.triggerEvent(NotificationName.RESOURCE_GETTED, item);

    //             } else if (this.itemIsFull) {
    //                 continue;
    //             }
    //             changed = true;
    //             // add timestamp
    //             if (itemConfig.itemType == ItemType.Resource) {
    //                 const exsitItems = this._data.filter((v) => v.itemConfigId == item.itemConfigId);
    //                 if (exsitItems.length > 0) {
    //                     exsitItems[0].count += item.count;
    //                     exsitItems[0].addTimeStamp = new Date().getTime();
    //                 } else {
    //                     item.addTimeStamp = new Date().getTime();
    //                     this._data.push(item);
    //                 }
    //                 // settlementCount
    //                 if (needSettlement) {
    //                     if (
    //                         itemConfig.configId == ResourceCorrespondingItem.Food ||
    //                         itemConfig.configId == ResourceCorrespondingItem.Wood ||
    //                         itemConfig.configId == ResourceCorrespondingItem.Stone
    //                     ) {
    //                         DataMgr.s.settlement.addObj({
    //                             level: UserInfoMgr.level,
    //                             newPioneerIds: [],
    //                             killEnemies: 0,
    //                             gainResources: item.count,
    //                             consumeResources: 0,
    //                             gainTroops: 0,
    //                             consumeTroops: 0,
    //                             gainEnergy: 0,
    //                             consumeEnergy: 0,
    //                             exploredEvents: 0,
    //                         });
    //                     } else if (itemConfig.configId == ResourceCorrespondingItem.Troop) {
    //                         DataMgr.s.settlement.addObj({
    //                             level: UserInfoMgr.level,
    //                             newPioneerIds: [],
    //                             killEnemies: 0,
    //                             gainResources: 0,
    //                             consumeResources: 0,
    //                             gainTroops: item.count,
    //                             consumeTroops: 0,
    //                             gainEnergy: 0,
    //                             consumeEnergy: 0,
    //                             exploredEvents: 0,
    //                         });
    //                     } else if (itemConfig.configId == ResourceCorrespondingItem.Energy) {
    //                         DataMgr.s.settlement.addObj({
    //                             level: UserInfoMgr.level,
    //                             newPioneerIds: [],
    //                             killEnemies: 0,
    //                             gainResources: 0,
    //                             consumeResources: 0,
    //                             gainTroops: 0,
    //                             consumeTroops: 0,
    //                             gainEnergy: item.count,
    //                             consumeEnergy: 0,
    //                             exploredEvents: 0,
    //                         });
    //                     }
    //                 }
    //             } else {
    //                 item.addTimeStamp = new Date().getTime();
    //                 this._data.push(item);
    //             }
    //         }
    //     }
    //     if (changed) {
    //         this.saveObj();
    //         NotificationMgr.triggerEvent(NotificationName.ITEM_CHANGE);
    //     }
    // }

    // public updateObj_item(itemConfigId: string, count: number) {
    //     let idx = this._data.findIndex((v) => {
    //         return v.itemConfigId == itemConfigId;
    //     });

    //     if (idx < 0) {
    //         return false;
    //     }

    //     if (this._data[idx].count < count) {
    //         return false;
    //     }

    //     this._data[idx].count -= count;

    //     let isResource: boolean = false;
    //     // settlementCount
    //     if (
    //         itemConfigId == ResourceCorrespondingItem.Food ||
    //         itemConfigId == ResourceCorrespondingItem.Wood ||
    //         itemConfigId == ResourceCorrespondingItem.Stone
    //     ) {
    //         DataMgr.s.settlement.addObj({
    //             level: UserInfoMgr.level,
    //             newPioneerIds: [],
    //             killEnemies: 0,
    //             gainResources: 0,
    //             consumeResources: count,
    //             gainTroops: 0,
    //             consumeTroops: 0,
    //             gainEnergy: 0,
    //             consumeEnergy: 0,
    //             exploredEvents: 0,
    //         });
    //         isResource = true;
    //     } else if (itemConfigId == ResourceCorrespondingItem.Troop) {
    //         DataMgr.s.settlement.addObj({
    //             level: UserInfoMgr.level,
    //             newPioneerIds: [],
    //             killEnemies: 0,
    //             gainResources: 0,
    //             consumeResources: 0,
    //             gainTroops: 0,
    //             consumeTroops: count,
    //             gainEnergy: 0,
    //             consumeEnergy: 0,
    //             exploredEvents: 0,
    //         });
    //         isResource = true;
    //     } else if (itemConfigId == ResourceCorrespondingItem.Energy) {
    //         DataMgr.s.settlement.addObj({
    //             level: UserInfoMgr.level,
    //             newPioneerIds: [],
    //             killEnemies: 0,
    //             gainResources: 0,
    //             consumeResources: 0,
    //             gainTroops: 0,
    //             consumeTroops: 0,
    //             gainEnergy: 0,
    //             consumeEnergy: count,
    //             exploredEvents: 0,
    //         });
    //         isResource = true;
    //     }
    //     if (isResource) {
    //         NotificationMgr.triggerEvent(NotificationName.RESOURCE_CONSUMED);
    //     }

    //     const itemConfig = ItemConfig.getById(itemConfigId);
    //     if (itemConfig != null) {
    //         if (itemConfig.gain_item != null) {
    //             if (itemConfig.gain_item.length == 3) {
    //                 ItemConfigDropTool.getItemByConfig([
    //                     {
    //                         type: itemConfig.gain_item[0],
    //                         propId: itemConfig.gain_item[1],
    //                         num: itemConfig.gain_item[2],
    //                     },
    //                 ]);
    //             }
    //         }
    //     }

    //     if (this._data[idx].count <= 0) {
    //         this._data.splice(idx, 1);
    //     }
    //     this.saveObj();
    //     NotificationMgr.triggerEvent(NotificationName.ITEM_CHANGE);

    //     return true;
    // }

    public itemIsFull(): boolean {
        let count: number = 0;
        for (const temple of this._data) {
            const itemConf = ItemConfig.getById(temple.itemConfigId);
            if (itemConf != null && itemConf.itemType != ItemType.Resource) {
                count += 1;
            }
        }
        return count >= this._maxItemLength;
    }

    public async saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
    }
}
