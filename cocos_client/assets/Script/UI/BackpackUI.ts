import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, Layout } from 'cc';
import { BackpackItem } from './BackpackItem';
import { ItemMgr, LanMgr, UIPanelMgr } from '../Utils/Global';
import ViewController from '../BasicView/ViewController';
import { UIName } from '../Const/ConstUIDefine';
import { ItemInfoUI } from './ItemInfoUI';
import NotificationMgr from '../Basic/NotificationMgr';
import ItemData, { ItemArrangeType } from '../Const/Item';
import { NotificationName } from '../Const/Notification';
const { ccclass, property } = _decorator;


@ccclass('BackpackUI')
export class BackpackUI extends ViewController {


    @property(Prefab)
    private backpackItemPrb: Prefab = null;

    private _selectSortMenuShow: boolean = false;
    private _currentArrangeType: ItemArrangeType = null;
    private _itemDatas: ItemData[] = null;

    private _itemContent: Node = null;
    private _allItemViews: Node[] = null;
    private _sortMenu: Node = null;
    private _menuArrow: Node = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._sortMenu = this.node.getChildByPath("__ViewContent/SortMenu");
        this._sortMenu.active = false;

        this._menuArrow = this.node.getChildByPath("__ViewContent/Bg/SortView/Menu/Arrow");

        this._currentArrangeType = ItemArrangeType.Recently;

        this._itemContent = this.node.getChildByPath("__ViewContent/Bg/ScrollView/View/Content");

        NotificationMgr.addListener(NotificationName.CHANGE_LANG, this._refreshBackpackUI, this);
        NotificationMgr.addListener(NotificationName.ITEM_CHANGE, this._refreshBackpackUI, this);
    }
    
    protected viewDidStart(): void {
        super.viewDidStart();

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

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.CHANGE_LANG, this._refreshBackpackUI, this);
        NotificationMgr.removeListener(NotificationName.ITEM_CHANGE, this._refreshBackpackUI, this);
    }

    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByPath("__ViewContent");
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
    private async onTapClose() {
        this._selectSortMenuShow = false;
        this._refreshMenu();
        await this.playExitAnimation();
        UIPanelMgr.removePanelByNode(this.node);
    }
    private async onTapItem(event: Event, customEventData: string) {
        const index = parseInt(customEventData);
        if (index < this._itemDatas.length) {
            const itemData = this._itemDatas[index];
            const view = await UIPanelMgr.openPanel(UIName.ItemInfoUI);
            if (view != null) {
                view.getComponent(ItemInfoUI).showItem([itemData]);
            }
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
}