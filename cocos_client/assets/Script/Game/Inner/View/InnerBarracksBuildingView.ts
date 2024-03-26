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

const { ccclass, property } = _decorator;

@ccclass('InnerBarracksBuildingView')
export class InnerBarracksBuildingView extends InnerBuildingView {

    public refreshUI(building: UserInnerBuildInfo) {
        super.refreshUI(building);

        this._countingGenerate();
    }

    private _generateTime: Label = null;

    protected innerBuildingLoad(): void {
        super.innerBuildingLoad();
        this._generateTime = this.node.getChildByPath("RecruitTime").getComponent(Label);

        NotificationMgr.addListener(UserInfoNotification.generateTroopTimeCountChanged, this._countingGenerate, this);
        NotificationMgr.addListener(UserInfoNotification.generateTroopNumChanged, this._countingGenerate, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(UserInfoNotification.generateTroopTimeCountChanged, this._countingGenerate, this);
        NotificationMgr.removeListener(UserInfoNotification.generateTroopNumChanged, this._countingGenerate, this);
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
        if (this._building.buildLevel > 0) {
            if (UserInfoMgr.generateTroopInfo != null) {
                UIHUDController.showCenterTip(LanMgr.getLanById("201002"));
                // UIHUDController.showCenterTip("Recruiting…Please wait…");
                return;
            }
            const view = await UIPanelMgr.openPanel(UIName.RecruitUI);
            if (view != null) {
                view.getComponent(RecruitUI).refreshUI(true);
            }
        }
    }

    //------------------------------- action
    private _countingGenerate() {
        if (this._building.buildLevel > 0 &&
            UserInfoMgr.generateTroopInfo != null &&
            UserInfoMgr.generateTroopInfo.countTime > 0) {
            this._generateTime.node.active = true;
            this._generateTime.string = CommonTools.formatSeconds(UserInfoMgr.generateTroopInfo.countTime);

        } else {
            this._generateTime.node.active = false;
        }
    }
}