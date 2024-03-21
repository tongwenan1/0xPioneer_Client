import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, Layout } from 'cc';
import { EventName } from '../Const/ConstDefine';
import { GameMain } from '../GameMain';
import ArtifactData from '../Model/ArtifactData';
import { ArtifactItem } from './ArtifactItem';
import { ArtifactArrangeType, ArtifactMgrEvent } from '../Const/Manager/ArtifactMgrDefine';
import { ArtifactMgr, EventMgr, LanMgr, UIPanelMgr } from '../Utils/Global';
import ViewController from '../BasicView/ViewController';
import { UIName } from '../Const/ConstUIDefine';
import { ArtifactInfoUI } from './ArtifactInfoUI';
const { ccclass, property } = _decorator;


@ccclass('ArtifactUI')
export class ArtifactUI extends ViewController implements ArtifactMgrEvent {



    @property(Prefab)
    private itemPrb: Prefab = null;

    private _selectSortMenuShow: boolean = false;
    private _currentArrangeType: ArtifactArrangeType = null;
    private _itemDatas: ArtifactData[] = null;

    private _itemContent: Node = null;
    private _allItemViews: Node[] = null;
    private _sortMenu: Node = null;
    private _menuArrow: Node = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._sortMenu = this.node.getChildByPath("__ViewContent/SortMenu");
        this._sortMenu.active = false;

        this._menuArrow = this.node.getChildByPath("__ViewContent/Bg/SortView/Menu/Arrow");

        this._currentArrangeType = ArtifactArrangeType.Recently;

        this._itemContent = this.node.getChildByPath("__ViewContent/Bg/ScrollView/View/Content");

        EventMgr.on(EventName.CHANGE_LANG, this._refreshArtifactUI, this);
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        ArtifactMgr.addObserver(this);

        this._allItemViews = [];
        for (let i = 0; i < ArtifactMgr.maxItemLength; i++) {
            let itemView = instantiate(this.itemPrb);
            itemView.active = true;

            const button = itemView.addComponent(Button);
            button.transition = Button.Transition.SCALE;
            button.zoomScale = 0.9;
            let evthandler = new EventHandler();
            evthandler._componentName = "ArtifactUI";
            evthandler.target = this.node;
            evthandler.handler = "onTapItem";
            button.clickEvents.push(evthandler);

            itemView.parent = this._itemContent;
            this._allItemViews.push(itemView);
        }
        this._itemContent.getComponent(Layout).updateLayout();

        this._refreshArtifactUI();
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        ArtifactMgr.removeObserver(this);

        EventMgr.off(EventName.CHANGE_LANG, this._refreshArtifactUI, this);
    }

    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByName("__ViewContent");
    }


    private async _refreshArtifactUI() {
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

        const items = ArtifactMgr.localArtifactDatas;
        this._itemDatas = items;

        for (let i = 0; i < this._allItemViews.length; i++) {
            const itemView = this._allItemViews[i];
            itemView.getComponent(ArtifactItem).refreshUI(i < items.length ? items[i] : null);
            itemView.getComponent(Button).clickEvents[0].customEventData = i.toString();
        }
        this.node.getChildByPath("__ViewContent/Bg/QuantityNum").getComponent(Label).string = items.length + "/" + ArtifactMgr.maxItemLength;
    }

    private _refreshMenu() {
        this._sortMenu.active = this._selectSortMenuShow;
        this._menuArrow.angle = this._selectSortMenuShow ? 180 : 0;
        this._sortMenu.getChildByPath("Content/Recently/ImgScreenSelect").active = this._currentArrangeType == ArtifactArrangeType.Recently;
        this._sortMenu.getChildByPath("Content/Rarity/ImgScreenSelect").active = this._currentArrangeType == ArtifactArrangeType.Rarity;
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
            const view = await UIPanelMgr.openPanel(UIName.ArtifactInfoUI);
            if (view != null) {
                view.getComponent(ArtifactInfoUI).showItem([itemData]);
            }
        }
    }
    private onTapArrange() {
        ArtifactMgr.arrange(this._currentArrangeType);
    }

    private onTapSortMenuAction() {
        this._selectSortMenuShow = !this._selectSortMenuShow;

        this._refreshMenu();
    }
    private onTapSelectSortCondition(event: Event, customEventData: string) {
        if (customEventData == this._currentArrangeType) {
            return;
        }
        this._currentArrangeType = customEventData as ArtifactArrangeType;

        switch (this._currentArrangeType) {
            case ArtifactArrangeType.Rarity:
                this.node.getChildByPath("__ViewContent/Bg/SortView/Menu/Sort").getComponent(Label).string = this._sortMenu.getChildByPath("Content/Rarity").getComponent(Label).string;
                break;
            case ArtifactArrangeType.Recently:
                this.node.getChildByPath("__ViewContent/Bg/SortView/Menu/Sort").getComponent(Label).string = this._sortMenu.getChildByPath("Content/Recently").getComponent(Label).string;
                break;
        }

        this._selectSortMenuShow = false;
        this._refreshMenu();
    }

    //--------------------------------------
    //ArtifactMgrEvent
    artifactChanged(): void {
        this._refreshArtifactUI();
    }
}