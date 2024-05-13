import { SpriteFrame, resources, sys } from "cc";
import { ResourcesMgr } from "../Utils/Global";
import ItemData from "../Model/ItemData";
import ItemConfig from "../Config/ItemConfig";
import { ItemType } from "../Const/Item";
import { GetPropData, ResourceCorrespondingItem } from "../Const/ConstDefine";
import { DataMgr } from "../Data/DataMgr";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";

export default class ItemMgr {
    private _itemIconSpriteFrames = {};
    public constructor() {
        NotificationMgr.addListener(NotificationName.RESOURCE_GETTED, this._onResourceItemDidGet, this);
        // NotificationMgr.addListener(NotificationName.RESOURCE_CONSUMED, this._onResourceItemDidConsume, this);
    }

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

    //---------------------------- notification
    private _onResourceItemDidGet(data: { item: ItemData }) {
        // settlement
        return;
        // if (data.needSettlement) {
        //     const item = data.item;
        //     const itemConfig = ItemConfig.getById(item.itemConfigId);
        //     if (itemConfig == null) {
        //         return;
        //     }
        //     // add timestamp
        //     if (itemConfig.itemType == ItemType.Resource) {
        //         // settlementCount
        //         if (
        //             itemConfig.configId == ResourceCorrespondingItem.Food ||
        //             itemConfig.configId == ResourceCorrespondingItem.Wood ||
        //             itemConfig.configId == ResourceCorrespondingItem.Stone
        //         ) {
        //             DataMgr.s.settlement.addObj({
        //                 level: DataMgr.s.userInfo.data.level,
        //                 newPioneerIds: [],
        //                 killEnemies: 0,
        //                 gainResources: item.count,
        //                 consumeResources: 0,
        //                 gainTroops: 0,
        //                 consumeTroops: 0,
        //                 gainEnergy: 0,
        //                 consumeEnergy: 0,
        //                 exploredEvents: 0,
        //             });
        //         } else if (itemConfig.configId == ResourceCorrespondingItem.Troop) {
        //             DataMgr.s.settlement.addObj({
        //                 level: DataMgr.s.userInfo.data.level,
        //                 newPioneerIds: [],
        //                 killEnemies: 0,
        //                 gainResources: 0,
        //                 consumeResources: 0,
        //                 gainTroops: item.count,
        //                 consumeTroops: 0,
        //                 gainEnergy: 0,
        //                 consumeEnergy: 0,
        //                 exploredEvents: 0,
        //             });
        //         } else if (itemConfig.configId == ResourceCorrespondingItem.Energy) {
        //             DataMgr.s.settlement.addObj({
        //                 level: DataMgr.s.userInfo.data.level,
        //                 newPioneerIds: [],
        //                 killEnemies: 0,
        //                 gainResources: 0,
        //                 consumeResources: 0,
        //                 gainTroops: 0,
        //                 consumeTroops: 0,
        //                 gainEnergy: item.count,
        //                 consumeEnergy: 0,
        //                 exploredEvents: 0,
        //             });
        //         }
        //     }
        // }
    }
    private _onResourceItemDidConsume(data: { itemConfigId: string; count: number; getItem: GetPropData }) {
        const itemConfigId = data.itemConfigId;
        const count = data.count;
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

        if (data.getItem != null) {
            // upload resource changed item-use
            ItemConfigDropTool.getItemByConfig([data.getItem]);
        }
    }
}
