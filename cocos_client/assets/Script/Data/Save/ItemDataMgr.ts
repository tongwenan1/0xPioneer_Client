import ItemConfig from "../../Config/ItemConfig";
import ItemData, { ItemType } from "../../Const/Item";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import { BackpackArrangeType, GetPropData, ResourceCorrespondingItem } from "../../Const/ConstDefine";
import NetGlobalData from "./Data/NetGlobalData";

export class ItemDataMgr {
    private _data: ItemData[];
    private _maxItemLength: number = 100;

    public loadObj() {
        this._initData();
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

    public getObj_item_sort(sortType: BackpackArrangeType) {
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

        // sort
        if (sortType == BackpackArrangeType.Recently) {
            this._data.sort((a, b) => {
                return b.addTimeStamp - a.addTimeStamp;
            });
        } else if (sortType == BackpackArrangeType.Rarity) {
            //bigger in front
            this._data.sort((a, b) => {
                return ItemConfig.getById(b.itemConfigId).grade - ItemConfig.getById(a.itemConfigId).grade;
            });
        } else if (sortType == BackpackArrangeType.Type) {
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

    public countChanged(change: ItemData): void {
        if (change.count == 0) {
            return;
        }
        const config = ItemConfig.getById(change.itemConfigId);
        if (config == null) {
            return;
        }
        let exsitIndex: number = -1;
        for (let i = 0; i < this._data.length; i++) {
            if (this._data[i].itemConfigId == change.itemConfigId) {
                exsitIndex = i;
                break;
            }
        }
        if (exsitIndex >= 0) {
            this._data[exsitIndex].count += change.count;
            if (change.count < 0 && this._data[exsitIndex].count <= 0) {
                this._data.splice(exsitIndex, 1);
            }
        } else {
            if (change.count > 0) {
                this._data.push(change);
            }
        }
        if (change.count > 0) {
            if (config.itemType == ItemType.Resource) {
                NotificationMgr.triggerEvent(NotificationName.RESOURCE_GETTED, { item: change });
            }
        } else if (change.count < 0) {
            if (config.itemType == ItemType.Resource) {
                NotificationMgr.triggerEvent(NotificationName.RESOURCE_CONSUMED, { item: change });
            }
        }
        NotificationMgr.triggerEvent(NotificationName.ITEM_CHANGE);
    }
    public addObj_item(items: ItemData[], needSettlement: boolean = true): void {
        if (items.length <= 0) {
            return;
        }
        let changed: boolean = false;
        for (const item of items) {
            const itemConfig = ItemConfig.getById(item.itemConfigId);
            if (itemConfig == null) {
                continue;
            }
            if (itemConfig.itemType == ItemType.Resource) {
                NotificationMgr.triggerEvent(NotificationName.RESOURCE_GETTED, { item: item });
            } else if (this.itemIsFull()) {
                continue;
            }
            changed = true;
            // add timestamp
            item.addTimeStamp = new Date().getTime();
            this._data.push(item);
            this.getObj_item_sort(BackpackArrangeType.Recently);
        }
        if (changed) {
            NotificationMgr.triggerEvent(NotificationName.ITEM_CHANGE);
        }
    }
    public subObj_item(itemConfigId: string, count: number): { succeed: boolean; getItem: GetPropData } {
        const result = {
            succeed: false,
            getItem: null,
        };
        let idx = this._data.findIndex((v) => {
            return v.itemConfigId == itemConfigId;
        });

        if (idx < 0) {
            return result;
        }

        if (this._data[idx].count < count) {
            return result;
        }

        this._data[idx].count -= count;

        const itemConfig = ItemConfig.getById(itemConfigId);
        if (itemConfig != null) {
            if (itemConfig.gain_item != null) {
                result.getItem = {
                    type: itemConfig.gain_item[0],
                    propId: itemConfig.gain_item[1],
                    num: itemConfig.gain_item[2],
                };
            }
        }

        if (
            itemConfigId == ResourceCorrespondingItem.Food ||
            itemConfigId == ResourceCorrespondingItem.Wood ||
            itemConfigId == ResourceCorrespondingItem.Stone ||
            itemConfigId == ResourceCorrespondingItem.Gold ||
            itemConfigId == ResourceCorrespondingItem.Troop ||
            itemConfigId == ResourceCorrespondingItem.Energy
        ) {
            NotificationMgr.triggerEvent(NotificationName.RESOURCE_CONSUMED, { itemConfigId: itemConfigId, count: count, getItem: result.getItem });
        }

        if (this._data[idx].count <= 0) {
            this._data.splice(idx, 1);
        }
        NotificationMgr.triggerEvent(NotificationName.ITEM_CHANGE);

        result.succeed = true;

        return result;
    }

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

    private _initData() {
        if (NetGlobalData.storehouse == null) {
            return;
        }
        this._data = [];

        const netItems = NetGlobalData.storehouse.items;
        for (const key in netItems) {
            const item = new ItemData(netItems[key].itemConfigId, netItems[key].count);
            item.addTimeStamp = netItems[key].addTimeStamp;
            this._data.push(item);
        }
        console.log("exce item:", this._data);
    }
}
