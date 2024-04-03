import { _decorator, Component, Label, Layout, Node, ProgressBar, Slider } from 'cc';
import CommonTools from '../../Tool/CommonTools';
import { ResourceCorrespondingItem } from '../../Const/ConstDefine';
import { ItemMgr, LanMgr, UIPanelMgr, UserInfoMgr } from '../../Utils/Global';
import ViewController from '../../BasicView/ViewController';
import { UIHUDController } from '../UIHUDController';
import NotificationMgr from '../../Basic/NotificationMgr';
import { NotificationName } from '../../Const/Notification';
import InnerBuildingLvlUpConfig from '../../Config/InnerBuildingLvlUpConfig';
import { InnerBuildingType } from '../../Const/BuildingDefine';
const { ccclass, property } = _decorator;

@ccclass('RecruitUI')
export class RecruitUI extends ViewController {

    public refreshUI(initSelectGenerate: boolean = false) {
        if (initSelectGenerate) {
            const maxTroop: number = Math.min(
                ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Wood) / this._perTroopWood,
                ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Stone) / this._perTroopStone,
                this._maxRecruitTroop
            );
            this._selectGenerateNum = Math.min(maxTroop, 1);
        }

        // useLanMgr
        // this.node.getChildByPath("__ViewContent/title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/current_res/title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/recruiting/title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/footer/time/txt").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/footer/Button/Label").getComponent(Label).string = LanMgr.getLanById("107549");

        const currentTroops: number = ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Troop);

        let maxTroop: number = 9999999;
        const mainCityData = UserInfoMgr.innerBuilds.get(InnerBuildingType.Barrack);
        const configMaxTroop = InnerBuildingLvlUpConfig.getBuildingLevelData(mainCityData.buildLevel, "max_barr");
        if (configMaxTroop != null) {
            maxTroop = configMaxTroop;
        }
        this._totalTroop.string = maxTroop.toString();
        this._currentTroop.string = currentTroops.toString();
        this._totalTroopProgress.progress = currentTroops / maxTroop;

        this._maxRecruitTroop = Math.max(0, maxTroop - currentTroops);
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
        this._maxWood.string = ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Wood).toString();
        this._usedStone.string = Math.ceil(this._perTroopStone * this._selectGenerateNum).toString();
        this._maxStone.string = ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Stone).toString();
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

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._totalTroopProgress = this.node.getChildByPath("__ViewContent/ProgressBar").getComponent(ProgressBar);
        this._currentTroop = this.node.getChildByPath("__ViewContent/current_res/num/cur").getComponent(Label);
        this._totalTroop = this.node.getChildByPath("__ViewContent/current_res/num/max").getComponent(Label);

        this._generateProgress = this.node.getChildByPath("__ViewContent/recruiting/scroll/ProgressBar").getComponent(ProgressBar);
        this._generateSlider = this._generateProgress.node.getChildByPath("Slider").getComponent(Slider);
        this._generateMaxTroop = this.node.getChildByPath("__ViewContent/recruiting/control/num/max").getComponent(Label);
        this._generateSelectTroop = this.node.getChildByPath("__ViewContent/recruiting/control/num/cur").getComponent(Label);


        this._generateTime = this.node.getChildByPath("__ViewContent/footer/time/txt-001").getComponent(Label);
        this._usedWood = this.node.getChildByPath("__ViewContent/footer/material/wood_bg/wood/num/left").getComponent(Label);
        this._maxWood = this.node.getChildByPath("__ViewContent/footer/material/wood_bg/wood/num/right").getComponent(Label);
        this._usedStone = this.node.getChildByPath("__ViewContent/footer/material/stone_bg/stone/num/left").getComponent(Label);
        this._maxStone = this.node.getChildByPath("__ViewContent/footer/material/stone_bg/stone/num/right").getComponent(Label);

        NotificationMgr.addListener(NotificationName.CHANGE_LANG, this.changeLang, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.CHANGE_LANG, this.changeLang, this);
    }

    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByPath("__ViewContent");
    }


    changeLang(): void {
        if (this.node.active === false) return;
        this.refreshUI();
    }

    //---------------------------------- action

    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelMgr.removePanelByNode(this.node);
    }

    private onTapGenerateMax() {
        const maxTroop: number = Math.min(
            ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Wood) / this._perTroopWood,
            ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Stone) / this._perTroopStone,
            this._maxRecruitTroop
        );
        if (maxTroop != this._selectGenerateNum) {
            this._selectGenerateNum = maxTroop;
            this.refreshUI();
        }
    }
    private onTapGenerateSub() {
        const maxTroop: number = Math.min(
            ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Wood) / this._perTroopWood,
            ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Stone) / this._perTroopStone,
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
            ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Wood) / this._perTroopWood,
            ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Stone) / this._perTroopStone,
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
            ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Wood) / this._perTroopWood,
            ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Stone) / this._perTroopStone,
            this._maxRecruitTroop
        );
        const currentSelectTroop: number = Math.max(1, Math.min(Math.floor(this._generateSlider.progress * this._maxRecruitTroop), maxTroop));

        this._generateSlider.progress = currentSelectTroop / this._maxRecruitTroop;
        if (currentSelectTroop != this._selectGenerateNum) {
            this._selectGenerateNum = currentSelectTroop;
            this.refreshUI();
        }
    }
    
    private async onTapGenerate() {
        if (this._generateTimeNum <= 0) {
            // useLanMgr
            // LanMgr.getLanById("107549")
            UIHUDController.showCenterTip("Unable to produce");
            return;
        }
        ItemMgr.subItem(ResourceCorrespondingItem.Wood, parseInt(this._usedWood.string));
        ItemMgr.subItem(ResourceCorrespondingItem.Stone, parseInt(this._usedStone.string));
        UserInfoMgr.beginGenerateTroop(this._generateTimeNum, this._selectGenerateNum);
        
        await this.playExitAnimation();
        UIPanelMgr.removePanelByNode(this.node);
    }
}


