import { _decorator, Component, Label, Layout, Node, ProgressBar, tween, v3 } from "cc";
import CommonTools from "../../Tool/CommonTools";
import UIPanelManger from "../../Basic/UIPanelMgr";
import { UIName } from "../../Const/ConstUIDefine";
import { NetworkMgr } from "../../Net/NetworkMgr";
import { DataMgr } from "../../Data/DataMgr";
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
        NetworkMgr.websocket.on("player_heat_value_change_res", this._on_player_heat_value_change_res.bind(this));
    }

    start() {
        this._heatValue.string = "P:" + DataMgr.s.userInfo.data.heatValue.currentHeatValue;
        this._refreshCountDownTime();
        this.schedule(() => {
            this._refreshCountDownTime();
        }, 1);
    }

    protected onDestroy(): void {}
    update(deltaTime: number) {}

    private _refreshCountDownTime() {
        const currentTimeStamp = new Date().getTime();
        const eightTimeStamp = CommonTools.getDayAMTimestamp(8);
        const getTimeStamp = DataMgr.s.userInfo.data.heatValue.getTimestamp * 1000;

        let endTime: number = null;
        let canClaim: boolean = false;
        if (currentTimeStamp < eightTimeStamp) {
            endTime = eightTimeStamp;
        } else {
            const todayDidGet: boolean = getTimeStamp >= eightTimeStamp;
            canClaim = !todayDidGet;
            if (todayDidGet) {
                endTime = CommonTools.getNextDayAMTimestamp(8);
            }
        }
        if (endTime == null) {
            this._countDownLabel.node.active = false;
        } else {
            this._countDownLabel.node.active = true;
            const gapTime: number = Math.max(0, endTime - currentTimeStamp);
            this._countDownLabel.string = CommonTools.formatSeconds(gapTime / 1000, "HHh MMm");
        }
    }
    //----------------------------------------------
    private onTapAction() {
        UIPanelManger.inst.pushPanel(UIName.WorldTreasureUI);
    }

    //---------------------------------------------- notification
    private _on_player_heat_value_change_res(e: any) {
        this._heatValue.string = "P:" + DataMgr.s.userInfo.data.heatValue.currentHeatValue;
    }
}
