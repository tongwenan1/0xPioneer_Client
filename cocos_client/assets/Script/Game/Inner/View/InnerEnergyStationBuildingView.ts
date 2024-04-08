import { Label, Node, _decorator, v3 } from "cc";
import { InnerBuildingView } from "./InnerBuildingView";
import { UIHUDController } from "../../../UI/UIHUDController";
import { ItemMgr, LanMgr, UserInfoMgr } from "../../../Utils/Global";
import NotificationMgr from "../../../Basic/NotificationMgr";
import { UserInnerBuildInfo } from "../../../Const/BuildingDefine";
import InnerBuildingLvlUpConfig from "../../../Config/InnerBuildingLvlUpConfig";
import { UIName } from "../../../Const/ConstUIDefine";
import { TransformToEnergyUI } from "../../../UI/Inner/TransformToEnergyUI";
import ItemData from "../../../Const/Item";
import { NotificationName } from "../../../Const/Notification";
import { ResourceCorrespondingItem } from "../../../Const/ConstDefine";
import InnerBuildingConfig from "../../../Config/InnerBuildingConfig";
import UIPanelManger from "../../../Basic/UIPanelMgr";

const { ccclass, property } = _decorator;

@ccclass('InnerEnergyStationBuildingView')
export class InnerEnergyStationBuildingView extends InnerBuildingView {

    public async refreshUI(building: UserInnerBuildInfo) {
        await super.refreshUI(building);

        this._countingGenerate();

        if (this._building.buildLevel > 0) {
            const infoViewY = InnerBuildingLvlUpConfig.getBuildingLevelData(this._building.buildLevel, "info_y_energy");
            if (infoViewY != null) {
                this._produceInfoView.position = v3(0, infoViewY, 0);
            }
        }
    }

    private _produceInfoView: Node = null;

    protected innerBuildingLoad(): void {
        super.innerBuildingLoad();
        this._produceInfoView = this.node.getChildByName("InfoView");

        NotificationMgr.addListener(NotificationName.GENERATE_ENERGY_TIME_COUNT_CHANGED, this._countingGenerate, this);
        NotificationMgr.addListener(NotificationName.GENERATE_ENERGY_NUM_CHANGED, this._countingGenerate, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.addListener(NotificationName.GENERATE_ENERGY_TIME_COUNT_CHANGED, this._countingGenerate, this);
        NotificationMgr.addListener(NotificationName.GENERATE_ENERGY_NUM_CHANGED, this._countingGenerate, this);
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
            const result = await UIPanelManger.inst.pushPanel(UIName.TransformToEnergyUI);
            if (result.success) {
                result.node.getComponent(TransformToEnergyUI).refreshUI(true);
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
                // this._produceInfoView.getChildByPath("TopContent/Title").getComponent(Label).string = LanMgr.getLanById("201003");
                // this._produceInfoView.getChildByPath("BottomContent/Title").getComponent(Label).string = LanMgr.getLanById("201003");
                // this._produceInfoView.getChildByPath("BottomContent/Gap").getComponent(Label).string = LanMgr.getLanById("201003");
                this._produceInfoView.getChildByPath("TopContent/CurrentNum").getComponent(Label).string = generateInfoData.totalEnergyNum.toString();
                this._produceInfoView.getChildByPath("TopContent/MaxNum").getComponent(Label).string = generateConfig.storage.toString();

                if (generateInfoData.totalEnergyNum >= generateConfig.storage) {
                    this._produceInfoView.getChildByPath("BottomContent").active = false;
                } else {
                    this._produceInfoView.getChildByPath("BottomContent").active = true;
                    this._produceInfoView.getChildByPath("BottomContent/CurrentTime").getComponent(Label).string = generateInfoData.countTime.toString();
                    this._produceInfoView.getChildByPath("BottomContent/PerNum").getComponent(Label).string = generateConfig.output.toString();
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