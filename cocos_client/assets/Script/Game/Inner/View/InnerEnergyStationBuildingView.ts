import { Label, Node, _decorator } from "cc";
import { InnerBuildingView } from "./InnerBuildingView";
import { UIHUDController } from "../../../UI/UIHUDController";
import { ItemMgr, LanMgr, UIPanelMgr, UserInfoMgr } from "../../../Utils/Global";
import ItemData from "../../../Model/ItemData";
import { ResourceCorrespondingItem } from "../../../Const/ConstDefine";
import NotificationMgr from "../../../Basic/NotificationMgr";
import { UserInnerBuildInfo } from "../../../Const/BuildingDefine";
import { UserInfoNotification } from "../../../Const/UserInfoDefine";
import InnerBuildingLvlUpConfig from "../../../Config/InnerBuildingLvlUpConfig";
import { UIName } from "../../../Const/ConstUIDefine";
import { TransformToEnergyUI } from "../../../UI/Inner/TransformToEnergyUI";

const { ccclass, property } = _decorator;

@ccclass('InnerEnergyStationBuildingView')
export class InnerEnergyStationBuildingView extends InnerBuildingView {

    public async refreshUI(building: UserInnerBuildInfo) {
        await super.refreshUI(building);

        this._countingGenerate();
    }

    private _produceInfoView: Node = null;

    protected innerBuildingLoad(): void {
        super.innerBuildingLoad();
        this._produceInfoView = this.node.getChildByName("InfoView");

        NotificationMgr.addListener(UserInfoNotification.generateEnergyTimeCountChanged, this._countingGenerate, this);
        NotificationMgr.addListener(UserInfoNotification.generateEnergyNumChanged, this._countingGenerate, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(UserInfoNotification.generateEnergyTimeCountChanged, this._countingGenerate, this);
        NotificationMgr.removeListener(UserInfoNotification.generateEnergyNumChanged, this._countingGenerate, this);
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
        if (this._building.buildLevel > 0) {
            const view = await UIPanelMgr.openPanel(UIName.TransformToEnergyUI);
            if (view != null) {
                view.getComponent(TransformToEnergyUI).refreshUI(true);
            }
        }
    }

    //------------------------------- function
    private _countingGenerate() {
        if (this._building == null) {
            return;
        }
        const generateInfoData = UserInfoMgr.generateEnergyInfo;
        if (this._building.buildLevel > 0 && generateInfoData != null) {
            const generateConfig = InnerBuildingLvlUpConfig.getEnergyLevelData(this._building.buildLevel);
            if (generateConfig != null) {
                this._produceInfoView.active = true;
                // userlanMgr
                // this._produceInfoView.getChildByName("AlreadyProduced").getComponent(Label).string = LanMgr.getLanById("201003") + ":" + generateInfoData.totalEnergyNum + "/" + generateConfig.psyc_storage;
                this._produceInfoView.getChildByName("AlreadyProduced").getComponent(Label).string = "Collectable PSYC:" + generateInfoData.totalEnergyNum + "/" + generateConfig.storage;

                if (generateInfoData.totalEnergyNum >= generateConfig.storage) {
                    this._produceInfoView.getChildByName("NextProduceTime").active = false;
                } else {
                    this._produceInfoView.getChildByName("NextProduceTime").active = true;
                    // userlanMgr
                    // this._produceInfoView.getChildByName("NextProduceTime").getComponent(Label).string = LanMgr.getLanById("201003") + ": " + generateInfoData.countTime + "s " + LanMgr.getLanById("201003") + " " + generateConfig.psyc_output + " " + LanMgr.getLanById("201003");
                    this._produceInfoView.getChildByName("NextProduceTime").getComponent(Label).string = "Next Output: " + generateInfoData.countTime + "s for " + generateConfig.output + " PSYC";
                }
            }

        } else {
            this._produceInfoView.active = false;
        }
    }

    //------------------------------- action
    private onTapGetPSYC() {
        if (this._building.upgradeTotalTime > 0) {
            UIHUDController.showCenterTip(LanMgr.getLanById("201003"));
            // UIHUDController.showCenterTip("The building is being upgraded, please wait.");
            return;
        }
        if (UserInfoMgr.generateEnergyInfo == null) {
            return;
        }
        const produceNum: number = UserInfoMgr.generateEnergyInfo.totalEnergyNum;
        if (produceNum <= 0) {
            // useLanMgr
            // UIHUDController.showCenterTip(LanMgr.getLanById("201003"));
            UIHUDController.showCenterTip("No PSYC to collect");
            return;
        }
        ItemMgr.addItem([new ItemData(ResourceCorrespondingItem.Energy, produceNum)]);
        UserInfoMgr.generateEnergyGetted();
    }
}