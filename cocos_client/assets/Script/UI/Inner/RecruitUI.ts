import { _decorator, Component, Label, Layout, Node, ProgressBar, Slider } from 'cc';
import UserInfo from '../../Manger/UserInfoMgr';
import CommonTools from '../../Tool/CommonTools';
import { PopUpUI } from '../../BasicView/PopUpUI';
const { ccclass, property } = _decorator;

@ccclass('RecruitUI')
export class RecruitUI extends PopUpUI {

    public refreshUI(initSelectGenerate: boolean = false) {
        if (initSelectGenerate) {
            this._selectGenerateNum = 1;
        }
        const maxTroop: number = 9999999;
        this._totalTroop.string = maxTroop.toString();
        this._currentTroop.string = UserInfo.Instance.troop.toString();
        this._totalTroopProgress.progress = UserInfo.Instance.troop / maxTroop;

        this._maxRecruitTroop = maxTroop - UserInfo.Instance.troop;
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
        this._maxWood.string = UserInfo.Instance.wood.toString();
        this._usedStone.string = Math.ceil(this._perTroopStone * this._selectGenerateNum).toString();
        this._maxStone.string = UserInfo.Instance.stone.toString();
    }

    private _perTroopTime: number = 0.001;
    private _perTroopWood: number = 0.01;
    private _perTroopStone: number = 0.01;
    private _maxRecruitTroop: number = 0;

    private _selectGenerateNum: number = 1;
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
        this._usedWood = this.node.getChildByPath("Bg/footer/material/wood/num/left").getComponent(Label);
        this._maxWood = this.node.getChildByPath("Bg/footer/material/wood/num/right").getComponent(Label);
        this._usedStone = this.node.getChildByPath("Bg/footer/material/stone/num/left").getComponent(Label);
        this._maxStone = this.node.getChildByPath("Bg/footer/material/stone/num/right").getComponent(Label);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    //---------------------------------- action

    private onTapClose() {
        this.show(false);
    }

    private onTapGenerateMax() {
        const maxTroop: number = Math.min(
            UserInfo.Instance.wood / this._perTroopWood,
            UserInfo.Instance.stone / this._perTroopStone,
            this._maxRecruitTroop
        );
        if (maxTroop != this._selectGenerateNum) {
            this._selectGenerateNum = maxTroop;
            this.refreshUI();
        }
    }
    private onTapGenerateSub() {
        const changedNum = Math.max(1, this._selectGenerateNum - 100);
        if (changedNum != this._selectGenerateNum) {
            this._selectGenerateNum = changedNum;
            this.refreshUI();
        }
    }
    private onTapGenerateAdd() {
        const maxTroop: number = Math.min(
            UserInfo.Instance.wood / this._perTroopWood,
            UserInfo.Instance.stone / this._perTroopStone,
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
            UserInfo.Instance.wood / this._perTroopWood,
            UserInfo.Instance.stone / this._perTroopStone,
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
        UserInfo.Instance.wood -= parseInt(this._usedWood.string);
        UserInfo.Instance.stone -= parseInt(this._usedStone.string);
        UserInfo.Instance.beginGenerateTroop(this._generateTimeNum, this._selectGenerateNum);
        this.show(false);
    }
}

