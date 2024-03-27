import { _decorator, Component, Label, Layout, math, Node, ProgressBar, Slider } from 'cc';
import CommonTools from '../../Tool/CommonTools';
import { EventName, ResourceCorrespondingItem } from '../../Const/ConstDefine';
import { ItemMgr, LanMgr, UIPanelMgr, UserInfoMgr } from '../../Utils/Global';
import ViewController from '../../BasicView/ViewController';
import { UIHUDController } from '../UIHUDController';
import NotificationMgr from '../../Basic/NotificationMgr';
import InnerBuildingLvlUpConfig from '../../Config/InnerBuildingLvlUpConfig';
import { InnerBuildingType } from '../../Const/BuildingDefine';
import { UserInfoNotification } from '../../Const/UserInfoDefine';
const { ccclass, property } = _decorator;

@ccclass('TransformToEnergyUI')
export class TransformToEnergyUI extends ViewController {

    public refreshUI(initSelectGenerate: boolean = false) {
        const userEnergyInfo = UserInfoMgr.generateEnergyInfo;
        if (userEnergyInfo == null) {
            return;
        }
        const energyBuilding = UserInfoMgr.innerBuilds.get(InnerBuildingType.EnergyStation);
        if (energyBuilding == null) {
            return;
        }
        const energyData = InnerBuildingLvlUpConfig.getEnergyLevelData(energyBuilding.buildLevel);
        if (energyData == null) {
            return;
        }

        let maxGenerate: number = 99999;
        for (const data of energyData.convert) {
            maxGenerate = Math.min(maxGenerate, ItemMgr.getOwnItemCount(data.type) / data.num);
        }
        maxGenerate = Math.min(maxGenerate, energyData.storage - userEnergyInfo.totalEnergyNum);
        if (initSelectGenerate) {
            maxGenerate = Math.min(maxGenerate, 1);
            this._selectGenerateNum = maxGenerate;
        } else {
            if (this._selectGenerateNum > maxGenerate) {
                this._selectGenerateNum = maxGenerate;
            }
        }
        // useLanMgr
        // this.node.getChildByPath("__ViewContent/title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/RightContent/title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/LeftContent/OutputTitle").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/LeftContent/OutputTitle/Param/Unit").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/LeftContent/MaxStorageTitle").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/footer/Button/Label").getComponent(Label).string = LanMgr.getLanById("107549");

        this._perMinOutputLabel.string = energyData.output.toString();
        this._currentGeneratedNumLabel.string = userEnergyInfo.totalEnergyNum.toString();
        this._maxGenerateNumLabel.string = energyData.storage.toString();

        if (maxGenerate <= 0) {
            this._generateProgress.node.active = false;
        } else {
            this._generateProgress.node.active = true;
            this._generateProgress.progress = this._selectGenerateNum / (energyData.storage - userEnergyInfo.totalEnergyNum);
            this._generateSlider.progress = this._generateProgress.progress;
        }

        // useLanMgr
        // this._generateNumLabel.string = LanMgr.getLanById("107549") + " " + this._selectGenerateNum;
        this._generateNumLabel.string = "Convert for PSYC" + " " + this._selectGenerateNum;
    }

    private _selectGenerateNum: number = 0;


    private _perMinOutputLabel: Label = null;
    private _currentGeneratedNumLabel: Label = null;
    private _maxGenerateNumLabel: Label = null;

    private _generateProgress: ProgressBar = null;
    private _generateSlider: Slider = null;
    private _generateNumLabel: Label = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();


        this._perMinOutputLabel = this.node.getChildByPath("__ViewContent/LeftContent/OutputTitle/Param/Num").getComponent(Label);
        this._currentGeneratedNumLabel = this.node.getChildByPath("__ViewContent/LeftContent/MaxStorageTitle/Param/Num").getComponent(Label);
        this._maxGenerateNumLabel = this.node.getChildByPath("__ViewContent/LeftContent/MaxStorageTitle/Param/Max").getComponent(Label);

        this._generateProgress = this.node.getChildByPath("__ViewContent/RightContent/scroll/ProgressBar").getComponent(ProgressBar);
        this._generateSlider = this.node.getChildByPath("__ViewContent/RightContent/scroll/ProgressBar/Slider").getComponent(Slider);
        this._generateNumLabel = this.node.getChildByPath("__ViewContent/RightContent/GenerateNum").getComponent(Label);
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();

        NotificationMgr.addListener(UserInfoNotification.generateEnergyNumChanged, this._energyNumChanged, this);
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();

        NotificationMgr.removeListener(UserInfoNotification.generateEnergyNumChanged, this._energyNumChanged, this);

    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();
    }

    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByPath("__ViewContent");
    }

    //---------------------------------- function
    private _energyNumChanged() {
        this.refreshUI();
    }

    
    //---------------------------------- action
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelMgr.removePanelByNode(this.node);
    }
    private onGenerateSlided(event: Event, customEventData: string) {
        const userEnergyInfo = UserInfoMgr.generateEnergyInfo;
        if (userEnergyInfo == null) {
            return;
        }
        const energyBuilding = UserInfoMgr.innerBuilds.get(InnerBuildingType.EnergyStation);
        if (energyBuilding == null) {
            return;
        }
        const energyData = InnerBuildingLvlUpConfig.getEnergyLevelData(energyBuilding.buildLevel);
        if (energyData == null) {
            return;
        }
        let maxGenerate: number = 99999;
        for (const data of energyData.convert) {
            maxGenerate = Math.min(maxGenerate, ItemMgr.getOwnItemCount(data.type) / data.num);
        }
        maxGenerate = Math.min(maxGenerate, energyData.storage - userEnergyInfo.totalEnergyNum);

        const currentSelectTroop: number = Math.max(1, Math.min(Math.floor(this._generateSlider.progress * (energyData.storage - userEnergyInfo.totalEnergyNum)), maxGenerate));

        this._generateSlider.progress = currentSelectTroop / (energyData.storage - userEnergyInfo.totalEnergyNum);
        if (currentSelectTroop != this._selectGenerateNum) {
            this._selectGenerateNum = currentSelectTroop;
            this.refreshUI();
        }
    }
    private onTapConvert() {

    }

    private async onTapGenerate() {
        // if (this._generateTimeNum <= 0) {
        //     // useLanMgr
        //     // LanMgr.getLanById("107549")
        //     UIHUDController.showCenterTip("Unable to produce");
        //     return;
        // }
        // ItemMgr.subItem(ResourceCorrespondingItem.Wood, parseInt(this._usedWood.string));
        // ItemMgr.subItem(ResourceCorrespondingItem.Stone, parseInt(this._usedStone.string));
        // UserInfoMgr.beginGenerateTroop(this._generateTimeNum, this._selectGenerateNum);

        // await this.playExitAnimation();
        // UIPanelMgr.removePanelByNode(this.node);
    }
}


