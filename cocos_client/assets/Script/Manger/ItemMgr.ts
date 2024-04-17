import { SpriteFrame, resources, sys } from "cc";
import { ResourcesMgr, SettlementMgr, UserInfoMgr } from "../Utils/Global";
import ItemData from "../Model/ItemData";
import NotificationMgr from "../Basic/NotificationMgr";
import ItemConfig from "../Config/ItemConfig";
import { ItemArrangeType, ItemType } from "../Const/Item";
import { NotificationName } from "../Const/Notification";
import { ResourceCorrespondingItem } from "../Const/ConstDefine";
import { DataMgr } from "../Data/DataMgr";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";

export default class ItemMgr {
    private _localItemDatas: ItemData[] = [];

    private _itemIconSpriteFrames = {};

    public constructor() { }

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

    public addItem(items: ItemData[], needSettlement: boolean = true): void {
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

                } else if (DataMgr.s.item.itemIsFull()) {
                    continue;
                }
                changed = true;
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
                    if (needSettlement) {
                        if (
                            itemConfig.configId == ResourceCorrespondingItem.Food ||
                            itemConfig.configId == ResourceCorrespondingItem.Wood ||
                            itemConfig.configId == ResourceCorrespondingItem.Stone
                        ) {
                            DataMgr.s.settlement.addObj({
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
                            DataMgr.s.settlement.addObj({
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
                            DataMgr.s.settlement.addObj({
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
                    }
                } else {
                    item.addTimeStamp = new Date().getTime();
                    this._localItemDatas.push(item);
                }
            }
        }
        if (changed) {
            DataMgr.s.item.saveObj()
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
            DataMgr.s.settlement.addObj({
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
            DataMgr.s.settlement.addObj({
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
            DataMgr.s.settlement.addObj({
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
        DataMgr.s.item.saveObj()
        NotificationMgr.triggerEvent(NotificationName.ITEM_CHANGE);

        return true;
    }
}
