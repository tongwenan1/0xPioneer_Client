import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, RichText, randomRangeInt } from 'cc';
import ItemData, { ItemConfigData, ItemType } from '../Model/ItemData';
import { BackpackItem } from './BackpackItem';
import { PopUpUI } from '../BasicView/PopUpUI';
import ItemMgr from '../Manger/ItemMgr';
import CountMgr, { CountType } from '../Manger/CountMgr';
import LanMgr from '../Manger/LanMgr';
const { ccclass, property } = _decorator;

@ccclass('ItemInfoUI')
export class ItemInfoUI extends PopUpUI {

    public async showItem(items: ItemData[], isGet: boolean = false, closeCallback:()=> void = null) {
        this._items = items;
        this._isGet = isGet;
        this._closeCallback = closeCallback;

        if (this._items.length > 0) {
            // only show one
            let currentItem = null;
            let currentConfig = null;
            for (const temple of this._items) {
                const templeConfig = ItemMgr.Instance.getItemConf(temple.itemConfigId);
                if (templeConfig != null && templeConfig.itemType != ItemType.Resource) {
                    currentItem = temple;
                    currentConfig = templeConfig;
                    break;
                }
            }
            if (currentItem == null || currentConfig == null) {
                return;
            }
            const contentView = this.node.getChildByName("DialogBg");
            // name 
            contentView.getChildByName("Name").getComponent(Label).string = LanMgr.Instance.getLanById(currentConfig.itemName);
            // icon
            contentView.getChildByName("BackpackItem").getComponent(BackpackItem).refreshUI(currentItem);
            // desc
            contentView.getChildByName("DescTxt").getComponent(RichText).string = LanMgr.Instance.getLanById(currentConfig.itemDesc);
            // actionbutton
            const button = contentView.getChildByName("btnUse");
            button.active = false;
            if (this._isGet) {
                button.active = true;
                button.getChildByName("name").getComponent(Label).string = LanMgr.Instance.getLanById("205001");

            } else {
                if (currentConfig.itemType == ItemType.AddProp) {
                    button.active = true;
                    button.getChildByName("name").getComponent(Label).string = LanMgr.Instance.getLanById("205002");
                } 
            }
            this.show(true);
        }
    }


    private _items: ItemData[];
    private _isGet: boolean;
    private _closeCallback: ()=> void;

    start() {
    }

    //---------------------------------------------------- action
    private onTapClose() {
        this.show(false);
        if (this._closeCallback != null) {
            this._closeCallback();
        }
    }
    private onTapUse() {
        if (this._isGet) {
           
        } else {
            for (const temple of this._items) {
                ItemMgr.Instance.subItem(temple.itemConfigId, 1);
                CountMgr.instance.addNewCount({
                    type: CountType.useItem,
                    timeStamp: new Date().getTime(),
                    data: {
                        itemId: temple.itemConfigId,
                        num: 1
                    }
                });
            }
        }
        this.show(false);
        if (this._closeCallback != null) {
            this._closeCallback();
        }
    }
}
  