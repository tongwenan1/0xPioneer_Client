import { _decorator, Button, Component, instantiate, Label, Layout, Node, Sprite } from "cc";
import ViewController from "../BasicView/ViewController";
import UIPanelManger from "../Basic/UIPanelMgr";
import { NFTPioneerModel } from "../Const/PioneerDevelopDefine";
import { ItemMgr, LanMgr, PioneerDevelopMgr } from "../Utils/Global";
import LvlupConfig from "../Config/LvlupConfig";
import { ResourceCorrespondingItem } from "../Const/ConstDefine";
import CommonTools from "../Tool/CommonTools";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import ItemData from "../Const/Item";
import ConfigConfig from "../Config/ConfigConfig";
import { ConfigType, NFTLevelLimitPerRankAddNumParam } from "../Const/Config";
import ItemConfig from "../Config/ItemConfig";
import { DataMgr } from "../Data/DataMgr";
const { ccclass, property } = _decorator;

@ccclass("NTFRankUpUI")
export class NTFRankUpUI extends ViewController {
    public showUI(NFTData: NFTPioneerModel) {
        this._data = NFTData;

        // userlanMgr
        // this.node.getChildByPath("__ViewContent/Title").getComponent(Label).string = LanMgr.getLanById("201003");
        // this.node.getChildByPath("__ViewContent/btnUse/name").getComponent(Label).string = LanMgr.getLanById("201003");

        const resourceLimitMaxNum = LvlupConfig.getMaxNFTRankUpNum(this._data.rarity, this._data.rank, DataMgr.s.item.getObj());
        this._maxRankUpNum = Math.min(resourceLimitMaxNum, this._data.rankLimit - this._data.rank);

        this._refreshUI();
    }

    //------------------------ life cycle
    private _data: NFTPioneerModel = null;
    private _rankUpNum: number = 1;
    private _maxRankUpNum: number = 0;
    private _currentCost: ItemData[] = [];

    private _itemView: Node = null;
    private _allShowItems: Node[] = [];
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._itemView = this.node.getChildByPath("__ViewContent/material/Item");
        this._itemView.removeFromParent();

        NotificationMgr.addListener(NotificationName.NFTDIDRANKUP, this._onNFTDidRankUp, this);
    }
    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.NFTDIDRANKUP, this._onNFTDidRankUp, this);
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByPath("__ViewContent");
    }

    //------------------------ function
    private async _refreshUI() {
        if (this._data == null) {
            return;
        }
        const contentView = this.node.getChildByPath("__ViewContent");
        // level
        const levelView = contentView.getChildByPath("UpgradeLevel");
        levelView.getChildByPath("Current").getComponent(Label).string = "Rank " + this._data.rank;
        levelView.getChildByPath("Next").getComponent(Label).string = "Rank " + (this._data.rank + this._rankUpNum);
        levelView.getComponent(Layout).updateLayout();

        // max level limit
        const growMaxLevelLimit: number =
            this._rankUpNum * (ConfigConfig.getConfig(ConfigType.NFTLevelLimitPerRankAddNum) as NFTLevelLimitPerRankAddNumParam).value;
        const maxLevelLimitView = contentView.getChildByPath("Property/MaxLevel");
        // userlanMgr
        // maxLevelLimitView.getChildByPath("Current").getComponent(Label).string = LanMgr.getLanById("201003"); + " +" + growMaxLevelLimit;
        maxLevelLimitView.getChildByPath("Current").getComponent(Label).string = "Max Level +" + growMaxLevelLimit;
        maxLevelLimitView.getChildByPath("Next").getComponent(Label).string = (this._data.levelLimit + growMaxLevelLimit).toString();

        // cost item
        for (const view of this._allShowItems) {
            view.destroy();
        }
        this._allShowItems = [];
        this._currentCost = LvlupConfig.getNFTRankUpCost(this._data.rarity, this._data.rank, this._data.rank + this._rankUpNum);
        for (const templeItem of this._currentCost) {
            const itemConfig = ItemConfig.getById(templeItem.itemConfigId);
            if (itemConfig == null) {
                continue;
            }
            const view = instantiate(this._itemView);
            view.active = true;
            view.parent = this.node.getChildByPath("__ViewContent/material");
            view.getChildByPath("Icon/Image").getComponent(Sprite).spriteFrame = await ItemMgr.getItemIcon(itemConfig.icon);
            view.getChildByPath("Num/Limit").getComponent(Label).string = DataMgr.s.item.getObj_item_count(templeItem.itemConfigId).toString();
            view.getChildByPath("Num/Use").getComponent(Label).string = templeItem.count.toString();
            this._allShowItems.push(view);
        }

        // action button
        contentView.getChildByPath("btnUse").getComponent(Sprite).grayscale = this._rankUpNum > this._maxRankUpNum;
        contentView.getChildByPath("btnUse").getComponent(Button).interactable = this._rankUpNum <= this._maxRankUpNum;
    }

    //------------------------ action
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }

    private onTapConfirmRankUp() {
        if (this._data != null && this._currentCost.length > 0) {
            for (const cost of this._currentCost) {
                ItemMgr.subItem(cost.itemConfigId, cost.count);
            }
            PioneerDevelopMgr.NFTRankUp(this._data.uniqueId, this._rankUpNum);
        }
    }

    //------------------------ notification
    private _onNFTDidRankUp() {
        this._rankUpNum = 1;
        this._maxRankUpNum = 0;
        this._currentCost = [];
        this.showUI(this._data);
    }
}
