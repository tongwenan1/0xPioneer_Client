import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, Layout } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import LanMgr from '../Manger/LanMgr';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Const/ConstDefine';
import { GameMain } from '../GameMain';
import ArtifactMgr, { ArtifactArrangeType, ArtifactMgrEvent } from '../Manger/ArtifactMgr';
import ArtifactData from '../Model/ArtifactData';
import { ArtifactItem } from './ArtifactItem';
const { ccclass, property } = _decorator;


@ccclass('ArtifactUI')
export class ArtifactUI extends PopUpUI implements ArtifactMgrEvent {
    


    @property(Prefab)
    private itemPrb: Prefab = null;

    private _selectSortMenuShow: boolean = false;
    private _currentArrangeType: ArtifactArrangeType = null;
    private _itemDatas: ArtifactData[] = null;

    private _itemContent: Node = null;
    private _allItemViews: Node[] = null;
    private _sortMenu: Node = null;
    private _menuArrow: Node = null;
    onLoad(): void {
        this._sortMenu = this.node.getChildByName("SortMenu");
        this._sortMenu.active = false;

        this._menuArrow = this.node.getChildByPath("Bg/SortView/Menu/Arrow");

        this._currentArrangeType = ArtifactArrangeType.Recently;

        this._itemContent = this.node.getChildByPath("Bg/ScrollView/View/Content");

        EventMgr.on(EventName.CHANGE_LANG, this._refreshArtifactUI, this);
    }

    start() {
        ArtifactMgr.Instance.addObserver(this);

        this._allItemViews = [];
        for (let i = 0; i < ArtifactMgr.Instance.maxItemLength; i++) {
            let itemView = instantiate(this.itemPrb);
            itemView.active = true;

            const button = itemView.addComponent(Button);
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
        
        ArtifactMgr.Instance.addArtifact([new ArtifactData("7001", 1)])
    }

    onDestroy(): void {
        ArtifactMgr.Instance.removeObserver(this);

        EventMgr.off(EventName.CHANGE_LANG, this._refreshArtifactUI, this);
    }

    private async _refreshArtifactUI() {
        if (this._allItemViews == null) {
            return;
        }
        // useLanMgr
        // this.node.getChildByPath("Bg/title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/QuantityLabel").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/SortView/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/SortView/Menu/Sort").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/ArrangeButton/Label").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this._sortMenu.getChildByPath("Content/Recently").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this._sortMenu.getChildByPath("Content/Rarity").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        const items = ArtifactMgr.Instance.localArtifactDatas;
        this._itemDatas = items;

        for (let i = 0; i < this._allItemViews.length; i++) {
            const itemView = this._allItemViews[i];
            itemView.getComponent(ArtifactItem).refreshUI(i < items.length ? items[i] : null);
            itemView.getComponent(Button).clickEvents[0].customEventData = i.toString();
        }
        this.node.getChildByPath("Bg/QuantityNum").getComponent(Label).string = items.length + "/" + ArtifactMgr.Instance.maxItemLength;
    }

    private _refreshMenu() {
        this._sortMenu.active = this._selectSortMenuShow;
        this._menuArrow.angle = this._selectSortMenuShow ? 180 : 0;
        this._sortMenu.getChildByPath("Content/Recently/ImgScreenSelect").active = this._currentArrangeType == ArtifactArrangeType.Recently;
        this._sortMenu.getChildByPath("Content/Rarity/ImgScreenSelect").active = this._currentArrangeType == ArtifactArrangeType.Rarity;
    }

    //------------------------------------------------------------ action
    private onTapClose() {
        this._selectSortMenuShow = false;
        this._refreshMenu();
        this.show(false);
    }
    private onTapItem(event: Event, customEventData: string) {
        const index = parseInt(customEventData);
        if (index < this._itemDatas.length) {
            const itemData = this._itemDatas[index];
            GameMain.inst.UI.artifactInfoUI.showItem([itemData]);
        }
    }
    private onTapArrange() {
        ArtifactMgr.Instance.arrange(this._currentArrangeType);
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
                this.node.getChildByPath("Bg/SortView/Menu/Sort").getComponent(Label).string = this._sortMenu.getChildByPath("Content/Rarity").getComponent(Label).string;
                break;
            case ArtifactArrangeType.Recently:
                this.node.getChildByPath("Bg/SortView/Menu/Sort").getComponent(Label).string = this._sortMenu.getChildByPath("Content/Recently").getComponent(Label).string;
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