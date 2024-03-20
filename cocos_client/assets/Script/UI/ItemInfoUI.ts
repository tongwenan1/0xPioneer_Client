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

    /**
     * 
     * @param items 
     * @param isGet true-get item  false-use item or only show
     * @param closeCallback 
     * @returns 
     */
    public async showItem(items: ItemData[], isGet: boolean = false, closeCallback: () => void = null) {
        this._items = items;
        this._isGet = isGet;
        this._closeCallback = closeCallback;
        // resource not show
        // remove all resource
        for (let i = 0; i < this._items.length; i++) {
            const templeConfig = ItemMgr.Instance.getItemConf(this._items[i].itemConfigId);
            if (templeConfig != null && templeConfig.itemType == ItemType.Resource) {
                // resource no show
                this._items.splice(i, 1);
                i--;
            }
        }
        if (this._items.length > 0) {
            let currentItem: ItemData = this._items.splice(0, 1)[0];
            let currentConfig = ItemMgr.Instance.getItemConf(currentItem.itemConfigId);
            if (currentConfig != null) {
                const contentView = this.node.getChildByName("__ViewContent");
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
            }
            this.show(true, true);
        }
    }


    private _items: ItemData[] = [];
    private _isGet: boolean;
    private _closeCallback: () => void;

    start() {
    }

    //---------------------------------------------------- action
    private onTapClose() {
        if (this._items.length <= 0) {
            this.show(false, true);
            if (this._closeCallback != null) {
                this._closeCallback();
            }
        } else {
            this.showItem(this._items, this._isGet, this._closeCallback);
        }

    }
    private onTapUse() {
        if (this._isGet) {
            this.onTapClose();
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
            this.show(false, true);
            if (this._closeCallback != null) {
                this._closeCallback();
            }
        }
    }
}
