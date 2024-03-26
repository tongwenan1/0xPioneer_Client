import { Label, Node, _decorator } from "cc";
import { InnerBuildingView } from "./InnerBuildingView";
import { UIHUDController } from "../../../UI/UIHUDController";
import { ItemMgr, LanMgr, UIPanelMgr, UserInfoMgr } from "../../../Utils/Global";
import ItemData from "../../../Model/ItemData";
import { ResourceCorrespondingItem } from "../../../Const/ConstDefine";
import NotificationMgr from "../../../Basic/NotificationMgr";
import { UIName } from "../../../Const/ConstUIDefine";
import { RecruitUI } from "../../../UI/Inner/RecruitUI";
import CommonTools from "../../../Tool/CommonTools";
import { UserInnerBuildInfo } from "../../../Const/BuildingDefine";
import { UserInfoNotification } from "../../../Const/UserInfoDefine";
import { BuildingUpgradeUI } from "../../../UI/Inner/BuildingUpgradeUI";

const { ccclass, property } = _decorator;

@ccclass('InnerMainCityBuildingView')
export class InnerMainCityBuildingView extends InnerBuildingView {

    public refreshUI(building: UserInnerBuildInfo) {
        super.refreshUI(building);
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
        if (this._building.building) {
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