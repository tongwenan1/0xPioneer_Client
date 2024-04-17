import {
    _decorator,
    Component,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    Vec3,
    Button,
    EventHandler,
    v2,
    Vec2,
    Prefab,
    Slider,
    instantiate,
    RichText,
    randomRangeInt,
    labelAssembler,
} from "cc";
import ViewController from "../BasicView/ViewController";
import { CountType } from "../Const/Count";
import ItemConfig from "../Config/ItemConfig";
import ItemData, { ItemType } from "../Const/Item";
import { NFTPioneerModel } from "../Const/PioneerDevelopDefine";
import { LanMgr, PioneerDevelopMgr } from "../Utils/Global";
import UIPanelManger from "../Basic/UIPanelMgr";
import { UIName } from "../Const/ConstUIDefine";
import { NTFLevelUpUI } from "./NTFLevelUpUI";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import { NTFRankUpUI } from "./NTFRankUpUI";
import ConfigConfig from "../Config/ConfigConfig";
import { ConfigType, NFTRaritySkillLimitNumParam } from "../Const/Config";
import NFTSkillConfig from "../Config/NFTSkillConfig";
const { ccclass, property } = _decorator;

@ccclass("NFTInfoUI")
export class NFTInfoUI extends ViewController {
    public async showItem(index: number = 0) {
        this._currentIndex = index;
        this._refreshUI();
    }

    private _currentIndex: number = 0;
    private _NFTDatas: NFTPioneerModel[] = [];

    private _skillContent: Node = null;
    private _skillItem: Node = null;
    private _skillGapItem: Node = null;
    private _skillAddItem: Node = null;
    private _skillAllItems: Node[] = [];
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._currentIndex = 0;
        this._NFTDatas = PioneerDevelopMgr.getAllNFTs();

        this._skillContent = this.node.getChildByPath("__ViewContent/Skill/Content");
        this._skillItem = this._skillContent.getChildByPath("SkillItem");
        this._skillItem.removeFromParent();
        this._skillGapItem = this._skillContent.getChildByPath("GapItem");
        this._skillGapItem.removeFromParent();
        this._skillAddItem = this._skillContent.getChildByPath("AddItem");
        this._skillAddItem.removeFromParent();

        NotificationMgr.addListener(NotificationName.NFTDidLevelUp, this._refreshUI, this);
        NotificationMgr.addListener(NotificationName.NFTDidRankUp, this._refreshUI, this);
    }
    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.NFTDidLevelUp, this._refreshUI, this);
        NotificationMgr.removeListener(NotificationName.NFTDidRankUp, this._refreshUI, this);
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByName("__ViewContent");
    }

    private _refreshUI() {
        this._currentIndex = Math.max(0, Math.min(this._NFTDatas.length - 1, this._currentIndex));
        const data = this._NFTDatas[this._currentIndex];
        const currentSkillLimit: number = (ConfigConfig.getConfig(ConfigType.NFTRaritySkillLimitNum) as NFTRaritySkillLimitNumParam).limitNumMap.get(
            data.rarity
        );

        const content = this.node.getChildByPath("__ViewContent");
        // name
        content.getChildByPath("Name").getComponent(Label).string = data.name;
        // base property
        // userlanMgr
        // content.getChildByPath("BaseProperty/Attack/Title").getComponent(Label).string = LanMgr.getLanById("201003");
        content.getChildByPath("BaseProperty/Attack/Value").getComponent(Label).string = data.attack.toString();

        // userlanMgr
        // content.getChildByPath("BaseProperty/Defense/Title").getComponent(Label).string = LanMgr.getLanById("201003");
        content.getChildByPath("BaseProperty/Defense/Value").getComponent(Label).string = data.defense.toString();

        // userlanMgr
        // content.getChildByPath("BaseProperty/Hp/Title").getComponent(Label).string = LanMgr.getLanById("201003");
        content.getChildByPath("BaseProperty/Hp/Value").getComponent(Label).string = data.hp.toString();

        // userlanMgr
        // content.getChildByPath("BaseProperty/Speed/Title").getComponent(Label).string = LanMgr.getLanById("201003");
        content.getChildByPath("BaseProperty/Speed/Value").getComponent(Label).string = data.speed.toString();

        // userlanMgr
        // content.getChildByPath("BaseProperty/Iq/Title").getComponent(Label).string = LanMgr.getLanById("201003");
        content.getChildByPath("BaseProperty/Iq/Value").getComponent(Label).string = data.iq.toString();

        // level
        content.getChildByPath("Level/Label").getComponent(Label).string = "Lv." + data.level;
        // rank
        content.getChildByPath("Class/Label").getComponent(Label).string = "Rank. " + data.rank;

        // skill
        for (const item of this._skillAllItems) {
            item.destroy();
        }
        this._skillAllItems = [];
        for (let i = 0; i < data.skills.length; i++) {
            const item = instantiate(this._skillItem);
            item.active = true;
            item.parent = this._skillContent;
            item.getChildByPath("item").getComponent(Label).string = LanMgr.getLanById(NFTSkillConfig.getById(data.skills[i]).name);
            item.getComponent(Button).clickEvents[0].customEventData = data.skills[i];
            this._skillAllItems.push(item);
        }
        if (data.skills.length < currentSkillLimit) {
            if (data.skills.length % 2 != 0) {
                const item = instantiate(this._skillGapItem);
                item.active = true;
                item.parent = this._skillContent;
                this._skillAllItems.push(item);
            }
            const addItem = instantiate(this._skillAddItem);
            addItem.active = true;
            addItem.parent = this._skillContent;
            this._skillAllItems.push(addItem);
        }

        // action button
        content.getChildByPath("LeftArrowButton").active = this._currentIndex > 0;
        content.getChildByPath("RightArrowButton").active = this._currentIndex < this._NFTDatas.length - 1;
    }
    //---------------------------------------------------- action
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }

    private onTapShowLast() {
        if (this._currentIndex > 0) {
            this._currentIndex -= 1;
        }
        this._refreshUI();
    }
    private onTapShowNext() {
        if (this._currentIndex < this._NFTDatas.length - 1) {
            this._currentIndex += 1;
        }
        this._refreshUI();
    }

    private async onTapLevelUp() {
        if (this._NFTDatas != null && this._currentIndex >= 0 && this._currentIndex < this._NFTDatas.length) {
            const result = await UIPanelManger.inst.pushPanel(UIName.NFTLevelUpUI);
            if (result.success) {
                result.node.getComponent(NTFLevelUpUI).showUI(this._NFTDatas[this._currentIndex]);
            }
        }
    }
    private async onTapRankUp() {
        if (this._NFTDatas != null && this._currentIndex >= 0 && this._currentIndex < this._NFTDatas.length) {
            const result = await UIPanelManger.inst.pushPanel(UIName.NFTRankUpUI);
            if (result.success) {
                result.node.getComponent(NTFRankUpUI).showUI(this._NFTDatas[this._currentIndex]);
            }
        }
    }
    private onTapSkill(event: Event, customEventData: string) {
        const skillId = customEventData;
        
    }
    private async onTapAddSkill() {

    }
}
