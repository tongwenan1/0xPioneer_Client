import { CCString, Component, EventMouse, Node, Prefab, SpriteFrame, UITransform, Vec3, _decorator, instantiate, v3 } from "cc";
import ViewController from "../../BasicView/ViewController";
import { InnerBuildingType, UserInnerBuildInfo } from "../../Const/BuildingDefine";
import { InnerBuildingView } from "./View/InnerBuildingView";
import InnerBuildingConfig from "../../Config/InnerBuildingConfig";
import { UserInfoMgr } from "../../Utils/Global";
import { InnerMainCityBuildingView } from "./View/InnerMainCityBuildingView";
import { InnerBarracksBuildingView } from "./View/InnerBarracksBuildingView";
import { InnerEnergyStationBuildingView } from "./View/InnerEnergyStationBuildingView";

const { ccclass, property } = _decorator;

@ccclass('InnerBuildingController')
export class InnerBuildingController extends ViewController {


    private _buildingMap: Map<InnerBuildingType, InnerBuildingView> = new Map();
    protected viewDidLoad(): void {
        super.viewDidLoad();
    }

    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();

        this._initBuilding();
        await this._refreshBuilding();
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();
        this._refreshBuilding();
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();

    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();
    }

    //-------------------------------------- function
    private _initBuilding() {
        const innerBuilding = UserInfoMgr.innerBuilds;
        innerBuilding.forEach((value: UserInnerBuildInfo, key: InnerBuildingType) => {
            const config = InnerBuildingConfig.getByBuildingType(key);
            if (config != null) {
                const view = this.node.getChildByPath("BuildingContent/" + config.anim);
                if (view != null) {
                    if (key == InnerBuildingType.MainCity) {
                        this._buildingMap.set(key, view.getComponent(InnerMainCityBuildingView));
                    } else if (key == InnerBuildingType.Barrack) {
                        this._buildingMap.set(key, view.getComponent(InnerBarracksBuildingView));
                    } else if (key == InnerBuildingType.EnergyStation) {
                        this._buildingMap.set(key, view.getComponent(InnerEnergyStationBuildingView));
                    } else {
                        this._buildingMap.set(key, view.getComponent(InnerBuildingView));
                    }
                }
            }
        });
    }

    private _refreshBuilding() {
        const innerBuilds = UserInfoMgr.innerBuilds;
        this._buildingMap.forEach(async (value: InnerBuildingView, key: InnerBuildingType) => {
            if (innerBuilds.has(key)) {
                value.node.active = true;
                await value.refreshUI(innerBuilds.get(key));
            } else {
                value.node.active = false;
            }
        });
    }
}