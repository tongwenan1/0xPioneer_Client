import { _decorator, Component, Label, Layout, Node, ProgressBar, Slider } from 'cc';
import UserInfo from '../../Manger/UserInfoMgr';
import CommonTools from '../../Tool/CommonTools';
import { PopUpUI } from '../../BasicView/PopUpUI';
import LanMgr from '../../Manger/LanMgr';
import EventMgr from '../../Manger/EventMgr';
import { EventName, ResourceCorrespondingItem } from '../../Const/ConstDefine';
import ItemMgr from '../../Manger/ItemMgr';
import { GameMain } from '../../GameMain';
import { channel } from 'diagnostics_channel';
const { ccclass, property } = _decorator;

@ccclass('RecruitUI')
export class RecruitUI extends PopUpUI {

    public refreshUI(initSelectGenerate: boolean = false) {
        if (initSelectGenerate) {
            const maxTroop: number = Math.min(
                ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Wood) / this._perTroopWood,
                ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Stone) / this._perTroopStone,
                this._maxRecruitTroop
            );
            this._selectGenerateNum = Math.min(maxTroop, 1);
        }

        // useLanMgr
        // this.node.getChildByPath("Bg/title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByName("Bg/current_res/title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByName("Bg/recruiting/title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByName("Bg/footer/time/txt").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByName("Bg/footer/Button/Label").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        const currentTroops: number = ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Troop);

        const maxTroop: number = 9999999;
        this._totalTroop.string = maxTroop.toString();
        this._currentTroop.string = currentTroops.toString();
        this._totalTroopProgress.progress = currentTroops / maxTroop;

        this._maxRecruitTroop = maxTroop - currentTroops;
        this.scheduleOnce(()=> {
            this._generateProgress.progress = this._selectGenerateNum / this._maxRecruitTroop;
        });
        this._generateSlider.progress = this._selectGenerateNum / this._maxRecruitTroop;
        this._generateMaxTroop.string = this._maxRecruitTroop.toString();
        this._generateSelectTroop.string = this._selectGenerateNum.toString();
        this._generateMaxTroop.node.getParent().getComponent(Layout).updateLayout();

        this._generateTimeNum = Math.ceil(this._perTroopTime * this._selectGenerateNum);
        this._generateTime.string = CommonTools.formatSeconds(this._generateTimeNum);

        this._usedWood.string = Math.ceil(this._perTroopWood * this._selectGenerateNum).toString();
        this._maxWood.string = ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Wood).toString();
        this._usedStone.string = Math.ceil(this._perTroopStone * this._selectGenerateNum).toString();
        this._maxStone.string = ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Stone).toString();
    }

    private _perTroopTime: number = 0.001;
    private _perTroopWood: number = 0.01;
    private _perTroopStone: number = 0.01;
    private _maxRecruitTroop: number = 0;

    private _selectGenerateNum: number = 0;
    private _generateTimeNum: number = 0;

    private _totalTroopProgress: ProgressBar = null;
    private _currentTroop: Label = null;
    private _totalTroop: Label = null;

    private _generateProgress: ProgressBar = null;
    private _generateSlider: Slider = null;
    private _generateMaxTroop: Label = null;
    private _generateSelectTroop: Label = null;

    private _generateTime: Label = null;
    private _usedWood: Label = null;
    private _maxWood: Label = null;
    private _usedStone: Label = null;
    private _maxStone: Label = null;

    public override get typeName() {
        return "RecruitUI";
    }

    onLoad(): void {
        this._totalTroopProgress = this.node.getChildByPath("Bg/ProgressBar").getComponent(ProgressBar);
        this._currentTroop = this.node.getChildByPath("Bg/current_res/num/cur").getComponent(Label);
        this._totalTroop = this.node.getChildByPath("Bg/current_res/num/max").getComponent(Label);

        this._generateProgress = this.node.getChildByPath("Bg/recruiting/scroll/ProgressBar").getComponent(ProgressBar);
        this._generateSlider = this._generateProgress.node.getChildByName("Slider").getComponent(Slider);
        this._generateMaxTroop = this.node.getChildByPath("Bg/recruiting/control/num/max").getComponent(Label);
        this._generateSelectTroop = this.node.getChildByPath("Bg/recruiting/control/num/cur").getComponent(Label);


        this._generateTime = this.node.getChildByPath("Bg/footer/time/txt-001").getComponent(Label);
        this._usedWood = this.node.getChildByPath("Bg/footer/material/wood_bg/wood/num/left").getComponent(Label);
        this._maxWood = this.node.getChildByPath("Bg/footer/material/wood_bg/wood/num/right").getComponent(Label);
        this._usedStone = this.node.getChildByPath("Bg/footer/material/stone_bg/stone/num/left").getComponent(Label);
        this._maxStone = this.node.getChildByPath("Bg/footer/material/stone_bg/stone/num/right").getComponent(Label);

        EventMgr.on(EventName.CHANGE_LANG, this.changeLang, this);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    onDestroy(): void {
        EventMgr.off(EventName.CHANGE_LANG, this.changeLang, this);
    }

    changeLang(): void {
        if (this.node.active === false) return;
        this.refreshUI();
    }

    //---------------------------------- action

    private onTapClose() {
        this.show(false);
    }

    private onTapGenerateMax() {
        const maxTroop: number = Math.min(
            ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Wood) / this._perTroopWood,
            ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Stone) / this._perTroopStone,
            this._maxRecruitTroop
        );
        if (maxTroop != this._selectGenerateNum) {
            this._selectGenerateNum = maxTroop;
            this.refreshUI();
        }
    }
    private onTapGenerateSub() {
        const maxTroop: number = Math.min(
            ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Wood) / this._perTroopWood,
            ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Stone) / this._perTroopStone,
            this._maxRecruitTroop
        );
        const minNum: number = Math.min(1, maxTroop);
        let changedNum = Math.max(minNum, this._selectGenerateNum - 100);
        if (changedNum != this._selectGenerateNum) {
            this._selectGenerateNum = changedNum;
            this.refreshUI();
        }
    }
    private onTapGenerateAdd() {
        const maxTroop: number = Math.min(
            ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Wood) / this._perTroopWood,
            ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Stone) / this._perTroopStone,
            this._maxRecruitTroop
        );
        const changedNum = Math.min(this._selectGenerateNum + 100, maxTroop);
        if (changedNum != this._selectGenerateNum) {
            this._selectGenerateNum = changedNum;
            this.refreshUI();
        }
    }
    private onGenerateSlided(event: Event, customEventData: string) {
        const maxTroop: number = Math.min(
            ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Wood) / this._perTroopWood,
            ItemMgr.Instance.getOwnItemCount(ResourceCorrespondingItem.Stone) / this._perTroopStone,
            this._maxRecruitTroop
        );
        const currentSelectTroop: number = Math.max(1, Math.min(Math.floor(this._generateSlider.progress * this._maxRecruitTroop), maxTroop));

        this._generateSlider.progress = currentSelectTroop / this._maxRecruitTroop;
        if (currentSelectTroop != this._selectGenerateNum) {
            this._selectGenerateNum = currentSelectTroop;
            this.refreshUI();
        }
    }
    
    private onTapGenerate() {
        if (this._generateTimeNum <= 0) {
            // useLanMgr
            // LanMgr.Instance.getLanById("107549")
            GameMain.inst.UI.ShowTip("Unable to produce");
            return;
        }
        ItemMgr.Instance.subItem(ResourceCorrespondingItem.Wood, parseInt(this._usedWood.string));
        ItemMgr.Instance.subItem(ResourceCorrespondingItem.Stone, parseInt(this._usedStone.string));
        UserInfo.Instance.beginGenerateTroop(this._generateTimeNum, this._selectGenerateNum);
        this.show(false);
    }
}


