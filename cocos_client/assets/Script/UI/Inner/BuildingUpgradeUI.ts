import { _decorator, Button, Color, instantiate, Label, Layout, Node, Sprite } from 'cc';
import { GameMain } from '../../GameMain';
import CommonTools from '../../Tool/CommonTools';
import { EventName, ResourceCorrespondingItem } from '../../Const/ConstDefine';
import { ItemMgrEvent } from '../../Const/Manager/ItemMgrDefine';
import { InnerBuildingType, UserInnerBuildInfo } from '../../Const/Manager/UserInfoMgrDefine';
import { ArtifactMgr, InnerBuildingMgr, ItemMgr, LanMgr, UIPanelMgr, UserInfoMgr } from '../../Utils/Global';
import { ArtifactEffectType } from '../../Const/Model/ArtifactModelDefine';
import ViewController from '../../BasicView/ViewController';
import { UIHUDController } from '../UIHUDController';
import NotificationMgr from '../../Basic/NotificationMgr';
const { ccclass } = _decorator;

@ccclass('BuildingUpgradeUI')
export class BuildingUpgradeUI extends ViewController implements ItemMgrEvent {

    public refreshUI() {
        const buildingInfoView = this.node.getChildByPath("__ViewContent/BuildingInfoView");

        // useLanMgr 
        // buildingInfoView.getChildByPath("Bg/Title").getComponent(Label).string = LanMgr.getLanById("107549");

        const innerData: Map<string, UserInnerBuildInfo> = UserInfoMgr.innerBuilds;

        const mainData = innerData.get(InnerBuildingType.MainCity);
        const barracksData = innerData.get(InnerBuildingType.Barrack);
        const houseData = innerData.get(InnerBuildingType.House);
        const energyStationData = innerData.get(InnerBuildingType.EnergyStation);
        // useLanMgr 
        // LanMgr.replaceLanById("107549", [LanMgr.getLanById(mainData.buildName), mainData.buildLevel]); // %s Lv.%s  
        buildingInfoView.getChildByPath("MainCityBg/MainCity/MainCityLabel").getComponent(Label).string = mainData.buildName + " Lv." + mainData.buildLevel;

        // useLanMgr 
        // LanMgr.replaceLanById("107549", [LanMgr.getLanById(barracksData.buildName), barracksData.buildLevel]); // %s Lv.%s  
        buildingInfoView.getChildByPath("Buildings/BarracksBg/Barracks/BarracksLabel").getComponent(Label).string = barracksData.buildName + " Lv." + barracksData.buildLevel;
        this._barracksBtn.clickEvents[0].customEventData = barracksData.buildID;
        // useLanMgr 
        // LanMgr.replaceLanById("107549", [LanMgr.getLanById(houseData.buildName), houseData.buildLevel]); // %s Lv.%s  
        buildingInfoView.getChildByPath("Buildings/ResidentialBg/Residential/ResidentialLabel").getComponent(Label).string = houseData.buildName + " Lv." + houseData.buildLevel;
        this._housesBtn.clickEvents[0].customEventData = houseData.buildID;

        // useLanMgr 
        // LanMgr.replaceLanById("107549", [LanMgr.getLanById(energyStationData.buildName), energyStationData.buildLevel]); // %s Lv.%s  
        buildingInfoView.getChildByPath("Buildings/EnergyStationBg/Level").getComponent(Label).string = energyStationData.buildName + " Lv." + energyStationData.buildLevel;
        this._energyStationBtn.clickEvents[0].customEventData = energyStationData.buildID;
    }

    public mainCityBtn: Button = null;
    private _barracksBtn: Button = null;
    private _housesBtn: Button = null;
    private _energyStationBtn: Button = null;

    private _levelInfoView: Node = null;
    private _levelInfoCostItem: Node = null;
    private _levelInfoShowCostItems: Node[] = [];

    private _curBuildingType: InnerBuildingType = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._barracksBtn = this.node.getChildByPath("__ViewContent/BuildingInfoView/Buildings/BarracksBg").getComponent(Button);
        this._housesBtn = this.node.getChildByPath("__ViewContent/BuildingInfoView/Buildings/ResidentialBg").getComponent(Button);
        this._energyStationBtn = this.node.getChildByPath("__ViewContent/BuildingInfoView/Buildings/EnergyStationBg").getComponent(Button);

        this._levelInfoView = this.node.getChildByPath("__ViewContent/LevelInfoView");
        this._levelInfoView.active = false;
        this._levelInfoCostItem = this._levelInfoView.getChildByPath("UpgradeContent/Resource/Item");
        this._levelInfoCostItem.active = false;

        NotificationMgr.addListener(EventName.CHANGE_LANG, this._onLangChang, this);
        ItemMgr.addObserver(this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(EventName.CHANGE_LANG, this._onLangChang, this);
        ItemMgr.removeObserver(this);
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByPath("__ViewContent");
    }

    private _onLangChang() {
        this.refreshUI();
    }

    private _refreshUpgradeUI(buildingType: InnerBuildingType) {
        if (buildingType == null) {
            return;
        }
        const userInnerData = UserInfoMgr.innerBuilds.get(buildingType);
        const innerBuildData = InnerBuildingMgr.getInfoById(buildingType);
        const upgradeData = innerBuildData.up[(userInnerData.buildLevel + 1).toString()];

        this._levelInfoView.getChildByName("Barracks").active = buildingType == InnerBuildingType.Barrack;
        this._levelInfoView.getChildByName("Residential").active = buildingType == InnerBuildingType.House;

        const upgradeView = this._levelInfoView.getChildByPath("UpgradeContent");
        const maxTipView = this._levelInfoView.getChildByPath("LevelMaxContent");
        if (userInnerData.buildLevel >= innerBuildData.maxLevel ||
            upgradeData == null) {
            upgradeView.active = false;
            maxTipView.active = true;
        } else {
            upgradeView.active = true;
            maxTipView.active = false;
            // up level
            upgradeView.getChildByName("Level").getComponent(Label).string = "lv. " + userInnerData.buildLevel + "> lv. " + (userInnerData.buildLevel + 1);

            // desc
            // useLanMgr
            // LanMgr.getLanById(upgradeData.desc);
            upgradeView.getChildByName("UpgradeLevelDesc").getComponent(Label).string = upgradeData.desc;

            // useTime
            // useLanMgr
            // LanMgr.getLanById("107549");
            upgradeView.getChildByPath("Time/Label-001").getComponent(Label).string = CommonTools.formatSeconds(upgradeData.time);

            // cost
            // upgradeView.getChildByName("CostTitle").getComponent(Label).string = LanMgr.getLanById("107549"); 
            for (const item of this._levelInfoShowCostItems) {
                item.destroy();
            }
            this._levelInfoShowCostItems = [];
            for (const cost of upgradeData.cost) {
                const item = instantiate(this._levelInfoCostItem);
                item.active = true;
                item.setParent(this._levelInfoCostItem.parent);
                const type = cost.type;
                item.getChildByPath("Icon/8001").active = type == ResourceCorrespondingItem.Food;
                item.getChildByPath("Icon/8002").active = type == ResourceCorrespondingItem.Wood;
                item.getChildByPath("Icon/8003").active = type == ResourceCorrespondingItem.Stone;
                item.getChildByPath("Icon/8004").active = type == ResourceCorrespondingItem.Troop;

                const ownNum: number = ItemMgr.getOwnItemCount(type);

                item.getChildByPath("num/left").getComponent(Label).string = cost.num + "";
                item.getChildByPath("num/right").getComponent(Label).string = ItemMgr.getOwnItemCount(type).toString();
                item.getChildByPath("num/right").getComponent(Label).color = ownNum >= cost.num ? new Color(142, 218, 97) : Color.RED;

                this._levelInfoShowCostItems.push(item);
            }
            this._levelInfoCostItem.parent.getComponent(Layout).updateLayout();

            // button
            upgradeView.getChildByName("ActionButton").getComponent(Button).clickEvents[0].customEventData = buildingType;
            const actionButtonTip = upgradeView.getChildByPath("ActionButton/Label").getComponent(Label);
            if (userInnerData.buildLevel <= 0) {
                // useLanMgr
                // LanMgr.getLanById("107549");
                actionButtonTip.string = "Construct";
            } else {
                // useLanMgr
                // LanMgr.getLanById("107549");
                actionButtonTip.string = "Level Up";
            }
        }

    }
    private _closeBuildingUpgradeUI() {
        this._levelInfoView.active = false;
    }


    //----------------------------- action
    private onTapBuildingUpgradeShow(event: Event, customEventData: string) {
        const buildingType: InnerBuildingType = customEventData as InnerBuildingType;
        this._levelInfoView.active = true;
        this._curBuildingType = buildingType;
        this._refreshUpgradeUI(buildingType);
    }
    private onTapBuildingUpgradeHide() {
        this._closeBuildingUpgradeUI();
    }
    private async onTapBuildingUpgrade(event: Event, customEventData: string) {
        const buildingType: InnerBuildingType = customEventData as InnerBuildingType;
        const userInnerData = UserInfoMgr.innerBuilds.get(buildingType);
        const innerBuildData = InnerBuildingMgr.getInfoById(buildingType);
        const upgradeData = innerBuildData.up[(userInnerData.buildLevel + 1).toString()];
        if (upgradeData != null) {
            if (GameMain.inst.innerSceneMap.isUpgrading(buildingType)) {
                // useLanMgr
                UIHUDController.showCenterTip(LanMgr.getLanById("201004"));
                // UIHUDController.showCenterTip("The building is being upgraded, please wait.");
                return;
            }
            // artifact effect
            const artifactPropEff = ArtifactMgr.getPropEffValue(UserInfoMgr.level);
            let artifactTime = 0;
            if (artifactPropEff.eff[ArtifactEffectType.BUILDING_LVUP_TIME]) {
                artifactTime = artifactPropEff.eff[ArtifactEffectType.BUILDING_LVUP_TIME];
            }
            let artifactResource = 0;
            if (artifactPropEff.eff[ArtifactEffectType.BUILDING_LVLUP_RESOURCE]) {
                artifactResource = artifactPropEff.eff[ArtifactEffectType.BUILDING_LVLUP_RESOURCE];
            }
            let canUpgrade: boolean = true;
            for (const resource of upgradeData.cost) {
                let needNum = resource.num;
                // total num
                needNum = Math.floor(needNum - (needNum * artifactResource));

                if (ItemMgr.getOwnItemCount(resource.type) < needNum) {
                    canUpgrade = false;
                    break;
                }
            }
            if (!canUpgrade) {
                // useLanMgr
                UIHUDController.showCenterTip(LanMgr.getLanById("201004"));
                // UIHUDController.showCenterTip("Insufficient resources for building upgrades");
                return;
            }
            for (const resource of upgradeData.cost) {
                let needNum = resource.num;
                // total num
                needNum = Math.floor(needNum - (needNum * artifactResource));
                ItemMgr.subItem(resource.type, needNum);
            }
            UserInfoMgr.upgradeBuild(buildingType);
            UserInfoMgr.explorationValue += upgradeData.progress;
            // exp
            if (upgradeData.exp) UserInfoMgr.exp += upgradeData.exp;

            let up_time = upgradeData.time;
            // total time
            up_time = Math.floor(up_time - (up_time * artifactTime));
            if (up_time <= 0) up_time = 1;

            NotificationMgr.triggerEvent(EventName.BUILD_BEGIN_UPGRADE, { buildingType: buildingType, time: up_time });
            this._closeBuildingUpgradeUI();

            await this.playExitAnimation();
            UIPanelMgr.removePanelByNode(this.node);
        }
    }

    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelMgr.removePanelByNode(this.node);
    }

    //------------------- ItemMgrEvent
    itemChanged(): void {
        this._refreshUpgradeUI(this._curBuildingType);
    }
}


