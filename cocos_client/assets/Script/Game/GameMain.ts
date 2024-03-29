import { _decorator, Component, Node, Camera, EventHandler, Vec3, tween, inverseLerp, find } from 'cc';
import NotificationMgr from '../Basic/NotificationMgr';
import ViewController from '../BasicView/ViewController';
import { NotificationName } from '../Const/Notification';
import GameMainHelper from './Helper/GameMainHelper';
import { ECursorType } from '../Const/ConstDefine';

const { ccclass, property } = _decorator;

@ccclass('GameMain')
export class GameMain extends ViewController {

    protected viewDidLoad(): void {
        super.viewDidLoad();
        GameMainHelper.instance.setGameCamera(find("Main/Canvas/GameCamera").getComponent(Camera));
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        this._refreshUI();
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();

        NotificationMgr.addListener(NotificationName.GAME_INNER_AND_OUTER_CHANGED, this._refreshUI, this);
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();

        NotificationMgr.removeListener(NotificationName.GAME_INNER_AND_OUTER_CHANGED, this._refreshUI, this);
    }

    //--------------------------------------- function
    private _refreshUI() {
        const outerView = this.node.getChildByPath("OutScene");
        const innerView = this.node.getChildByPath("InnerScene");
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
    }
}


