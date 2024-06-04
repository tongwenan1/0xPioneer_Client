import { _decorator, Component, Node, Camera, EventHandler, Vec3, tween, inverseLerp, find } from "cc";
import NotificationMgr from "../Basic/NotificationMgr";
import ViewController from "../BasicView/ViewController";
import { NotificationName } from "../Const/Notification";
import GameMainHelper from "./Helper/GameMainHelper";
import { ECursorType } from "../Const/ConstDefine";
import { GameMgr } from "../Utils/Global";
import UIPanelManger, { UIPanelLayerType } from "../Basic/UIPanelMgr";
import { HUDName } from "../Const/ConstUIDefine";
import { LoadingUI } from "../UI/Loading/LoadingUI";

const { ccclass, property } = _decorator;

@ccclass("GameMain")
export class GameMain extends ViewController {
    protected viewDidLoad(): void {
        super.viewDidLoad();
        GameMainHelper.instance.setGameCamera(find("Main/Canvas/GameCamera").getComponent(Camera));
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        this._refreshUI(false);

        GameMgr.enterGameSence = true;
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();

        NotificationMgr.addListener(NotificationName.GAME_INNER_AND_OUTER_CHANGED, this._onGameInnerOuterChange, this);
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();

        NotificationMgr.removeListener(NotificationName.GAME_INNER_AND_OUTER_CHANGED, this._onGameInnerOuterChange, this);
    }

    //--------------------------------------- function
    private async _refreshUI(loadingAnim: boolean = true) {
        const outerView = this.node.getChildByPath("OutScene");
        // const innerView = this.node.getChildByPath("InnerScene");
        const innerView = this.node.getChildByPath("InnerSceneRe");
        const isOuterShow: boolean = GameMainHelper.instance.isGameShowOuter;
        // inner and outer need hide first, then show
        if (isOuterShow) {
            innerView.active = false;
            outerView.active = true;
        } else {
            outerView.active = false;
            innerView.active = true;

            GameMainHelper.instance.changeCursor(ECursorType.Common);
        }
        if (loadingAnim) {
            const result = await UIPanelManger.inst.pushPanel(HUDName.Loading, UIPanelLayerType.HUD);
            if (!result.success) {
                return;
            }
            let progress: number = 0;
            this.schedule(() => {
                progress += 0.14;
                result.node.getComponent(LoadingUI).showLoadingProgress(progress);
                if (progress >= 1) {
                    this.scheduleOnce(() => {
                        this.unscheduleAllCallbacks();
                        UIPanelManger.inst.popPanel(result.node, UIPanelLayerType.HUD);
                    }, 0.2);
                }
            }, 0.2);
        }
    }

    //--------------------------------------- notitfication
    private _onGameInnerOuterChange() {
        this._refreshUI();
    }
}
