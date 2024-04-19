import { _decorator, Button, instantiate, Label, Layout, Node, RichText, Sprite } from "cc";
import { ItemMgr, LanMgr, PioneerDevelopMgr } from "../Utils/Global";
import ViewController from "../BasicView/ViewController";
import UIPanelManger, { UIPanelLayerType } from "../Basic/UIPanelMgr";
import { NFTPioneerModel, NFTPioneerSkillConfigData } from "../Const/PioneerDevelopDefine";
import NFTSkillConfig from "../Config/NFTSkillConfig";
import NFTSkillEffectConfig from "../Config/NFTSkillEffectConfig";
import { HUDName, UIName } from "../Const/ConstUIDefine";
import { AlterView } from "./View/AlterView";
import ItemData from "../Const/Item";
import { BackpackItem } from "./BackpackItem";
import ItemConfig from "../Config/ItemConfig";
import { ItemInfoUI } from "./ItemInfoUI";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import { NTFBackpackItem } from "./View/NTFBackpackItem";
import { InnerBuildingType } from "../Const/BuildingDefine";
const { ccclass, property } = _decorator;

@ccclass("DelegateUI")
export class DelegateUI extends ViewController {
    public showUI(buildingId: InnerBuildingType) {
        if (buildingId == null) {
            return;
        }
        this._buildingId = buildingId;
        this._refreshUI();
    }

    private _buildingId: InnerBuildingType = null;
    private _datas: NFTPioneerModel[] = [];
    private _selectIndex: number = -1;

    private _NFTContent: Node = null;
    private _NFTItem: Node = null;
    private _allNFTItems: Node[] = [];
    protected viewDidLoad(): void {
        super.viewDidLoad();

        // useLanMgr
        // this.node.getChildByPath("__ViewContent/Info/NoOccupied/Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/Info/ConfirmButton/item").getComponent(Label).string = LanMgr.getLanById("107549");

        this._NFTContent = this.node.getChildByPath("__ViewContent/Pioneers/ScrollView/View/Content");
        this._NFTItem = this._NFTContent.getChildByPath("Item");
        // useLanMgr
        // this._NFTItem.getChildByPath("Working").getComponent(Label).string = LanMgr.getLanById("107549");
        this._NFTItem.removeFromParent();
    }
    protected viewDidStart(): void {
        super.viewDidStart();
    }
    protected viewDidDestroy(): void {
        super.viewDidDestroy();
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByName("__ViewContent");
    }

    private async _refreshUI() {
        for (const item of this._allNFTItems) {
            item.destroy();
        }
        this._allNFTItems = [];

        this._datas = PioneerDevelopMgr.getAllNFTs();
        this._datas.sort((a: NFTPioneerModel, b: NFTPioneerModel) => {
            if (a.workingBuildingId != null && b.workingBuildingId == null) return 1;
            if (a.workingBuildingId == null && b.workingBuildingId != null) return -1;
            if (a.attack > b.attack) return -1;
            if (a.attack < b.attack) return 1;
            return 0;
        });
        for (let i = 0; i < this._datas.length; i++) {
            const data = this._datas[i];
            const itemView = instantiate(this._NFTItem);
            itemView.active = true;
            await itemView.getComponent(NTFBackpackItem).refreshUI(data);
            itemView.getComponent(Button).clickEvents[0].customEventData = i.toString();
            itemView.getChildByPath("Working").active = data.workingBuildingId != null;
            itemView.parent = this._NFTContent;
            this._allNFTItems.push(itemView);

            if (data.workingBuildingId == this._buildingId) {
                this._selectIndex = i;
            }
        }
        this._NFTContent.getComponent(Layout).updateLayout();

        this._refreshInfoUI();
    }
    private _refreshInfoUI() {
        const noOccupiedView = this.node.getChildByPath("__ViewContent/Info/NoOccupied");
        const selectOccupiedView = this.node.getChildByPath("__ViewContent/Info/SelectOccupied");
        const confirmButton = this.node.getChildByPath("__ViewContent/Info/ConfirmButton");
        if (this._selectIndex >= 0) {
            noOccupiedView.active = false;
            selectOccupiedView.active = true;
            confirmButton.getComponent(Sprite).grayscale = false;
            confirmButton.getComponent(Button).interactable = true;

            const data = this._datas[this._selectIndex];
            selectOccupiedView.getChildByPath("NFTBackpackItem").getComponent(NTFBackpackItem).refreshUI(data);
            selectOccupiedView.getChildByPath("Level").getComponent(Label).string = "Lv." + data.level;
            selectOccupiedView.getChildByPath("Rank").getComponent(Label).string = "Rank." + data.level;
            selectOccupiedView.getChildByPath("Name").getComponent(Label).string = data.name;
            selectOccupiedView.getChildByPath("Attack").getComponent(Label).string = "ATK " + data.attack;
        } else {
            noOccupiedView.active = true;
            selectOccupiedView.active = false;
            confirmButton.getComponent(Sprite).grayscale = true;
            confirmButton.getComponent(Button).interactable = false;
        }

        for (let i = 0; i < this._allNFTItems.length; i++) {
            const itemView = this._allNFTItems[i];
            itemView.getChildByPath("Selected").active = i == this._selectIndex;
        }
    }

    //---------------------------------------------------- action
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }
    private onTapItem(event: Event, customEventData: string) {
        const index: number = parseInt(customEventData);
        if (index != this._selectIndex) {
            this._selectIndex = index;
            this._refreshInfoUI();
        }
    }
    private onTapConfirm() {
        if (this._selectIndex < 0) {
            return;
        }
        PioneerDevelopMgr.NFTChangeWork(this._datas[this._selectIndex].uniqueId, this._buildingId);
        this._refreshUI();
    }
}