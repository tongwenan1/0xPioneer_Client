import { Label, Node, _decorator } from "cc";
import { InnerBuildingView } from "./InnerBuildingView";
import { UIHUDController } from "../../../UI/UIHUDController";
import { ItemMgr, UserInfoMgr } from "../../../Utils/Global";
import ItemData from "../../../Model/ItemData";
import { ResourceCorrespondingItem } from "../../../Const/ConstDefine";
import NotificationMgr from "../../../Basic/NotificationMgr";
import { UserInnerBuildInfo } from "../../../Const/BuildingDefine";
import { UserInfoNotification } from "../../../Const/UserInfoDefine";

const { ccclass, property } = _decorator;

@ccclass('InnerEnergyStationBuildingView')
export class InnerEnergyStationBuildingView extends InnerBuildingView {

    public refreshUI(building: UserInnerBuildInfo) {
        super.refreshUI(building);

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


    protected innerBuildingTaped(): void { 
        super.innerBuildingTaped();

        const produceNum: number = UserInfoMgr.generateEnergyInfo.totalEnergyNum;
        if (produceNum <= 0) {
            UIHUDController.showCenterTip("No PSYC to collect");
            return;
        }
        ItemMgr.addItem([new ItemData(ResourceCorrespondingItem.Energy, produceNum)]);
        UserInfoMgr.generateEnergyGetted();
    }

    //------------------------------- action
    private _countingGenerate() {
        if (this._building == null) {
            return;
        }
        if (this._building.buildLevel > 0) {
            this._produceInfoView.active = true;
            this._produceInfoView.getChildByName("AlreadyProduced").getComponent(Label).string = "Collectable PSYC:" + UserInfoMgr.generateEnergyInfo.totalEnergyNum + "/" + 999;
            this._produceInfoView.getChildByName("NextProduceTime").getComponent(Label).string = "Next Output: " + UserInfoMgr.generateEnergyInfo.countTime + "s for " + 20 + "PSYC";
            
        } else {
            this._produceInfoView.active = false;
        }
    }
}