import { _decorator, Component, instantiate, Label, Layout, Node } from 'cc';
import { ItemMgr, LanMgr, UserInfoMgr } from '../../../Utils/Global';
import { MapBuildingType, InnerBuildingType, UserInnerBuildInfo } from '../../../Const/BuildingDefine';
import ViewController from '../../../BasicView/ViewController';
import NotificationMgr from '../../../Basic/NotificationMgr';
import ConfigConfig from '../../../Config/ConfigConfig';
import InnerBuildingLvlUpConfig from '../../../Config/InnerBuildingLvlUpConfig';
import InnerBuildingConfig from '../../../Config/InnerBuildingConfig';
import { NotificationName } from '../../../Const/Notification';
import { MapMemberFactionType } from '../../../Const/ConstDefine';
import { ConfigType, EnergyTipThresholdParam } from '../../../Const/Config';
import { MapBuildingObject } from '../../../Const/MapBuilding';
const { ccclass, property } = _decorator;

@ccclass('OuterBuildingView')
export class OuterBuildingView extends ViewController {

    public refreshUI(building: MapBuildingObject) {

        this._building = building;

        this.node.getChildByPath("Title/Text").getComponent(Label).string = LanMgr.getLanById(building.name);
        this.node.getChildByPath("Level/Text").getComponent(Label).string = "Lv." + building.level;

        for (const buildingName of this._buildViewNames) {
            this.node.getChildByPath("BuildingContent/" + buildingName).active = buildingName == building.animType;
        }

        const strongholdView = this.node.getChildByPath("StrongholdContent");
        strongholdView.active = false;

        const collectIcon = this.node.getChildByPath("Level/Collect");
        const exploreIcon = this.node.getChildByPath("Level/Explore");
        const strongholdIcon = this.node.getChildByPath("Level/Stronghold");
        const battleIcon = this.node.getChildByPath("Level/Battle");

        collectIcon.active = false;
        exploreIcon.active = false;
        strongholdIcon.active = false;
        battleIcon.active = false;

        this.node.getChildByPath("Level").active = true;
        if (building.type == MapBuildingType.city) {
            if (building.faction == MapMemberFactionType.enemy) {
                this.node.getChildByPath("Level").active = true;
                battleIcon.active = true;
            } else {
                this.node.getChildByPath("Level").active = false;
            }

        } else if (building.type == MapBuildingType.explore) {
            exploreIcon.active = true;

        } else if (building.type == MapBuildingType.stronghold) {
            strongholdIcon.active = true;
            strongholdView.active = true;

            // let isSelf = false;
            // for (const player of players) {
            //     if (building.defendPioneerIds.indexOf(player.id) != -1) {
            //         isSelf = true;
            //         break;
            //     }
            // }

            for (const view of this._strongholdViews) {
                view.destroy();
            }
            this._strongholdViews = [];

            for (const pioneerId of building.defendPioneerIds) {
                const tempView = instantiate(this._strongholdItem);
                tempView.active = true;
                tempView.getChildByPath("pioneer_default").active = pioneerId == "pioneer_0";
                tempView.getChildByPath("secretGuard").active = pioneerId == "pioneer_1";
                tempView.getChildByPath("doomsdayGangSpy").active = pioneerId == "pioneer_2";
                tempView.getChildByPath("rebels").active = pioneerId == "pioneer_3";
                this._strongholdItem.parent.addChild(tempView);
                this._strongholdViews.push(tempView);
            }
            this._strongholdItem.parent.getComponent(Layout).updateLayout();
            
            // if (isSelf) {
                // this._selfView.active = true;
            // } else {
                // this._neturalView.active = true;
            // }

        } else if (building.type == MapBuildingType.resource) {
            collectIcon.active = true;

        } else if (building.type == MapBuildingType.event) {
            exploreIcon.active = true;
        }

        this._levelShowing = this.node.getChildByPath("Level").active;

        this._refreshEnergyTipShow();
        this._refreshBuildTipShow();
    }

    public showName(isShow: boolean) {
        this.node.getChildByPath("Title").active = isShow;
        if (isShow) {
            this.node.getChildByPath("Level").active = this._levelShowing;
        } else {
            this.node.getChildByPath("Level").active = false;
        }
    }


    private _toGetEnergyTip: Node = null;
    private _toBuildBuildingTip: Node = null;

    private _buildViewNames: string[] = [
        "city",
        "treasure",
        "swamp_jungle",
        "sand_mineral",
        "oasis",
        "ambush",
        "ruin",
        "spider_cave",
        "laboratory",
        "ancient_ruins",
        "Aquatic_Relics_Group",
        "Tree_Group",
        "Pyramid_Group"
    ];
    private _levelShowing: boolean = false;
    private _building: MapBuildingObject = null;

    private _strongholdItem: Node = null;
    private _strongholdViews: Node[] = [];
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._toGetEnergyTip = this.node.getChildByName("ToGetEnergyTip");
        this._toGetEnergyTip.active = false;

        this._toBuildBuildingTip = this.node.getChildByName("ToBuildBuildingTip");
        this._toBuildBuildingTip.active = false;

        this._strongholdItem = this.node.getChildByPath("StrongholdContent/Item");
        this._strongholdItem.active = false;
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        NotificationMgr.addListener(NotificationName.GENERATE_ENERGY_NUM_CHANGED, this._onEnergyNumChanged, this);
        NotificationMgr.addListener(NotificationName.RESOURCE_GETTED, this._onResourceChanged, this);
        NotificationMgr.addListener(NotificationName.RESOURCE_CONSUMED, this._onResourceChanged, this);
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();

    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.GENERATE_ENERGY_NUM_CHANGED, this._onEnergyNumChanged, this);
        NotificationMgr.removeListener(NotificationName.RESOURCE_GETTED, this._onResourceChanged, this);
        NotificationMgr.removeListener(NotificationName.RESOURCE_CONSUMED, this._onResourceChanged, this);
    }

    //-------------------------------- function
    private _refreshEnergyTipShow() {
        this._toGetEnergyTip.active = false;
        if (this._building != null && this._building.type == MapBuildingType.city && this._building.faction != MapMemberFactionType.enemy) {
            const energyInfo = UserInfoMgr.generateEnergyInfo;
            if (energyInfo != null) {
                const threshold = (ConfigConfig.getConfig(ConfigType.MainCityEnergyTipThreshold) as EnergyTipThresholdParam).threshold;
                const energyStationData = UserInfoMgr.innerBuilds.get(InnerBuildingType.EnergyStation);
                const psycData = InnerBuildingLvlUpConfig.getEnergyLevelData(energyStationData.buildLevel);
                if (psycData != null) {
                    if ((energyInfo.totalEnergyNum / psycData.storage) >= threshold) {
                        this._toGetEnergyTip.active = true;
                    }
                }
            }
        }
    }
    private _refreshBuildTipShow() {
        this._toBuildBuildingTip.active = false;
        if (this._building != null && this._building.type == MapBuildingType.city && this._building.faction != MapMemberFactionType.enemy) {
            let canBuild: boolean = false;
            UserInfoMgr.innerBuilds.forEach((value: UserInnerBuildInfo, key: InnerBuildingType) => {
                const innerConfig = InnerBuildingConfig.getByBuildingType(key);
                const levelConfig = InnerBuildingLvlUpConfig.getBuildingLevelData(value.buildLevel + 1, innerConfig.lvlup_cost);
                if (levelConfig != null) {
                    let thisBuild: boolean = true;
                    for (const cost of levelConfig) {
                        const type = cost[0].toString();
                        const num = cost[1];
                        if (ItemMgr.getOwnItemCount(type) < num) {
                            thisBuild = false;
                            break;
                        }
                    }
                    if (thisBuild) {
                        canBuild = true;
                    }
                }
            });
            if (canBuild) {
                this._toBuildBuildingTip.active = true;
            }
        }
    }

    //-------------------------------- notification
    private _onEnergyNumChanged() {
        this._refreshEnergyTipShow();
    }
    private _onResourceChanged() {
        this._refreshBuildTipShow();
    }
}


