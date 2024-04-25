import { _decorator, Component, Node } from 'cc';
import { LanMgr } from '../Utils/Global';
import { HUDName, UIName } from '../Const/ConstUIDefine';
import { HUDView } from './View/HUDView';
import ViewController from '../BasicView/ViewController';
import NotificationMgr from '../Basic/NotificationMgr';
import ItemData from '../Model/ItemData';
import { ResourceGettedView } from './View/ResourceGettedView';
import { InnerBuildingType, UserInnerBuildInfo } from '../Const/BuildingDefine';
import { NotificationName } from '../Const/Notification';
import UIPanelManger, { UIPanelLayerType } from '../Basic/UIPanelMgr';
import { DataMgr } from '../Data/DataMgr';
const { ccclass, property } = _decorator;

@ccclass('UIHUDController')
export class UIHUDController extends ViewController {
   
    public static async showCenterTip(tip: string) {
        const result = await UIPanelManger.inst.pushPanel(HUDName.CommonTip, UIPanelLayerType.HUD);
        if (result.success) {
            result.node.getComponent(HUDView).showCenterTip(tip);
        }
    }

    public static async showTaskTip(tip: string) {
        const result = await UIPanelManger.inst.pushPanel(HUDName.CommonTip, UIPanelLayerType.HUD);
        if (result.success) {
            result.node.getComponent(HUDView).showTaskTip(tip);
        }
    }

    private _resourceGettedView: ResourceGettedView = null;

    private _resoucesShowItems: (ItemData | UserInnerBuildInfo)[] = [];
    protected async viewDidLoad(): Promise<void> {
        super.viewDidLoad();

        const result = await UIPanelManger.inst.pushPanel(HUDName.ResourceGetted, UIPanelLayerType.HUD);
        if (result.success) {
            this._resourceGettedView = result.node.getComponent(ResourceGettedView);
        }

        NotificationMgr.addListener(NotificationName.RESOURCE_GETTED, this._resourceGetted, this);
        NotificationMgr.addListener(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, this._innerBuildingUpgradeFinished, this);
        NotificationMgr.addListener(NotificationName.TASK_NEW_GETTED, this._onGetNewTask, this);

        this._showResouceGettedView();
    }

    protected viewDidStart(): void {

    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.RESOURCE_GETTED, this._resourceGetted, this);
        NotificationMgr.removeListener(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, this._innerBuildingUpgradeFinished, this);
        NotificationMgr.removeListener(NotificationName.TASK_NEW_GETTED, this._onGetNewTask, this);

    }

    private _showResouceGettedView() {
        if (this._resourceGettedView != null && this._resoucesShowItems.length > 0) {
            this._resourceGettedView.showTip(this._resoucesShowItems);
            this._resoucesShowItems = [];
        }
    }
    //---------------------------------- notifiaction
    private async _resourceGetted(data: {item: ItemData, needSettlement: boolean}) {
        this._resoucesShowItems.push(data.item);
        this._showResouceGettedView();
    }

    private _innerBuildingUpgradeFinished(buildingType: InnerBuildingType) {
        if (buildingType in DataMgr.s.userInfo.data.innerBuildings) {
            this._resoucesShowItems.push(DataMgr.s.userInfo.data.innerBuildings[buildingType]);
            this._showResouceGettedView();
        }
    }

    private _onGetNewTask() {
        UIHUDController.showTaskTip(LanMgr.getLanById("202004"));
    }
}


