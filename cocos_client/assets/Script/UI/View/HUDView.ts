import { _decorator, Component, Label, tween, v3 } from "cc";
import ViewController from "../../BasicView/ViewController";
import UIPanelManger, { UIPanelLayerType } from "../../Basic/UIPanelMgr";

const { ccclass, property } = _decorator;

@ccclass('HUDView')
export class HUDView extends ViewController {
    public showCenterTip(tip: string, playOverCallback: ()=> void = null) {
        this._centerTip.string = tip;
        this._centerTip.node.active = true;
        tween()
        .target(this._centerTip.node)
        .to(0.2, { position: v3(0, 200, 0) })
        .delay(1.5)
        .call(() => {
            UIPanelManger.inst.popPanel(this.node, UIPanelLayerType.HUD);
            if (playOverCallback != null) {
                playOverCallback();
            }
        })
        .start();
    }

    public showTaskTip(tip: string, playOverCallback: ()=> void = null) {
        this._taskTip.string = tip;
        this._taskTip.node.active = true;
        tween()
        .target(this._taskTip.node)
        .by(0.2, { position: v3(200, 0, 0) })
        .delay(1.5)
        .call(() => {
            UIPanelManger.inst.popPanel(this.node, UIPanelLayerType.HUD);
            if (playOverCallback != null) {
                playOverCallback();
            }
        })
        .start();
    }



    private _centerTip: Label = null;
    private _taskTip: Label = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._centerTip = this.node.getChildByPath("CenterTip").getComponent(Label);
        this._taskTip = this.node.getChildByPath("TaskTip").getComponent(Label);

        this._centerTip.node.active = false;
        this._taskTip.node.active = false;
    }
}