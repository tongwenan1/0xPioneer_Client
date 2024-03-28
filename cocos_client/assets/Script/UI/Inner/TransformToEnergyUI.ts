import { _decorator, Color, Component, instantiate, Label, Layout, math, Node, ProgressBar, Slider } from 'cc';
import CommonTools from '../../Tool/CommonTools';
import { EventName, ResourceCorrespondingItem } from '../../Const/ConstDefine';
import { ItemMgr, LanMgr, UIPanelMgr, UserInfoMgr } from '../../Utils/Global';
import ViewController from '../../BasicView/ViewController';
import { UIHUDController } from '../UIHUDController';
import NotificationMgr from '../../Basic/NotificationMgr';
import InnerBuildingLvlUpConfig from '../../Config/InnerBuildingLvlUpConfig';
import { InnerBuildingType } from '../../Const/BuildingDefine';
import { UserInfoNotification } from '../../Const/UserInfoDefine';
import ItemData from '../../Const/Item';
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

        let maxGenerate: number = 99999999;
        for (const data of energyData.convert) {
            maxGenerate = Math.min(maxGenerate, ItemMgr.getOwnItemCount(data.type) / data.num);
        }
        if (initSelectGenerate) {
            this._selectGenerateNum = Math.min(maxGenerate, 1);
        } 
        // else {
        //     if (this._selectGenerateNum > maxGenerate) {
        //         this._selectGenerateNum = maxGenerate;
        //     }
        // }
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
            this._generateProgress.progress = this._selectGenerateNum / maxGenerate;
            this._generateSlider.progress = this._generateProgress.progress;
        }

        // useLanMgr
        // this._generateNumLabel.string = LanMgr.getLanById("107549") + " " + this._selectGenerateNum;
        this._generateNumLabel.string = "Convert for PSYC" + " " + this._selectGenerateNum;

        // cost
        if (this._costShowItems.length == energyData.convert.length) {
            for (let i = 0; i < this._costShowItems.length; i++) {
                let currentCost = energyData.convert[i].num * this._selectGenerateNum;
                if (this._selectGenerateNum == 0) {
                    currentCost = energyData.convert[i].num;
                }
                const ownNum: number = ItemMgr.getOwnItemCount(energyData.convert[i].type);

                const item = this._costShowItems[i];
                item.getChildByPath("num/left").getComponent(Label).string = currentCost + "";
                item.getChildByPath("num/right").getComponent(Label).string = ownNum.toString();
                item.getChildByPath("num/right").getComponent(Label).color = ownNum >= currentCost ? new Color(142, 218, 97) : Color.RED;
                item.getChildByPath("num").getComponent(Layout).updateLayout();
            }
        } else {
            // init
            for (const cost of energyData.convert) {
                let currentCost = cost.num * this._selectGenerateNum;
                if (this._selectGenerateNum == 0) {
                    currentCost = cost.num;
                }
                const ownNum: number = ItemMgr.getOwnItemCount(cost.type);
                const item = instantiate(this._costItem);
                item.active = true;
                item.setParent(this._costItem.parent);
                item.getChildByPath("Icon/8001").active = cost.type == ResourceCorrespondingItem.Food;
                item.getChildByPath("Icon/8002").active = cost.type == ResourceCorrespondingItem.Wood;
                item.getChildByPath("Icon/8003").active = cost.type == ResourceCorrespondingItem.Stone;
                item.getChildByPath("Icon/8004").active = cost.type == ResourceCorrespondingItem.Troop;
    
                item.getChildByPath("num/left").getComponent(Label).string = currentCost + "";
                item.getChildByPath("num/right").getComponent(Label).string = ownNum.toString();
                item.getChildByPath("num/right").getComponent(Label).color = ownNum >= currentCost ? new Color(142, 218, 97) : Color.RED;
                item.getChildByPath("num").getComponent(Layout).updateLayout();
                this._costShowItems.push(item);
            }
        }
    }

    private _selectGenerateNum: number = 0;


    private _perMinOutputLabel: Label = null;
    private _currentGeneratedNumLabel: Label = null;
    private _maxGenerateNumLabel: Label = null;

    private _generateProgress: ProgressBar = null;
    private _generateSlider: Slider = null;
    private _generateNumLabel: Label = null;
    private _costItem: Node = null;
    private _costShowItems: Node[] = [];
    protected viewDidLoad(): void {
        super.viewDidLoad();


        this._perMinOutputLabel = this.node.getChildByPath("__ViewContent/LeftContent/OutputTitle/Param/Num").getComponent(Label);
        this._currentGeneratedNumLabel = this.node.getChildByPath("__ViewContent/LeftContent/MaxStorageTitle/Param/Num").getComponent(Label);
        this._maxGenerateNumLabel = this.node.getChildByPath("__ViewContent/LeftContent/MaxStorageTitle/Param/Max").getComponent(Label);

        this._generateProgress = this.node.getChildByPath("__ViewContent/RightContent/scroll/ProgressBar").getComponent(ProgressBar);
        this._generateSlider = this.node.getChildByPath("__ViewContent/RightContent/scroll/ProgressBar/Slider").getComponent(Slider);
        this._generateNumLabel = this.node.getChildByPath("__ViewContent/RightContent/GenerateNum").getComponent(Label);

        this._costItem = this.node.getChildByPath("__ViewContent/footer/Resource/Item");
        this._costItem.active = false;
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
        let maxGenerate: number = 99999999;
        for (const data of energyData.convert) {
            maxGenerate = Math.min(maxGenerate, ItemMgr.getOwnItemCount(data.type) / data.num);
        }
        // maxGenerate = Math.min(maxGenerate, energyData.storage - userEnergyInfo.totalEnergyNum);

        // const currentSelectTroop: number = Math.max(1, Math.min(Math.floor(this._generateSlider.progress * (energyData.storage - userEnergyInfo.totalEnergyNum)), maxGenerate));
        const currentSelectTroop: number = Math.max(1, Math.min(Math.floor(this._generateSlider.progress *maxGenerate)));

        this._generateSlider.progress = currentSelectTroop / maxGenerate;
        if (currentSelectTroop != this._selectGenerateNum) {
            this._selectGenerateNum = currentSelectTroop;
            this.refreshUI();
        }
    }
    private onTapConvert() {
        const energyBuilding = UserInfoMgr.innerBuilds.get(InnerBuildingType.EnergyStation);
        if (energyBuilding == null) {
            return;
        }
        const energyData = InnerBuildingLvlUpConfig.getEnergyLevelData(energyBuilding.buildLevel);
        if (energyData == null) {
            return;
        }
        if (this._selectGenerateNum <= 0) {
            // useLanMgr
            // LanMgr.getLanById("107549")
            UIHUDController.showCenterTip("Unable to produce");
            return;
        }
        for (const cost of energyData.convert) {
            const currentCost = cost.num * this._selectGenerateNum;
            ItemMgr.subItem(cost.type, currentCost);            
        }
        ItemMgr.addItem([new ItemData(ResourceCorrespondingItem.Energy, this._selectGenerateNum)]);
        this.refreshUI(true);
    }
}


