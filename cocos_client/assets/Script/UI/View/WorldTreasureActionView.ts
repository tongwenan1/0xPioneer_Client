import { _decorator, Component, Label, Layout, Node, ProgressBar, tween, v3 } from "cc";
import CommonTools from "../../Tool/CommonTools";
import UIPanelManger from "../../Basic/UIPanelMgr";
import { UIName } from "../../Const/ConstUIDefine";
const { ccclass, property } = _decorator;

@ccclass("WorldTreasureActionView")
export class WorldTreasureActionView extends Component {
    //----------------------------------------- data

    //----------------------------------------- view
    private _heatValue: Label = null;
    private _countDownLabel: Label = null;

    protected onLoad(): void {
        this._heatValue = this.node.getChildByPath("ActionButton/PointContent/Value").getComponent(Label);
        this._countDownLabel = this.node.getChildByPath("CountDown").getComponent(Label);
    }

    start() {
        // next day eight hour timestamp
        const countEndTimeStamp: number = CommonTools.getNextDayAMTimestamp(8);
        this._refreshCountDownTime(countEndTimeStamp);
        this.schedule(() => {
            this._refreshCountDownTime(countEndTimeStamp);
        }, 1);
    }

    protected onDestroy(): void {}
    update(deltaTime: number) {}

    private _refreshCountDownTime(endTime: number) {
        const currentTimeStamp = new Date().getTime();

        const gapTime: number = Math.max(0, endTime - currentTimeStamp);
        this._countDownLabel.string = CommonTools.formatSeconds(gapTime / 1000, "HHh MMm");
    }
    //----------------------------------------------
    private onTapAction() {
        UIPanelManger.inst.pushPanel(UIName.WorldTreasureUI);
    }
}
