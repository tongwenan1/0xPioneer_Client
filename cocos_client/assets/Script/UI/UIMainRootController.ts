import { CCBoolean, Component, _decorator } from "cc";
import { UIPanelMgr, UserInfoMgr } from "../Utils/Global";
import { UIName } from "../Const/ConstUIDefine";
import ViewController from "../BasicView/ViewController";

const { ccclass, property } = _decorator;


@ccclass('UIMainRootController')
export class UIMainRootController extends ViewController {
    @property(CCBoolean)
    private canShowRookieGuide: boolean = true;

    protected async viewDidLoad(): Promise<void> {
        super.viewDidLoad();

        UIPanelMgr.setRootView(this.node);
        if (this.canShowRookieGuide && !UserInfoMgr.isFinishRookie) {
            await UIPanelMgr.openPanel(UIName.RookieGuide);
        }
    }
    
    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();
    }
}