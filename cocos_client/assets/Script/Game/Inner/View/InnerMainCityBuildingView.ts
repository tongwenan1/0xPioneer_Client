import { Label, Node, UITransform, _decorator } from "cc";
import { InnerBuildingView } from "./InnerBuildingView";
import { UIHUDController } from "../../../UI/UIHUDController";
import { ItemMgr, LanMgr, UIPanelMgr, UserInfoMgr } from "../../../Utils/Global";
import { UIName } from "../../../Const/ConstUIDefine";
import { UserInnerBuildInfo } from "../../../Const/BuildingDefine";
import { BuildingUpgradeUI } from "../../../UI/Inner/BuildingUpgradeUI";

const { ccclass, property } = _decorator;

@ccclass('InnerMainCityBuildingView')
export class InnerMainCityBuildingView extends InnerBuildingView {

    public async refreshUI(building: UserInnerBuildInfo) {
        await super.refreshUI(building);
    }


    protected innerBuildingLoad(): void {
        super.innerBuildingLoad();
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();
    }


    protected async innerBuildingTaped(): Promise<void> {
        super.innerBuildingTaped();

        if (this._building == null) {
            return;
        }
        if (this._building.upgradeTotalTime > 0) {
            UIHUDController.showCenterTip(LanMgr.getLanById("201003"));
            // UIHUDController.showCenterTip("The building is being upgraded, please wait.");
            return;
        }
        const view = UIPanelMgr.openPanel(UIName.BuildingUpgradeUI);
        if (view != null) {
            (await view).getComponent(BuildingUpgradeUI).refreshUI();
        }
    }

    //------------------------------- action
}