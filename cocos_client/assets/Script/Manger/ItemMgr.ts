import { SpriteFrame, resources, sys } from "cc";
import { ResourcesMgr } from "../Utils/Global";
import ItemData from "../Model/ItemData";
import ItemConfig from "../Config/ItemConfig";
import { ItemType } from "../Const/Item";
import { GetPropData, ResourceCorrespondingItem } from "../Const/ConstDefine";
import { DataMgr } from "../Data/DataMgr";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";

export default class ItemMgr {
    private _itemIconSpriteFrames = {};
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

    public addItem(items: ItemData[], needSettlement: boolean = true): void {
        if (items.length <= 0) {
            return;
        }
        DataMgr.s.item.addObj_item(items);

        // settlement
        if (needSettlement) {
            for (const item of items) {
                const itemConfig = ItemConfig.getById(item.itemConfigId);
                if (itemConfig == null) {
                    continue;
                }
                // add timestamp
                if (itemConfig.itemType == ItemType.Resource) {
                    // settlementCount
                    if (
                        itemConfig.configId == ResourceCorrespondingItem.Food ||
                        itemConfig.configId == ResourceCorrespondingItem.Wood ||
                        itemConfig.configId == ResourceCorrespondingItem.Stone
                    ) {
                        DataMgr.s.settlement.addObj({
                            level: DataMgr.s.userInfo.data.level,
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
                            level: DataMgr.s.userInfo.data.level,
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
                            level: DataMgr.s.userInfo.data.level,
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
            }
        }
    }

    public subItem(itemConfigId: string, count: number): boolean {
        const result: { succeed: boolean, getItem: GetPropData } = DataMgr.s.item.subObj_item(itemConfigId, count);
        if (!result.succeed) {
            return false;
        }

        // settlementCount
        if (
            itemConfigId == ResourceCorrespondingItem.Food ||
            itemConfigId == ResourceCorrespondingItem.Wood ||
            itemConfigId == ResourceCorrespondingItem.Stone
        ) {
            DataMgr.s.settlement.addObj({
                level: DataMgr.s.userInfo.data.level,
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
        } else if (itemConfigId == ResourceCorrespondingItem.Troop) {
            DataMgr.s.settlement.addObj({
                level: DataMgr.s.userInfo.data.level,
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
        } else if (itemConfigId == ResourceCorrespondingItem.Energy) {
            DataMgr.s.settlement.addObj({
                level: DataMgr.s.userInfo.data.level,
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
        }
        
        if (result.getItem != null) {
            ItemConfigDropTool.getItemByConfig([result.getItem]);
        }
        return true;
    }
}
