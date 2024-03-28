import { _decorator, Component, Node } from 'cc';
import { ItemMgr, UIPanelMgr, UserInfoMgr } from '../Utils/Global';
import { UIName } from '../Const/ConstUIDefine';
import { HUDView } from './View/HUDView';
import ViewController from '../BasicView/ViewController';
import NotificationMgr from '../Basic/NotificationMgr';
import { EventName, ResourceCorrespondingItem } from '../Const/ConstDefine';
import ItemData from '../Model/ItemData';
import { ResourceGettedView } from './View/ResourceGettedView';
import { InnerBuildingType, UserInnerBuildInfo } from '../Const/BuildingDefine';
const { ccclass, property } = _decorator;

@ccclass('UIHUDController')
export class UIHUDController extends ViewController {
    // public static instance() {
    //     return this._instance;
    // }
    public static async showCenterTip(tip: string) {
        const hud = await UIPanelMgr.openHUDPanel(UIName.HUDView);
        if (hud != null) {
            hud.getComponent(HUDView).showCenterTip(tip, () => {
                UIPanelMgr.closeHUDPanel(hud);
            });
        }
    }

    public static async showTaskTip(tip: string) {
        const hud = await UIPanelMgr.openHUDPanel(UIName.HUDView);
        if (hud != null) {
            hud.getComponent(HUDView).showTaskTip(tip, () => {
                UIPanelMgr.closeHUDPanel(hud);
            });
        }
    }

    // private static _instance: UIHUDController;
    private _resourceGettedView: ResourceGettedView = null;

    private _resoucesShowItems: (ItemData | UserInnerBuildInfo)[] = [];
    protected async viewDidLoad(): Promise<void> {
        super.viewDidLoad();
        UIPanelMgr.setHUDRootView(this.node);

        this._resourceGettedView = (await UIPanelMgr.openHUDPanel(UIName.ResourceGettedView)).getComponent(ResourceGettedView);

        NotificationMgr.addListener(EventName.RESOURCE_GETTED, this._resourceGetted, this);
        NotificationMgr.addListener(EventName.INNER_BUILDING_UPGRADE_FINISHED, this._innerBuildingUpgradeFinished, this);

        this._showResouceGettedView();
    }

    protected viewDidStart(): void {
    
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(EventName.RESOURCE_GETTED, this._resourceGetted, this);
        NotificationMgr.removeListener(EventName.INNER_BUILDING_UPGRADE_FINISHED, this._innerBuildingUpgradeFinished, this);
    }

    private _showResouceGettedView() {
        if (this._resourceGettedView != null && this._resoucesShowItems.length > 0) {
            this._resourceGettedView.showTip(this._resoucesShowItems);
            this._resoucesShowItems = [];
        }
    }
    //---------------------------------- notifiaction
    private async _resourceGetted(item: ItemData) {
        this._resoucesShowItems.push(item);
        this._showResouceGettedView();
    }

    private _innerBuildingUpgradeFinished(buildingType: InnerBuildingType) {
        if (UserInfoMgr.innerBuilds.has(buildingType)) {
            this._resoucesShowItems.push(UserInfoMgr.innerBuilds.get(buildingType));
            this._showResouceGettedView();
        }
    }
}


