import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, Layout } from 'cc';
import ItemData from '../Model/ItemData';
import { BackpackItem } from './BackpackItem';
import ItemMgr, { ItemMgrEvent, ItemArrangeType } from '../Manger/ItemMgr';
import { PopUpUI } from '../BasicView/PopUpUI';
import LanMgr from '../Manger/LanMgr';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Const/ConstDefine';
const { ccclass, property } = _decorator;


@ccclass('BackpackUI')
export class BackpackUI extends PopUpUI implements ItemMgrEvent {


    @property(Prefab)
    BackpackItemPfb: Prefab;

    @property(Slider)
    ContentSlider: Slider;

    @property(Node)
    Content: Node;

    @property(Label)
    QuantityNum: Label;

    @property(Button)
    closeButton: Button;

    @property(Button)
    ArrangeButton: Button;

    private maxItemCount: number = 100;
    private itemCount: number;

    private freeItemTile: BackpackItem[] = [];

    private _selectSortMenuShow: boolean = false;
    private _currentArrangeType: ItemArrangeType = null;

    private _sortMenu: Node = null;
    private _menuArrow: Node = null;
    onLoad(): void {
        this._sortMenu = this.node.getChildByName("SortMenu");
        this._sortMenu.active = false;

        this._menuArrow = this.node.getChildByPath("Bg/SortView/Menu/Arrow");

        EventMgr.on(EventName.CHANGE_LANG, this._refreshBackpackUI, this);
    }

    start() {
        ItemMgr.Instance.addObserver(this);

        this._refreshBackpackUI();
    }

    onDestroy(): void {
        ItemMgr.Instance.removeObserver(this);

        EventMgr.off(EventName.CHANGE_LANG, this._refreshBackpackUI, this);
    }

    private _refreshBackpackUI() {

        // useLanMgr
        // this.node.getChildByPath("Bg/title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/QuantityLabel").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/SortView/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/SortView/Menu/Sort").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/ArrangeButton/Label").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this._sortMenu.getChildByPath("Content/Recently").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this._sortMenu.getChildByPath("Content/Rarity").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this._sortMenu.getChildByPath("Content/Type").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        const items = ItemMgr.Instance.localItemDatas;

        let cAry: BackpackItem[] = [];
        this.Content.children.forEach((node) => {
            let bi = node.getComponent(BackpackItem);
            if (bi) {
                cAry.push(bi);
            }
        });

        for (let i = 0; i < cAry.length; ++i) {
            cAry[i].node.parent = null;
            this.freeItemTile.push(cAry[i]);
        }

        this.itemCount = 0;
        for (let i = 0; i < items.length; ++i) {
            let itemTile: BackpackItem;
            if (this.freeItemTile.length > 0) {
                itemTile = this.freeItemTile.pop();
            }
            else {
                let itemTileNode = instantiate(this.BackpackItemPfb);
                itemTile = itemTileNode.getComponent(BackpackItem);
            }

            itemTile.initItem(items[i]);
            itemTile.node.parent = this.Content;

            this.itemCount += items[i].count;
        }

        this.QuantityNum.string = "" + this.itemCount + "/" + this.maxItemCount;

        this.Content.getComponent(Layout).updateLayout();
    }

    private _refreshMenu() {
        this._sortMenu.active = this._selectSortMenuShow;
        this._menuArrow.angle = this._selectSortMenuShow ? 180 : 0;
    }

    //------------------------------------------------------------ action
    private onTapClose() {
        this._selectSortMenuShow = false;
        this._refreshMenu();
        this.show(false);
    }
    private onTapArrange() {
        ItemMgr.Instance.arrange(this._currentArrangeType)
    }

    private onTapSortMenuAction() {
        this._selectSortMenuShow = !this._selectSortMenuShow;

        this._refreshMenu();
    }
    private onTapSelectSortCondition(event: Event, customEventData: string) {
        if (customEventData == this._currentArrangeType) {
            return;
        }
        this._currentArrangeType = customEventData as ItemArrangeType;
        
        switch (this._currentArrangeType) {
            case ItemArrangeType.Rarity:
                this.node.getChildByPath("Bg/SortView/Menu/Sort").getComponent(Label).string = this._sortMenu.getChildByPath("Content/Rarity").getComponent(Label).string;
                break;
            case ItemArrangeType.Recently:
                this.node.getChildByPath("Bg/SortView/Menu/Sort").getComponent(Label).string = this._sortMenu.getChildByPath("Content/Recently").getComponent(Label).string;
                break;
            case ItemArrangeType.Type:
                this.node.getChildByPath("Bg/SortView/Menu/Sort").getComponent(Label).string = this._sortMenu.getChildByPath("Content/Type").getComponent(Label).string;
                break;
        }

        this._selectSortMenuShow = false;
        this._refreshMenu();
    }

    //--------------------------------------
    //ItemMgrEvent
    itemChanged(): void {
        this._refreshBackpackUI();
    }
}