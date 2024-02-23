import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, RichText, randomRangeInt } from 'cc';
import ItemData, { ItemConfigData, ItemType } from '../Model/ItemData';
import { BackpackItem } from './BackpackItem';
import { GameMain } from '../GameMain';
import UserInfo from '../Manger/UserInfoMgr';
import { PopUpUI } from '../BasicView/PopUpUI';
const { ccclass, property } = _decorator;


@ccclass('ItemInfoUI')
export class ItemInfoUI extends PopUpUI {

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

    private _isGet: Boolean;
    private _itemdatas: ItemData[];
    private _itemconfs: ItemConfigData[];

    start() {

        this.closeButton.node.on(Button.EventType.CLICK, () => {
            this._onTapClose();
        }, this);

        this.useButton.node.on(Button.EventType.CLICK, () => {
            this._clickUseBtn();
        }, this);


    }


    async showItem(itemdatas: ItemData[], itemConfs: ItemConfigData[], isGet: Boolean = false) {
        this._itemconfs = itemConfs;
        this._itemdatas = itemdatas;

        // TO DO : show multi items
        let frame = await BackpackItem.getItemIcon(this._itemdatas[0].itemConfigId);
        this.icon.spriteFrame = frame;

        this.typeLabel.string = itemConfs[0].itemType.toString();
        this.nameLabel.string = itemConfs[0].itemName;
        this.descTxt.string = itemConfs[0].itemDesc;

        this._isGet = isGet;
        if (isGet) {
            this.useButtonLabel.string = "Get";
        }
        else {
            this.useButtonLabel.string = "Use";
        }

        this.show(true);
    }

    //---------------------------------------------------- action
    private _onTapClose() {
        if (this._isGet) {
            GameMain.inst.UI.backpackUI.addItems(this._itemdatas);
        }
        this.show(false);
    }

    private _clickUseBtn() {
        if (this._isGet) {
            GameMain.inst.UI.backpackUI.addItems(this._itemdatas);
            this.show(false);

        } else {
            for (let i = 0; i < this._itemdatas.length; ++i) {
                // sub item
                GameMain.inst.UI.backpackUI.subItem(this._itemdatas[i].itemId, 1);

                // use item
                if (this._itemconfs[i].itemType == ItemType.AddProp) {
                    this._useAddPropItem(this._itemconfs[i]);
                }
            }

            this.show(false);
        }
    }

    private _useAddPropItem(itemConf: ItemConfigData) {
        switch (itemConf.gainPropName) {
            case "wood":
                UserInfo.Instance.wood = UserInfo.Instance.wood + itemConf.gainPropCount;
                break;
            case "food":
                UserInfo.Instance.food = UserInfo.Instance.food + itemConf.gainPropCount;
                break;
            case "troop":
                UserInfo.Instance.troop = UserInfo.Instance.troop + itemConf.gainPropCount;
                break;
            case "stone":
                UserInfo.Instance.stone = UserInfo.Instance.stone + itemConf.gainPropCount;
                break;
        }
    }
}