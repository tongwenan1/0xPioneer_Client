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
}
