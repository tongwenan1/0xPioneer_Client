import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, Layout } from 'cc';
import { BackpackItem } from './BackpackItem';
import { PopUpUI } from '../BasicView/PopUpUI';
import { EventName } from '../Const/ConstDefine';
import { GameMain } from '../GameMain';
import { ItemArrangeType, ItemMgrEvent } from '../Const/Manager/ItemMgrDefine';
import { EventMgr, ItemMgr, LanMgr } from '../Utils/Global';
import ItemData from '../Model/ItemData';
const { ccclass, property } = _decorator;


@ccclass('BackpackUI')
export class BackpackUI extends PopUpUI implements ItemMgrEvent {


    @property(Prefab)
    private backpackItemPrb: Prefab = null;

    private _selectSortMenuShow: boolean = false;
    private _currentArrangeType: ItemArrangeType = null;
    private _itemDatas: ItemData[] = null;

    private _itemContent: Node = null;
    private _allItemViews: Node[] = null;
    private _sortMenu: Node = null;
    private _menuArrow: Node = null;
    onLoad(): void {
        this._sortMenu = this.node.getChildByPath("__ViewContent/SortMenu");
        this._sortMenu.active = false;

        this._menuArrow = this.node.getChildByPath("__ViewContent/Bg/SortView/Menu/Arrow");

        this._currentArrangeType = ItemArrangeType.Recently;

        this._itemContent = this.node.getChildByPath("__ViewContent/Bg/ScrollView/View/Content");

        EventMgr.on(EventName.CHANGE_LANG, this._refreshBackpackUI, this);
    }

    start() {
        ItemMgr.addObserver(this);

        this._allItemViews = [];
        for (let i = 0; i < ItemMgr.maxItemLength; i++) {
            let itemView = instantiate(this.backpackItemPrb);
            itemView.active = true;

            const button = itemView.addComponent(Button);
            button.transition = Button.Transition.SCALE;
            button.zoomScale = 0.9;
            let evthandler = new EventHandler();
            evthandler._componentName = "BackpackUI";
            evthandler.target = this.node;
            evthandler.handler = "onTapItem";
            button.clickEvents.push(evthandler);

            itemView.parent = this._itemContent;
            this._allItemViews.push(itemView);
        }
        this._itemContent.getComponent(Layout).updateLayout();

        this._refreshBackpackUI();
    }

    onDestroy(): void {
        ItemMgr.removeObserver(this);

        EventMgr.off(EventName.CHANGE_LANG, this._refreshBackpackUI, this);
    }

    private async _refreshBackpackUI() {
        if (this._allItemViews == null) {
            return;
        }
        // useLanMgr
        // this.node.getChildByPath("__ViewContent/Bg/title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/Bg/QuantityLabel").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/Bg/SortView/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/Bg/SortView/Menu/Sort").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/Bg/ArrangeButton/Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._sortMenu.getChildByPath("Content/Recently").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._sortMenu.getChildByPath("Content/Rarity").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._sortMenu.getChildByPath("Content/Type").getComponent(Label).string = LanMgr.getLanById("107549");

        const items = ItemMgr.localBackpackItemDatas;
        this._itemDatas = items;

        for (let i = 0; i < this._allItemViews.length; i++) {
            const itemView = this._allItemViews[i];
            itemView.getComponent(BackpackItem).refreshUI(i < items.length ? items[i] : null);
            itemView.getComponent(Button).clickEvents[0].customEventData = i.toString();
        }
        this.node.getChildByPath("__ViewContent/Bg/QuantityNum").getComponent(Label).string = items.length + "/" + ItemMgr.maxItemLength;
    }

    private _refreshMenu() {
        this._sortMenu.active = this._selectSortMenuShow;
        this._menuArrow.angle = this._selectSortMenuShow ? 180 : 0;
        this._sortMenu.getChildByPath("Content/Recently/ImgScreenSelect").active = this._currentArrangeType == ItemArrangeType.Recently;
        this._sortMenu.getChildByPath("Content/Rarity/ImgScreenSelect").active = this._currentArrangeType == ItemArrangeType.Rarity;
        this._sortMenu.getChildByPath("Content/Type/ImgScreenSelect").active = this._currentArrangeType == ItemArrangeType.Type;

    }

    //------------------------------------------------------------ action
    private onTapClose() {
        this._selectSortMenuShow = false;
        this._refreshMenu();
        this.show(false, true);
    }
    private onTapItem(event: Event, customEventData: string) {
        const index = parseInt(customEventData);
        if (index < this._itemDatas.length) {
            const itemData = this._itemDatas[index];
            GameMain.inst.UI.itemInfoUI.showItem([itemData]);
        }
    }
    private onTapArrange() {
        ItemMgr.arrange(this._currentArrangeType);
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
                this.node.getChildByPath("__ViewContent/Bg/SortView/Menu/Sort").getComponent(Label).string = this._sortMenu.getChildByPath("Content/Rarity").getComponent(Label).string;
                break;
            case ItemArrangeType.Recently:
                this.node.getChildByPath("__ViewContent/Bg/SortView/Menu/Sort").getComponent(Label).string = this._sortMenu.getChildByPath("Content/Recently").getComponent(Label).string;
                break;
            case ItemArrangeType.Type:
                this.node.getChildByPath("__ViewContent/Bg/SortView/Menu/Sort").getComponent(Label).string = this._sortMenu.getChildByPath("Content/Type").getComponent(Label).string;
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