import { _decorator, Button, Color, instantiate, Label, Layout, Node, Sprite } from 'cc';
import { GameMain } from '../../GameMain';
import CommonTools from '../../Tool/CommonTools';
import { EventName, ResourceCorrespondingItem } from '../../Const/ConstDefine';
import { ItemMgrEvent } from '../../Const/Manager/ItemMgrDefine';
import { ArtifactMgr, ItemMgr, LanMgr, UIPanelMgr, UserInfoMgr } from '../../Utils/Global';
import ViewController from '../../BasicView/ViewController';
import { UIHUDController } from '../UIHUDController';
import NotificationMgr from '../../Basic/NotificationMgr';
import { ArtifactEffectType } from '../../Const/Artifact';
import { InnerBuildingType, UserInnerBuildInfo } from '../../Const/BuildingDefine';
import InnerBuildingConfig from '../../Config/InnerBuildingConfig';
import InnerBuildingLvlUpConfig from '../../Config/InnerBuildingLvlUpConfig';
const { ccclass } = _decorator;

@ccclass('BuildingUpgradeUI')
export class BuildingUpgradeUI extends ViewController implements ItemMgrEvent {

    public refreshUI() {
        const buildingInfoView = this.node.getChildByPath("__ViewContent/BuildingInfoView");

        // useLanMgr 
        // buildingInfoView.getChildByPath("Bg/Title").getComponent(Label).string = LanMgr.getLanById("107549");

        const innerData: Map<string, UserInnerBuildInfo> = UserInfoMgr.innerBuilds;
        innerData.forEach((value: UserInnerBuildInfo, key: InnerBuildingType) => {
            if (this._buildingMap.has(key)) {
                const innerConfig = InnerBuildingConfig.getByBuildingType(key);
                if (innerConfig != null) {
                    const view = this._buildingMap.get(key);
                    view.getChildByPath("Title/Label").getComponent(Label).string = LanMgr.getLanById(innerConfig.name);
                    view.getChildByPath("Level").getComponent(Label).string = "Lv." + value.buildLevel;
                    view.getComponent(Button).clickEvents[0].customEventData = value.buildType;
                }
            }
        });
    }


    private _buildingMap: Map<InnerBuildingType, Node> = null;

    private _levelInfoView: Node = null;
    private _levelInfoCostItem: Node = null;
    private _levelInfoShowCostItems: Node[] = [];

    private _curBuildingType: InnerBuildingType = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._buildingMap = new Map();
        this._buildingMap.set(InnerBuildingType.MainCity, this.node.getChildByPath("__ViewContent/BuildingInfoView/MainCity"));
        this._buildingMap.set(InnerBuildingType.Barrack, this.node.getChildByPath("__ViewContent/BuildingInfoView/Buildings/Barracks"));
        this._buildingMap.set(InnerBuildingType.House, this.node.getChildByPath("__ViewContent/BuildingInfoView/Buildings/House"));

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
        const innerConfig = InnerBuildingConfig.getByBuildingType(buildingType);
        const innerLevelUpConfig = InnerBuildingLvlUpConfig.getByLevel(userInnerData.buildLevel + 1);

        if (userInnerData == null || innerConfig == null) {
            return;
        }

        // icon
        this._levelInfoView.getChildByPath("Bg/Barracks").active = buildingType == InnerBuildingType.Barrack;
        this._levelInfoView.getChildByPath("Bg/House").active = buildingType == InnerBuildingType.House;
        this._levelInfoView.getChildByPath("Bg/MainCity").active = buildingType == InnerBuildingType.MainCity;

        const upgradeView = this._levelInfoView.getChildByPath("UpgradeContent");
        const maxTipView = this._levelInfoView.getChildByPath("LevelMaxContent");
        if (userInnerData.buildLevel >= innerConfig.maxLevel ||
            innerLevelUpConfig == null) {
            // level max
            upgradeView.active = false;
            maxTipView.active = true;
        } else {
            upgradeView.active = true;
            maxTipView.active = false;
            // up level
            upgradeView.getChildByName("Level").getComponent(Label).string = "lv. " + userInnerData.buildLevel + "> lv. " + (userInnerData.buildLevel + 1);

            // desc wait config
            // useLanMgr
            // LanMgr.getLanById(upgradeData.desc);
            upgradeView.getChildByName("UpgradeLevelDesc").getComponent(Label).string = "";

            // useTime wait config
            // useLanMgr
            // LanMgr.getLanById("107549");
            upgradeView.getChildByPath("Time/Label-001").getComponent(Label).string = CommonTools.formatSeconds(5);

            // cost
            // upgradeView.getChildByName("CostTitle").getComponent(Label).string = LanMgr.getLanById("107549"); 
            for (const item of this._levelInfoShowCostItems) {
                item.destroy();
            }
            this._levelInfoShowCostItems = [];
            let costDatas = null;
            if (innerLevelUpConfig != null) {
                if (innerConfig.lvlup_cost == "cost_main") {
                    costDatas = innerLevelUpConfig.cost_main;
                } else if (innerConfig.lvlup_cost == "cost_barr") {
                    costDatas = innerLevelUpConfig.cost_barr;
                }
            }
            if (costDatas != null) {
                for (const cost of costDatas) {

                    const type = cost[0].toString();
                    const num = cost[1];
                    const ownNum: number = ItemMgr.getOwnItemCount(type);

                    const item = instantiate(this._levelInfoCostItem);
                    item.active = true;
                    item.setParent(this._levelInfoCostItem.parent);
                    item.getChildByPath("Icon/8001").active = type == ResourceCorrespondingItem.Food;
                    item.getChildByPath("Icon/8002").active = type == ResourceCorrespondingItem.Wood;
                    item.getChildByPath("Icon/8003").active = type == ResourceCorrespondingItem.Stone;
                    item.getChildByPath("Icon/8004").active = type == ResourceCorrespondingItem.Troop;

                    item.getChildByPath("num/left").getComponent(Label).string = num + "";
                    item.getChildByPath("num/right").getComponent(Label).string = ItemMgr.getOwnItemCount(type).toString();
                    item.getChildByPath("num/right").getComponent(Label).color = ownNum >= num ? new Color(142, 218, 97) : Color.RED;

                    this._levelInfoShowCostItems.push(item);
                }
                this._levelInfoCostItem.parent.getComponent(Layout).updateLayout();
            }
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
        const innerConfig = InnerBuildingConfig.getByBuildingType(buildingType);
        const innerLevelUpConfig = InnerBuildingLvlUpConfig.getByLevel(userInnerData.buildLevel + 1);

        if (userInnerData == null || innerConfig == null || innerLevelUpConfig == null) {
            return;
        }
        if (UserInfoMgr.level < innerConfig.unlock) {
            // useLanMgr
            // UIHUDController.showCenterTip(LanMgr.getLanById("201004"));
            UIHUDController.showCenterTip("Insufficient civilization level");
            return;
        }
        if (userInnerData.building) {
            UIHUDController.showCenterTip(LanMgr.getLanById("201003"));
            // UIHUDController.showCenterTip("The building is being upgraded, please wait.");
            return;
        }

        let costDatas = null;
        if (innerLevelUpConfig != null) {
            if (innerConfig.lvlup_cost == "cost_main") {
                costDatas = innerLevelUpConfig.cost_main;
            } else if (innerConfig.lvlup_cost == "cost_barr") {
                costDatas = innerLevelUpConfig.cost_barr;
            }
        }
        if (costDatas != null) {
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
            for (const resource of costDatas) {
                let needNum = resource[1];
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
            // for (const resource of upgradeData.cost) {
            //     let needNum = resource.num;
            //     // total num
            //     needNum = Math.floor(needNum - (needNum * artifactResource));
            //     ItemMgr.subItem(resource.type, needNum);
            // }
            // UserInfoMgr.upgradeBuild(buildingType);
            // UserInfoMgr.explorationValue += upgradeData.progress;
            // // exp
            // if (upgradeData.exp) UserInfoMgr.exp += upgradeData.exp;

            // let up_time = upgradeData.time;
            // // total time
            // up_time = Math.floor(up_time - (up_time * artifactTime));
            // if (up_time <= 0) up_time = 1;

            // NotificationMgr.triggerEvent(EventName.BUILD_BEGIN_UPGRADE, { buildingType: buildingType, time: up_time });
            // this._closeBuildingUpgradeUI();

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


