import { Label, Node, _decorator } from "cc";
import { InnerBuildingView } from "./InnerBuildingView";
import { UIHUDController } from "../../../UI/UIHUDController";
import { ItemMgr, LanMgr, UserInfoMgr } from "../../../Utils/Global";
import NotificationMgr from "../../../Basic/NotificationMgr";
import { UIName } from "../../../Const/ConstUIDefine";
import { RecruitUI } from "../../../UI/Inner/RecruitUI";
import CommonTools from "../../../Tool/CommonTools";
import { UserInnerBuildInfo } from "../../../Const/BuildingDefine";
import { NotificationName } from "../../../Const/Notification";
import UIPanelManger from "../../../Basic/UIPanelMgr";

const { ccclass, property } = _decorator;

@ccclass('InnerBarracksBuildingView')
export class InnerBarracksBuildingView extends InnerBuildingView {

    public async refreshUI(building: UserInnerBuildInfo, canAction: boolean = true) {
        await super.refreshUI(building, canAction);

        this._countingGenerate();
    }

    private _generateTime: Label = null;

    protected innerBuildingLoad(): void {
        super.innerBuildingLoad();
        this._generateTime = this.node.getChildByPath("RecruitTime").getComponent(Label);

        NotificationMgr.addListener(NotificationName.GENERATE_TROOP_TIME_COUNT_ChANGED, this._countingGenerate, this);
        NotificationMgr.addListener(NotificationName.GENERATE_TROOP_NUM_CHANGED, this._countingGenerate, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.GENERATE_TROOP_TIME_COUNT_ChANGED, this._countingGenerate, this);
        NotificationMgr.removeListener(NotificationName.GENERATE_TROOP_NUM_CHANGED, this._countingGenerate, this);
    }


    protected async innerBuildingTaped(): Promise<void> {
        super.innerBuildingTaped();

        if (this._building == null) {
            return;
        }
        if (this._building.buildLevel > 0) {
            if (UserInfoMgr.generateTroopInfo != null) {
                UIHUDController.showCenterTip(LanMgr.getLanById("201002"));
                // UIHUDController.showCenterTip("Recruiting…Please wait…");
                return;
            }
            const result = await UIPanelManger.inst.pushPanel(UIName.RecruitUI);
            if (result.success) {
                result.node.getComponent(RecruitUI).refreshUI(true);
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