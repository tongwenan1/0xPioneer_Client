import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, RichText, randomRangeInt } from 'cc';
import ItemData, { ItemConfigData, ItemType } from '../Model/ItemData';
import { BackpackItem } from './BackpackItem';
import { GameMain } from '../GameMain';
import UserInfo from '../Manger/UserInfoMgr';
import { PopUpUI } from '../BasicView/PopUpUI';
import ItemMgr from '../Manger/ItemMgr';
import CountMgr, { CountType } from '../Manger/CountMgr';
import LanMgr from '../Manger/LanMgr';
const { ccclass, property } = _decorator;



export interface ItemInfoShowModel {
    itemConfig: ItemConfigData,
    count: number
}

@ccclass('ArtifactInfoUI')
export class ArtifactInfoUI extends PopUpUI {

    public async showItem(items: ItemInfoShowModel[], isGet: Boolean = false, closeCallback:()=> void = null) {
        this._items = items;
        this._closeCallback = closeCallback;
        if (this._items.length > 0) {
            let frame = await BackpackItem.getItemIcon(this._items[0].itemConfig.icon);
            this.icon.spriteFrame = frame;
    
            this.typeLabel.string = this._items[0].itemConfig.itemType.toString();

            // useLanMgr
            // this.nameLabel.string = LanMgr.Instance.getLanById(this._items[0].itemConfig.itemName);
            // this.descTxt.string = LanMgr.Instance.getLanById(this._items[0].itemConfig.itemDesc);
            this.nameLabel.string = this._items[0].itemConfig.itemName == null ? "" : this._items[0].itemConfig.itemName;
            this.descTxt.string = this._items[0].itemConfig.itemDesc == null ? "" : this._items[0].itemConfig.itemDesc;
    
            this._isGet = isGet;

            this.useButton.node.active = false;
            if (this._isGet) {
                this.useButton.node.active = true;

                // useLanMgr
                // this.useButtonLabel.string = LanMgr.Instance.getLanById("107549");
                this.useButtonLabel.string = "Get";

            } else {
                if (this._items[0].itemConfig.itemType == ItemType.AddProp) {
                    this.useButton.node.active = true;

                    // useLanMgr
                    // this.useButtonLabel.string = LanMgr.Instance.getLanById("107549");
                    this.useButtonLabel.string = "Use";
                } 
            }
            this.show(true);
        }
    }

    @property(Sprite)
    icon: Sprite;

    @property(Label)
    nameLabel: Label;

    @property(Label)
    typeLabel: Label;

    @property(RichText)
    descTxt: RichText;

    @property(Button)
    closeButton: Button;

    @property(Button)
    useButton: Button;

    @property(Label)
    useButtonLabel: Label;

    private _closeCallback: ()=> void;

    private _isGet: Boolean;
    private _items: ItemInfoShowModel[];

    start() {

        this.closeButton.node.on(Button.EventType.CLICK, () => {
            this._onTapClose();
        }, this);

        this.useButton.node.on(Button.EventType.CLICK, () => {
            this._clickUseBtn();
        }, this);
    }

    //---------------------------------------------------- action
    private _onTapClose() {
        this.show(false);
        if (this._closeCallback != null) {
            this._closeCallback();
        }
    }

    private _clickUseBtn() {
        if (this._isGet) {
           
        } else {
            for (const temple of this._items) {
                ItemMgr.Instance.subItem(temple.itemConfig.configId, 1);
                CountMgr.instance.addNewCount({
                    type: CountType.useItem,
                    timeStamp: new Date().getTime(),
                    data: {
                        itemId: temple.itemConfig.configId,
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