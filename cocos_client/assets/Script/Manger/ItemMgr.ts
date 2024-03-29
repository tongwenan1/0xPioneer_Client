import { SpriteFrame, resources, sys } from "cc";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";
import { ResourcesMgr, SettlementMgr, UserInfoMgr } from "../Utils/Global";
import ItemData from "../Model/ItemData";
import { ResourceCorrespondingItem } from "../Const/ConstDefine";
import { FinishedEvent } from "../Const/UserInfoDefine";
import NotificationMgr from "../Basic/NotificationMgr";
import ItemConfig from "../Config/ItemConfig";
import { ItemArrangeType, ItemType } from "../Const/Item";
import CLog from "../Utils/CLog";
import { NotificationName } from "../Const/Notification";

export default class ItemMgr {
    private _maxItemLength: number = 100;
    private _localStorageKey: string = "item_data";
    private _localItemDatas: ItemData[] = [];

    private _itemIconSpriteFrames = {};

    public get itemIsFull(): boolean {
        let count: number = 0;
        for (const temple of this._localItemDatas) {
            const itemConf = ItemConfig.getById(temple.itemConfigId);
            if (itemConf != null && itemConf.itemType != ItemType.Resource) {
                count += 1;
            }
        }
        return count >= this._maxItemLength;
    }
    public get maxItemLength(): number {
        return this._maxItemLength;
    }
    public get localItemDatas(): ItemData[] {
        return this._localItemDatas;
    }
    public get localBackpackItemDatas(): ItemData[] {
        return this._localItemDatas.filter((item) => {
            const config = ItemConfig.getById(item.itemConfigId);
            if (config == null) {
                return false;
            }
            return config.itemType != ItemType.Resource;
        });
    }

    public constructor() {}

    public async getItemIcon(iconName: string): Promise<SpriteFrame> {
        if (iconName in this._itemIconSpriteFrames) {
            return this._itemIconSpriteFrames[iconName];
        }
        const frame = await ResourcesMgr.LoadABResource("icon/item/" + iconName + "/spriteFrame", SpriteFrame);
        if (frame != null) {
            this._itemIconSpriteFrames[iconName] = frame;
        }
        return this._itemIconSpriteFrames[iconName];
    }

    public async initData() {
        // load local item data
        const jsonStr = sys.localStorage.getItem(this._localStorageKey);
        if (jsonStr) {
            try {
                this._localItemDatas = JSON.parse(jsonStr);
                return true;
            } catch (e) {
                CLog.error("ItemMgr initData error", e);
                return false;
            }
        }
        return true;
    }

    public getOwnItemCount(itemConfigId: string): number {
        let count: number = 0;
        for (const item of this._localItemDatas) {
            if (item.itemConfigId == itemConfigId) {
                count += item.count;
            }
        }
        return count;
    }

    public addItem(items: ItemData[]): void {
        if (items.length <= 0) {
            return;
        }
        let changed: boolean = false;
        for (const item of items) {
            const itemConfig = ItemConfig.getById(item.itemConfigId);
            if (itemConfig == null) {
            } else {
                if (itemConfig.itemType == ItemType.Resource) {
                    NotificationMgr.triggerEvent(NotificationName.RESOURCE_GETTED, item);

                } else if (this.itemIsFull) {
                    continue;
                }
                changed = true;
                if (item.itemConfigId == "9") {
                    //get master key
                    UserInfoMgr.finishEvent(FinishedEvent.BecomeCityMaster);
                }
                // add timestamp
                if (itemConfig.itemType == ItemType.Resource) {
                    const exsitItems = this._localItemDatas.filter((v) => v.itemConfigId == item.itemConfigId);
                    if (exsitItems.length > 0) {
                        exsitItems[0].count += item.count;
                        exsitItems[0].addTimeStamp = new Date().getTime();
                    } else {
                        item.addTimeStamp = new Date().getTime();
                        this._localItemDatas.push(item);
                    }
                    // settlementCount
                    if (
                        itemConfig.configId == ResourceCorrespondingItem.Food ||
                        itemConfig.configId == ResourceCorrespondingItem.Wood ||
                        itemConfig.configId == ResourceCorrespondingItem.Stone
                    ) {
                        SettlementMgr.insertSettlement({
                            level: UserInfoMgr.level,
                            newPioneerIds: [],
                            killEnemies: 0,
                            gainResources: item.count,
                            consumeResources: 0,
                            gainTroops: 0,
                            consumeTroops: 0,
                            gainEnergy: 0,
                            consumeEnergy: 0,
                            exploredEvents: 0,
                        });
                    } else if (itemConfig.configId == ResourceCorrespondingItem.Troop) {
                        SettlementMgr.insertSettlement({
                            level: UserInfoMgr.level,
                            newPioneerIds: [],
                            killEnemies: 0,
                            gainResources: 0,
                            consumeResources: 0,
                            gainTroops: item.count,
                            consumeTroops: 0,
                            gainEnergy: 0,
                            consumeEnergy: 0,
                            exploredEvents: 0,
                        });
                    } else if (itemConfig.configId == ResourceCorrespondingItem.Energy) {
                        SettlementMgr.insertSettlement({
                            level: UserInfoMgr.level,
                            newPioneerIds: [],
                            killEnemies: 0,
                            gainResources: 0,
                            consumeResources: 0,
                            gainTroops: 0,
                            consumeTroops: 0,
                            gainEnergy: item.count,
                            consumeEnergy: 0,
                            exploredEvents: 0,
                        });
                    }
                } else {
                    item.addTimeStamp = new Date().getTime();
                    this._localItemDatas.push(item);
                }
            }
        }
        if (changed) {
            localStorage.setItem(this._localStorageKey, JSON.stringify(this._localItemDatas));
            NotificationMgr.triggerEvent(NotificationName.ITEM_CHANGE);
        }
    }

    public subItem(itemConfigId: string, count: number): boolean {
        let idx = this._localItemDatas.findIndex((v) => {
            return v.itemConfigId == itemConfigId;
        });

        if (idx < 0) {
            return false;
        }

        if (this._localItemDatas[idx].count < count) {
            return false;
        }

        this._localItemDatas[idx].count -= count;

        let isResource: boolean = false;
        // settlementCount
        if (
            itemConfigId == ResourceCorrespondingItem.Food ||
            itemConfigId == ResourceCorrespondingItem.Wood ||
            itemConfigId == ResourceCorrespondingItem.Stone
        ) {
            SettlementMgr.insertSettlement({
                level: UserInfoMgr.level,
                newPioneerIds: [],
                killEnemies: 0,
                gainResources: 0,
                consumeResources: count,
                gainTroops: 0,
                consumeTroops: 0,
                gainEnergy: 0,
                consumeEnergy: 0,
                exploredEvents: 0,
            });
            isResource = true;
        } else if (itemConfigId == ResourceCorrespondingItem.Troop) {
            SettlementMgr.insertSettlement({
                level: UserInfoMgr.level,
                newPioneerIds: [],
                killEnemies: 0,
                gainResources: 0,
                consumeResources: 0,
                gainTroops: 0,
                consumeTroops: count,
                gainEnergy: 0,
                consumeEnergy: 0,
                exploredEvents: 0,
            });
            isResource = true;
        } else if (itemConfigId == ResourceCorrespondingItem.Energy) {
            SettlementMgr.insertSettlement({
                level: UserInfoMgr.level,
                newPioneerIds: [],
                killEnemies: 0,
                gainResources: 0,
                consumeResources: 0,
                gainTroops: 0,
                consumeTroops: 0,
                gainEnergy: 0,
                consumeEnergy: count,
                exploredEvents: 0,
            });
            isResource = true;
        }
        if (isResource) {
            NotificationMgr.triggerEvent(NotificationName.RESOURCE_CONSUMED);
        }

        const itemConfig = ItemConfig.getById(itemConfigId);
        if (itemConfig != null) {
            if (itemConfig.gain_item != null) {
                if (itemConfig.gain_item.length == 3) {
                    ItemConfigDropTool.getItemByConfig([
                        {
                            type: itemConfig.gain_item[0],
                            propId: itemConfig.gain_item[1],
                            num: itemConfig.gain_item[2],
                        },
                    ]);
                }
            }
        }

        if (this._localItemDatas[idx].count <= 0) {
            this._localItemDatas.splice(idx, 1);
        }
        localStorage.setItem(this._localStorageKey, JSON.stringify(this._localItemDatas));
        NotificationMgr.triggerEvent(NotificationName.ITEM_CHANGE);

        return true;
    }

    public arrange(sortType: ItemArrangeType): void {
        // merge same item
        const singleItems: Map<string, ItemData> = new Map();
        for (let i = 0; i < this._localItemDatas.length; i++) {
            const item = this._localItemDatas[i];
            if (singleItems.has(item.itemConfigId)) {
                const savedItem = singleItems.get(item.itemConfigId);
                savedItem.count += item.count;
                savedItem.addTimeStamp = Math.max(savedItem.addTimeStamp, item.addTimeStamp);
                this._localItemDatas.splice(i, 1);
                i--;
            } else {
                singleItems.set(item.itemConfigId, item);
            }
        }

        localStorage.setItem(this._localStorageKey, JSON.stringify(this._localItemDatas));

        // sort
        if (sortType == ItemArrangeType.Recently) {
            this._localItemDatas.sort((a, b) => {
                return b.addTimeStamp - a.addTimeStamp;
            });
        } else if (sortType == ItemArrangeType.Rarity) {
            //bigger in front
            this._localItemDatas.sort((a, b) => {
                return ItemConfig.getById(b.itemConfigId).grade - ItemConfig.getById(a.itemConfigId).grade;
            });
        } else if (sortType == ItemArrangeType.Type) {
            //smaller in front
            this._localItemDatas.sort((a, b) => {
                return ItemConfig.getById(a.itemConfigId).itemType - ItemConfig.getById(b.itemConfigId).itemType;
            });
        }

        NotificationMgr.triggerEvent(NotificationName.ITEM_CHANGE);
    }
}
