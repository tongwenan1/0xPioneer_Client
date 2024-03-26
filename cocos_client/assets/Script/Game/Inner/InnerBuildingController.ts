import { CCString, Component, EventMouse, Node, Prefab, SpriteFrame, UITransform, Vec3, _decorator, instantiate, v3 } from "cc";
import ViewController from "../../BasicView/ViewController";
import NotificationMgr from "../../Basic/NotificationMgr";
import { InnerBuildingNotification, InnerBuildingType, UserInnerBuildInfo } from "../../Const/BuildingDefine";
import { InnerBuildingView } from "./View/InnerBuildingView";
import InnerBuildingConfig from "../../Config/InnerBuildingConfig";
import InnerBuildingLvlUpConfig from "../../Config/InnerBuildingLvlUpConfig";
import { ItemMgr, UserInfoMgr } from "../../Utils/Global";
import { InnerMainCityBuildingView } from "./View/InnerMainCityBuildingView";
import { InnerBarracksBuildingView } from "./View/InnerBarracksBuildingView";
import { InnerEnergyStationBuildingView } from "./View/InnerEnergyStationBuildingView";

const { ccclass, property } = _decorator;

@ccclass('InnerBuildingController')
export class InnerBuildingController extends ViewController {

    @property(Prefab)
    private mainCityPrb: Prefab = null;

    @property(Prefab)
    private barracksPrb: Prefab = null;

    @property(Prefab)
    private housePrb: Prefab = null;

    @property(Prefab)
    private energyStationPrb: Prefab = null;

    private _mainCityPos: Vec3 = v3(240, -285, 0);
    private _barracksPos: Vec3 = v3(1245, 75, 0);
    private _housePos: Vec3 = v3(-859, -263, 0);
    private _energyStationPos: Vec3 = v3(-676, 260, 0);
    private _buildingMap: Map<InnerBuildingType, InnerBuildingView> = new Map();
    protected viewDidLoad(): void {
        super.viewDidLoad();
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        this._initBuilding();
        this._refreshEnergyStationShow();


        NotificationMgr.addListener(InnerBuildingNotification.BeginUpgrade, this._beginBuildingUpgrade, this);
        NotificationMgr.addListener(InnerBuildingNotification.upgradeFinished, this._upgradeFinished, this);
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();


    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();

    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(InnerBuildingNotification.BeginUpgrade, this._beginBuildingUpgrade, this);
        NotificationMgr.removeListener(InnerBuildingNotification.upgradeFinished, this._upgradeFinished, this);
    }

    //-------------------------------------- function
    private _initBuilding() {
        const buildingTypes = [InnerBuildingType.MainCity, InnerBuildingType.Barrack, InnerBuildingType.EnergyStation, InnerBuildingType.House];
        const buildingPositions = [this._mainCityPos, this._barracksPos, this._energyStationPos, this._housePos];
        const buildingPrbs = [this.mainCityPrb, this.barracksPrb, this.energyStationPrb, this.housePrb];

        for (let i = 0; i < buildingTypes.length; i++) {
            const buildingType = buildingTypes[i];
            const buildingPosition = buildingPositions[i];
            const buildingPrb = buildingPrbs[i];
            const buildingNode = instantiate(buildingPrb);
            buildingNode.parent = this.node;
            buildingNode.setPosition(buildingPosition);
            let buildingView = null;
            if (buildingType == InnerBuildingType.MainCity) {
                buildingView = buildingNode.getComponent(InnerMainCityBuildingView);
            } else if (buildingType == InnerBuildingType.Barrack) {
                buildingView = buildingNode.getComponent(InnerBarracksBuildingView);
            } else if (buildingType == InnerBuildingType.EnergyStation) {
                buildingView = buildingNode.getComponent(InnerEnergyStationBuildingView);
            } else {
                buildingView = buildingNode.getComponent(InnerBuildingView);
            }
            if (buildingView != null) {
                this._buildingMap.set(buildingType, buildingView);
            }
        }

        const innerBuilds = UserInfoMgr.innerBuilds;
        innerBuilds.forEach((value: UserInnerBuildInfo, key: InnerBuildingType) => {
            if (this._buildingMap.has(key)) {
                this._buildingMap.get(key).refreshUI(value);
            }
        });
    }

    private _refreshEnergyStationShow() {
        const energyStationView: InnerBuildingView = this._buildingMap.get(InnerBuildingType.EnergyStation);
        const mainCityData = UserInfoMgr.innerBuilds.get(InnerBuildingType.MainCity);
        if (energyStationView != null && mainCityData != null && mainCityData.buildLevel > 0) {
            energyStationView.node.active = true;
            energyStationView.refreshUI({
                buildLevel: mainCityData.buildLevel,
                buildType: InnerBuildingType.EnergyStation,
                building: false
            });
        } else {
            energyStationView.node.active = false;
        }
    }

    private _beginBuildingUpgrade(buildingType: InnerBuildingType): void {
        if (this._buildingMap.has(buildingType)) {
            const buildingView: InnerBuildingView = this._buildingMap.get(buildingType);
            buildingView.playBuildAnim(5);
        }
    }

    private _upgradeFinished(buildingType: InnerBuildingType) {
        const userInnerData = UserInfoMgr.innerBuilds.get(buildingType);
        const innerConfig = InnerBuildingConfig.getByBuildingType(buildingType);
        const innerLevelUpConfig = InnerBuildingLvlUpConfig.getByLevel(userInnerData.buildLevel + 1);

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
                if (cost.length == 2) {
                    ItemMgr.subItem(cost[0].toString(), cost[1]);
                }
            }
            UserInfoMgr.upgradeBuild(buildingType);
            // wait config
            // UserInfoMgr.explorationValue += upgradeData.progress;
            if (this._buildingMap.has(buildingType)) {
                this._buildingMap.get(buildingType).refreshUI(userInnerData);
            }
        }
        this._refreshEnergyStationShow();
    }
}