import { _decorator, Component, Node } from 'cc';
import { UIPanelMgr } from '../Utils/Global';
import { UIName } from '../Const/ConstUIDefine';
import { HUDView } from './View/HUDView';
const { ccclass, property } = _decorator;

@ccclass('UIHUDController')
export class UIHUDController extends Component {
    // public static instance() {
    //     return this._instance;
    // }
    public static async showCenterTip(tip: string) {
        const hud = await UIPanelMgr.openHUDPanel(UIName.HUDView);
        if (hud != null) {
            hud.getComponent(HUDView).showCenterTip(tip, ()=> {
                UIPanelMgr.closeHUDPanel(hud);
            });
        }
    }

    public static async showTaskTip(tip: string) {
        const hud = await UIPanelMgr.openHUDPanel(UIName.HUDView);
        if (hud != null) {
            hud.getComponent(HUDView).showTaskTip(tip, ()=> {
                UIPanelMgr.closeHUDPanel(hud);
            });
        }
    }

    // private static _instance: UIHUDController;

    protected onLoad(): void {
        UIPanelMgr.setHUDRootView(this.node);
        // UIHUDController._instance = this;
    }
    start() {

    }

    update(deltaTime: number) {
        
    }
}


