import { _decorator, Component, Tween, tween, UITransform, v3 } from 'cc';
import { BaseUI } from './BaseUI';
const { ccclass, property } = _decorator;

@ccclass('PopUpUI')
export class PopUpUI extends BaseUI {

    private static _sPopUpUIs = {};
    private static addShowingPopUpUI(ui: PopUpUI) {
        PopUpUI._sPopUpUIs[ui.uniqueUIID] = ui;
    }
    private static removeShowingPopUpUI(ui: PopUpUI) {
        delete PopUpUI._sPopUpUIs[ui.uniqueUIID];
    }

    public static hideAllShowingPopUpUI() {
        for (let uiid in PopUpUI._sPopUpUIs) {
            let ui: PopUpUI = PopUpUI._sPopUpUIs[uiid];
            if (ui.typeName == "TaskListUI") {
                // donnot hide white list
            } else {
                ui.node.active = false;
            }
        }

        PopUpUI._sPopUpUIs = {};
    }

    public override get typeName() {
        return "PopUpUI";
    }

    public show(bShow: boolean, animation: boolean = false) {
        let animView = null;
        if (animation) {
            animView = this.node.getChildByName("__ViewContent");
        }
        if (bShow) {
            this.node.active = true;
            if (animView != null) {
                animView.scale = v3(0, 0, 0);
                tween()
                    .target(animView)
                    .to(0.5, { scale: v3(1.0, 1.0, 1.0) }, { easing: "elasticOut" })
                    .call(() => {
                        PopUpUI.addShowingPopUpUI(this);
                    })
                    .start();
            } else {
                PopUpUI.addShowingPopUpUI(this);
            }

        } else {
            if (animView != null) {
                animView.scale = v3(1.0, 1.0, 1.0);
                tween()
                    .target(animView)
                    .to(0.5, { scale: v3(0, 0, 0) }, { easing: "bounceIn" })
                    .call(() => {
                        this.node.active = false;
                        PopUpUI.removeShowingPopUpUI(this);
                    })
                    .start();
            } else {
                this.node.active = false;
                PopUpUI.removeShowingPopUpUI(this);
            }
        }
    }

    onLoad() {
        super.onLoad();
        this.node.active = false;
    }

    onDestroy() {
        if (this.node.active) {
            PopUpUI.removeShowingPopUpUI(this);
        }
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


