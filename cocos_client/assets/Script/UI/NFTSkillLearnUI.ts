import { _decorator, Button, instantiate, Label, Layout, Node, RichText } from "cc";
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
import { DataMgr } from "../Data/DataMgr";
const { ccclass, property } = _decorator;

@ccclass("NFTSkillLearnUI")
export class NFTSkillLearnUI extends ViewController {
    public async showItem(data: NFTPioneerModel) {
        if (data == null) {
            return;
        }
        this._data = data;
        this._refreshUI();
    }

    private _data: NFTPioneerModel = null;
    private _skillIndex: number = -1;
    private _skillConfig: NFTPioneerSkillConfigData = null;
    private _skillBooks: ItemData[] = [];

    private _bookItem: Node = null;
    private _bookContent: Node = null;
    private _allBookItems: Node[] = [];
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._skillBooks = DataMgr.s.item.getObj_item_skillbook();

        this._bookContent = this.node.getChildByPath("__ViewContent/BgTaskListWord/ScrollView/View/Content");
        this._bookItem = this._bookContent.getChildByPath("Item");
        // useLanMgr
        // this._bookItem.getChildByPath("LearnBtn/Label").getComponent(Label).string = LanMgr.getLanById("107549")
        this._bookItem.removeFromParent();

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

    private _refreshUI() {
        for (const item of this._allBookItems) {
            item.destroy();
        }
        this._allBookItems = [];

        for (let i = 0; i < this._skillBooks.length; i++) {
            const book = this._skillBooks[i];
            const config = ItemConfig.getById(book.itemConfigId);
            if (config == null) {
                continue;
            }
            const itemView = instantiate(this._bookItem);
            itemView.active = true;
            itemView.parent = this._bookContent;
            itemView.getChildByPath("BackpackItem").getComponent(Button).clickEvents[0].customEventData = i.toString();
            itemView.getChildByPath("BackpackItem").getComponent(BackpackItem).refreshUI(book);
            itemView.getChildByPath("Name").getComponent(Label).string = LanMgr.getLanById(config.itemName);
            itemView.getChildByPath("Num").getComponent(Label).string = "x" + book.count;
            itemView.getChildByPath("LearnBtn").getComponent(Button).clickEvents[0].customEventData = book.itemConfigId;
            this._allBookItems.push(itemView);
        }
        this._bookContent.getComponent(Layout).updateLayout();
    }
    //---------------------------------------------------- action
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }
    private async onTapBookItem(event: Event, customEventData: string) {
        const index: number = parseInt(customEventData);
        const result = await UIPanelManger.inst.pushPanel(UIName.ItemInfoUI);
        if (!result.success) {
            return;
        }
        result.node.getComponent(ItemInfoUI).showItem([this._skillBooks[index]]);
    }
    private async onTapLearn(event: Event, customEventData: string) {
        const itemConfigId: string = customEventData;
        const config = ItemConfig.getById(itemConfigId);
        if (config == null) {
            return;
        }
        const result = await UIPanelManger.inst.pushPanel(HUDName.Alter, UIPanelLayerType.HUD);
        if (!result.success) {
            return;
        }
        result.node.getComponent(AlterView).showTip(LanMgr.replaceLanById("106005", [this._data.name, LanMgr.getLanById(config.itemName)]), async () => {
            PioneerDevelopMgr.NFTLearnSkill(this._data.uniqueId, config.skill_learn);
            ItemMgr.subItem(itemConfigId, 1);
            this._refreshUI();
        });
    }
}
