import { _decorator, Component, instantiate, Label, Layout, Node } from "cc";
import { LanMgr } from "../../../Utils/Global";
import { MapBuildingType, InnerBuildingType, UserInnerBuildInfo } from "../../../Const/BuildingDefine";
import ViewController from "../../../BasicView/ViewController";
import NotificationMgr from "../../../Basic/NotificationMgr";
import ConfigConfig from "../../../Config/ConfigConfig";
import InnerBuildingLvlUpConfig from "../../../Config/InnerBuildingLvlUpConfig";
import InnerBuildingConfig from "../../../Config/InnerBuildingConfig";
import { NotificationName } from "../../../Const/Notification";
import { MapMemberFactionType } from "../../../Const/ConstDefine";
import { ConfigType, EnergyTipThresholdParam } from "../../../Const/Config";
import { MapBuildingObject, MapBuildingTavernObject, MapBuildingWormholeObject } from "../../../Const/MapBuilding";
import { DataMgr } from "../../../Data/DataMgr";
import CommonTools from "../../../Tool/CommonTools";
import { CountDataMgr } from "../../../Data/Save/CountDataMgr";
const { ccclass, property } = _decorator;

@ccclass("OuterBuildingView")
export class OuterBuildingView extends ViewController {
    public refreshUI(building: MapBuildingObject) {
        this._building = building;

        this.node.getChildByPath("Title/Text").getComponent(Label).string = LanMgr.getLanById(building.name);
        this.node.getChildByPath("Level/Text").getComponent(Label).string = "Lv." + building.level;

        for (const buildingName of this._buildViewNames) {
            this.node.getChildByPath("BuildingContent/" + buildingName).active = buildingName == building.animType;
        }

        const strongholdView = this.node.getChildByPath("StrongholdContent");
        const wormholdView = this.node.getChildByPath("WormholdView");
        const tavernView = this.node.getChildByPath("TavernView");

        strongholdView.active = false;
        wormholdView.active = false;
        tavernView.active = false;

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
        } else if (building.type == MapBuildingType.wormhole) {
            strongholdIcon.active = true;
            wormholdView.active = true;

            const wormholeObj = building as MapBuildingWormholeObject;
            const prepareDidFinish: boolean = wormholeObj.wormholdCountdownTime > 0;
            const maxWormholdLength: number = 3;
            for (let i = 0; i < maxWormholdLength; i++) {
                const tempView = wormholdView.getChildByPath("WormholdContent/Item_" + i);

                const emptyView = tempView.getChildByPath("Empty");
                const prepareView = tempView.getChildByPath("Prepare");
                if (i < building.defendPioneerIds.length) {
                    const pioneerId = building.defendPioneerIds[i];
                    emptyView.active = false;
                    prepareView.active = true;
                    prepareView.getChildByPath("Icon/pioneer_default").active = pioneerId == "pioneer_0";
                    prepareView.getChildByPath("Icon/secretGuard").active = pioneerId == "pioneer_1";
                    prepareView.getChildByPath("Icon/doomsdayGangSpy").active = pioneerId == "pioneer_2";
                    prepareView.getChildByPath("Icon/rebels").active = pioneerId == "pioneer_3";
                    prepareView.getChildByPath("IconGarrison").active = !prepareDidFinish;
                } else {
                    emptyView.active = true;
                    prepareView.active = false;
                }
            }
            if (prepareDidFinish) {
                wormholdView.getChildByPath("Countdown").active = true;
                // useLanMgr
                // wormholdView.getChildByPath("Countdown").getComponent(Label).string = LanMgr.getLanById("107549") + ":" + CommonTools.formatSeconds(wormholeObj.wormholdCountdownTime);
                wormholdView.getChildByPath("Countdown").getComponent(Label).string =
                    "wormhold traveling: " + CommonTools.formatSeconds(wormholeObj.wormholdCountdownTime);
            } else {
                wormholdView.getChildByPath("Countdown").active = false;
            }
        } else if (building.type == MapBuildingType.resource) {
            collectIcon.active = true;
        } else if (building.type == MapBuildingType.event) {
            exploreIcon.active = true;
        } else if (building.type == MapBuildingType.tavern) {
            exploreIcon.active = true;

            const tavernObj = building as MapBuildingTavernObject;

            const countdownView = tavernView.getChildByPath("CountdownView");
            const newPioneerView = tavernView.getChildByPath("NewPioneerView");

            countdownView.active = false;
            newPioneerView.active = false;

            if (tavernObj.nft != null) {
                newPioneerView.active = true;
            } else if (tavernObj.tavernCountdownTime > 0) {
                countdownView.active = true;
                // useLanMgr
                // countdownView.getChildByPath("Text").getComponent(Label).string = LanMgr.getLanById("107549") + ":" + CommonTools.formatSeconds(tavernObj.tavernCountdownTime);
                countdownView.getChildByPath("Text").getComponent(Label).string = "recruiting: " + CommonTools.formatSeconds(tavernObj.tavernCountdownTime);
            }
            tavernView.active = countdownView.active || newPioneerView.active;
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
        "Pyramid_Group",
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

        NotificationMgr.addListener(NotificationName.GENERATE_ENERGY_NUM_DID_CHANGE, this._onEnergyNumChanged, this);
        NotificationMgr.addListener(NotificationName.RESOURCE_GETTED, this._onResourceChanged, this);
        NotificationMgr.addListener(NotificationName.RESOURCE_CONSUMED, this._onResourceChanged, this);
        NotificationMgr.addListener(NotificationName.BUILDING_WORMHOLE_COUNT_DOWN_TIME_DID_CHANGE, this._onWormholeCountDownTimeDidChange, this);
        NotificationMgr.addListener(NotificationName.BUILDING_TAVERN_COUNT_DOWN_TIME_DID_CHANGE, this._onTavernCountDownTimeDidChange, this);
        NotificationMgr.addListener(NotificationName.BUILDING_NEW_PIONEER_DID_CHANGE, this._onTavernNewPioneerDidChange, this);
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.GENERATE_ENERGY_NUM_DID_CHANGE, this._onEnergyNumChanged, this);
        NotificationMgr.removeListener(NotificationName.RESOURCE_GETTED, this._onResourceChanged, this);
        NotificationMgr.removeListener(NotificationName.RESOURCE_CONSUMED, this._onResourceChanged, this);
        NotificationMgr.removeListener(NotificationName.BUILDING_WORMHOLE_COUNT_DOWN_TIME_DID_CHANGE, this._onWormholeCountDownTimeDidChange, this);
        NotificationMgr.removeListener(NotificationName.BUILDING_TAVERN_COUNT_DOWN_TIME_DID_CHANGE, this._onTavernCountDownTimeDidChange, this);
        NotificationMgr.removeListener(NotificationName.BUILDING_NEW_PIONEER_DID_CHANGE, this._onTavernNewPioneerDidChange, this);
    }

    //-------------------------------- function
    private _refreshEnergyTipShow() {
        this._toGetEnergyTip.active = false;
        if (this._building != null && this._building.type == MapBuildingType.city && this._building.faction != MapMemberFactionType.enemy) {
            const energyInfo = DataMgr.s.userInfo.data.generateEnergyInfo;
            if (energyInfo != null) {
                const threshold = (ConfigConfig.getConfig(ConfigType.MainCityEnergyTipThreshold) as EnergyTipThresholdParam).threshold;
                const energyStationData = DataMgr.s.userInfo.data.innerBuildings[InnerBuildingType.EnergyStation];
                const psycData = InnerBuildingLvlUpConfig.getEnergyLevelData(energyStationData.buildLevel);
                if (psycData != null) {
                    if (energyInfo.totalEnergyNum / psycData.storage >= threshold) {
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
            const innerBuildings = DataMgr.s.userInfo.data.innerBuildings;
            for (const key in innerBuildings) {
                const value = innerBuildings[key];
                const innerConfig = InnerBuildingConfig.getByBuildingType(key as InnerBuildingType);
                const levelConfig = InnerBuildingLvlUpConfig.getBuildingLevelData(value.buildLevel + 1, innerConfig.lvlup_cost);
                if (levelConfig != null) {
                    let thisBuild: boolean = true;
                    for (const cost of levelConfig) {
                        const type = cost[0].toString();
                        const num = cost[1];
                        if (DataMgr.s.item.getObj_item_count(type) < num) {
                            thisBuild = false;
                            break;
                        }
                    }
                    if (thisBuild) {
                        canBuild = true;
                    }
                }
            }
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
    private _onWormholeCountDownTimeDidChange(data: { id: string }) {
        if (this._building == null || this._building.id != data.id) {
            return;
        }
        this.refreshUI(this._building);
    }
    private _onTavernCountDownTimeDidChange(data: { id: string }) {
        if (this._building == null || this._building.id != data.id) {
            return;
        }
        this.refreshUI(this._building);
    }
    private _onTavernNewPioneerDidChange(data: { id: string }) {
        if (this._building == null || this._building.id != data.id) {
            return;
        }
        this.refreshUI(this._building);
    }
}
