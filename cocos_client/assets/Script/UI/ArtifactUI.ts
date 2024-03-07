import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, Layout } from 'cc';
import ArtifactData from '../Model/ArtifactData';
import { ArtifactItem } from './ArtifactItem';
import ArtifactMgr, { ArtifactMgrEvent, ArtifactArrangeType } from '../Manger/ArtifactMgr';
import { PopUpUI } from '../BasicView/PopUpUI';
import LanMgr from '../Manger/LanMgr';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Const/ConstDefine';
const { ccclass, property } = _decorator;


@ccclass('ArtifactUI')
export class ArtifactUI extends PopUpUI implements ArtifactMgrEvent {


    @property(Prefab)
    ArtifactItemPfb: Prefab;

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

    private maxArtifactCount: number = 100;
    private artifactCount: number;

    private freeItemTile: ArtifactItem[] = [];

    private _selectSortMenuShow: boolean = false;
    private _currentArrangeType: ArtifactArrangeType = null;

    private _sortMenu: Node = null;
    private _menuArrow: Node = null;
    onLoad(): void {
        this._sortMenu = this.node.getChildByName("SortMenu");
        this._sortMenu.active = false;

        this._menuArrow = this.node.getChildByPath("Bg/SortView/Menu/Arrow");

        EventMgr.on(EventName.CHANGE_LANG, this.changeLang, this);

        // setTimeout(() => {
        //     let artifact = new ArtifactData(7001, 1);
        //     ArtifactMgr.Instance.addArtifact([artifact]);
        // }, 3000);
    }

    start() {
        ArtifactMgr.Instance.addObserver(this);

        this._refreshArtifactUI();
    }

    onDestroy(): void {
        ArtifactMgr.Instance.removeObserver(this);

        EventMgr.off(EventName.CHANGE_LANG, this.changeLang, this);
    }

    changeLang(): void {
        if (this.node.active === false) return;
        this._refreshArtifactUI();
    }

    private _refreshArtifactUI() {

        // useLanMgr
        // this.node.getChildByPath("Bg/title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/QuantityLabel").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/SortView/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/SortView/Menu/Sort").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Bg/ArrangeButton/Label").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this._sortMenu.getChildByPath("Content/Recently").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this._sortMenu.getChildByPath("Content/Rarity").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        const artifacts = ArtifactMgr.Instance.localArtifactDatas;

        let cAry: ArtifactItem[] = [];
        this.Content.children.forEach((node) => {
            let bi = node.getComponent(ArtifactItem);
            if (bi) {
                cAry.push(bi);
            }
        });

        for (let i = 0; i < cAry.length; ++i) {
            cAry[i].node.parent = null;
            this.freeItemTile.push(cAry[i]);
        }

        this.artifactCount = 0;
        for (let i = 0; i < artifacts.length; ++i) {
            let itemTile: ArtifactItem;
            if (this.freeItemTile.length > 0) {
                itemTile = this.freeItemTile.pop();
            }
            else {
                let itemTileNode = instantiate(this.ArtifactItemPfb);
                itemTile = itemTileNode.getComponent(ArtifactItem);
            }

            itemTile.initArtifact(artifacts[i]);
            itemTile.node.parent = this.Content;

            this.artifactCount += artifacts[i].count;
        }

        this.QuantityNum.string = "" + this.artifactCount + "/" + this.maxArtifactCount;

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
        ArtifactMgr.Instance.arrange(this._currentArrangeType)
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