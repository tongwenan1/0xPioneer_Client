import { _decorator, Button, Color, instantiate, Label, Layout, Node, Sprite } from 'cc';
import { PopUpUI } from '../../BasicView/PopUpUI';
import { GameMain } from '../../GameMain';
import UserInfoMgr, { InnerBuildingType, UserInnerBuildInfo } from '../../Manger/UserInfoMgr';
import LanMgr from '../../Manger/LanMgr';
import InnerBuildingMgr from '../../Manger/InnerBuildingMgr';
import CommonTools from '../../Tool/CommonTools';
import { EventName, ResourceCorrespondingItem } from '../../Const/ConstDefine';
import ArtifactMgr from '../../Manger/ArtifactMgr';
import { ArtifactEffectType } from '../../Model/ArtifactData';
import ItemMgr from '../../Manger/ItemMgr';
import EventMgr from '../../Manger/EventMgr';
const { ccclass } = _decorator;

@ccclass('BuildingUpgradeUI')
export class BuildingUpgradeUI extends PopUpUI {

    public refreshUI() {
        const buildingInfoView = this.node.getChildByName("BuildingInfoView");

        // useLanMgr 
        // buildingInfoView.getChildByPath("Bg/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        const innerData: Map<string, UserInnerBuildInfo> = UserInfoMgr.Instance.innerBuilds;

        const mainData = innerData.get(InnerBuildingType.MainCity);
        const barracksData = innerData.get(InnerBuildingType.Barrack);
        const houseData = innerData.get(InnerBuildingType.House);
        // useLanMgr 
        // LanMgr.Instance.replaceLanById("107549", [LanMgr.Instance.getLanById(mainData.buildName), mainData.buildLevel]); // %s Lv.%s  
        buildingInfoView.getChildByPath("MainCityBg/MainCity/MainCityLabel").getComponent(Label).string = mainData.buildName + " Lv." + mainData.buildLevel;

        // useLanMgr 
        // LanMgr.Instance.replaceLanById("107549", [LanMgr.Instance.getLanById(barracksData.buildName), barracksData.buildLevel]); // %s Lv.%s  
        buildingInfoView.getChildByPath("Buildings/BarracksBg/Barracks/BarracksLabel").getComponent(Label).string = barracksData.buildName + " Lv." + barracksData.buildLevel;
        this._barracksBtn.clickEvents[0].customEventData = barracksData.buildID;
        // useLanMgr 
        // LanMgr.Instance.replaceLanById("107549", [LanMgr.Instance.getLanById(houseData.buildName), houseData.buildLevel]); // %s Lv.%s  
        buildingInfoView.getChildByPath("Buildings/ResidentialBg/Residential/ResidentialLabel").getComponent(Label).string = houseData.buildName + " Lv." + houseData.buildLevel;
        this._housesBtn.clickEvents[0].customEventData = houseData.buildID;
    }

    public mainCityBtn: Button = null;
    private _barracksBtn: Button = null;
    private _housesBtn: Button = null;

    private _levelInfoView: Node = null;
    private _levelInfoCostItem: Node = null;
    private _levelInfoShowCostItems: Node[] = [];

    onLoad(): void {
        this._barracksBtn = this.node.getChildByPath("BuildingInfoView/Buildings/BarracksBg/Barracks").getComponent(Button);
        this._housesBtn = this.node.getChildByPath("BuildingInfoView/Buildings/ResidentialBg/Residential").getComponent(Button);

        this._levelInfoView = this.node.getChildByPath("LevelInfoView");
        this._levelInfoView.active = false;
        this._levelInfoCostItem = this._levelInfoView.getChildByPath("UpgradeContent/Resource/Item");
        this._levelInfoCostItem.active = false;

        EventMgr.on(EventName.CHANGE_LANG, this._onLangChang, this);
    }

    start() {
        
    }
    update(deltaTime: number) {

    }

    onDestroy() {
        EventMgr.off(EventName.CHANGE_LANG, this._onLangChang, this);
    }

    private _onLangChang() {
        this.refreshUI();
    }
    
    private _refreshUpgradeUI(buildingType: InnerBuildingType) {
        const userInnerData = UserInfoMgr.Instance.innerBuilds.get(buildingType);
        const innerBuildData = InnerBuildingMgr.Instance.getInfoById(buildingType);
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
            // LanMgr.Instance.getLanById(upgradeData.desc);
            upgradeView.getChildByName("UpgradeLevelDesc").getComponent(Label).string = upgradeData.desc;

            // useTime
            // useLanMgr
            // LanMgr.Instance.getLanById("107549");
            upgradeView.getChildByPath("Time/Label-001").getComponent(Label).string = CommonTools.formatSeconds(upgradeData.time);

            // cost
            // upgradeView.getChildByName("CostTitle").getComponent(Label).string = LanMgr.Instance.getLanById("107549"); 
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

                item.getChildByPath("num/left").getComponent(Label).string = cost.num;
                item.getChildByPath("num/right").getComponent(Label).string = ItemMgr.Instance.getOwnItemCount(type).toString();

                this._levelInfoShowCostItems.push(item);
            }
            this._levelInfoCostItem.parent.getComponent(Layout).updateLayout();

            // button
            upgradeView.getChildByName("ActionButton").getComponent(Button).clickEvents[0].customEventData = buildingType;
            const actionButtonTip = upgradeView.getChildByPath("ActionButton/Label").getComponent(Label);
            if (userInnerData.buildLevel <= 0) {
                // useLanMgr
                // LanMgr.Instance.getLanById("107549");
                actionButtonTip.string = "Construct";
            } else {
                // useLanMgr
                // LanMgr.Instance.getLanById("107549");
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
        this._refreshUpgradeUI(buildingType);
    }
    private onTapBuildingUpgradeHide() {
        this._closeBuildingUpgradeUI();
    }
    private onTapBuildingUpgrade(event: Event, customEventData: string) {
        const buildingType: InnerBuildingType = customEventData as InnerBuildingType;
        const userInnerData = UserInfoMgr.Instance.innerBuilds.get(buildingType);
        const innerBuildData = InnerBuildingMgr.Instance.getInfoById(buildingType);
        const upgradeData = innerBuildData.up[(userInnerData.buildLevel + 1).toString()];
        if (upgradeData != null) {
            if (GameMain.inst.innerSceneMap.isUpgrading(buildingType)) {
                // useLanMgr
                GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("201004"));
                // GameMain.inst.UI.ShowTip("The building is being upgraded, please wait.");
                return;
            }
            // artifact effect
            const artifactPropEff = ArtifactMgr.Instance.getPropEffValue(UserInfoMgr.Instance.level);
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

                if (ItemMgr.Instance.getOwnItemCount(resource.type) < needNum) {
                    canUpgrade = false;
                    break;
                }
            }
            if (!canUpgrade) {
                // useLanMgr
                GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("201004"));
                // GameMain.inst.UI.ShowTip("Insufficient resources for building upgrades");
                return;
            }
            for (const resource of upgradeData.cost) {
                let needNum = resource.num;
                // total num
                needNum = Math.floor(needNum - (needNum * artifactResource));
                ItemMgr.Instance.subItem(resource.type, needNum);
            }
            UserInfoMgr.Instance.upgradeBuild(buildingType);
            UserInfoMgr.Instance.explorationValue += upgradeData.progress;
            // exp
            if (upgradeData.exp) UserInfoMgr.Instance.exp += upgradeData.exp;

            let up_time = upgradeData.time;
            // total time
            up_time = Math.floor(up_time - (up_time * artifactTime));
            if (up_time <= 0) up_time = 1;

            EventMgr.emit(EventName.BUILD_BEGIN_UPGRADE, { buildingType: buildingType, time: up_time });
            this._closeBuildingUpgradeUI();
            this.show(false);
        }
    }

    private onTapClose() {
        this.show(false);
    }
}


