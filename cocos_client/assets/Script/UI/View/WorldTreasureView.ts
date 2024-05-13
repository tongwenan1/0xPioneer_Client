import { _decorator, Component, Label, Layout, Node, ProgressBar, Sprite, tween, v3 } from "cc";
import { UIName } from "../../Const/ConstUIDefine";
import UIPanelManger from "../../Basic/UIPanelMgr";
import { PointTreasureUI } from "../PointTreasureUI";
import { BoxInfoConfigData } from "../../Const/BoxInfo";
import BoxInfoConfig from "../../Config/BoxInfoConfig";
import { DataMgr } from "../../Data/DataMgr";
import { TreasureGettedUI } from "../TreasureGettedUI";
import ItemData from "../../Const/Item";
import ArtifactData from "../../Model/ArtifactData";
import { NetworkMgr } from "../../Net/NetworkMgr";
import { LanMgr } from "../../Utils/Global";
import CommonTools from "../../Tool/CommonTools";
import { GameRankColor } from "../../Const/ConstDefine";
const { ccclass, property } = _decorator;

@ccclass("WorldTreasureView")
export class WorldTreasureView extends Component {
    //----------------------------------------- data
    private _isOpenBox: boolean = true;
    private _boxDatas: BoxInfoConfigData[] = [];
    private _currentTreasureData: BoxInfoConfigData = null;

    private _todayEigthTimestamp: number = 0;
    private _nextDayEightTimestamp: number = 0;
    //----------------------------------------- view
    private _boxView: Node = null;
    private _treasureBoxView: Node = null;

    private _getTimeLabel: Label = null;
    private _countDownLabel: Label = null;
    private _treasureCanGetIcon: Node = null;

    protected onLoad(): void {
        this._boxDatas = BoxInfoConfig.getAllBox();

        this._todayEigthTimestamp = CommonTools.getDayAMTimestamp(8);
        this._nextDayEightTimestamp = CommonTools.getNextDayAMTimestamp(8);

        //----------------------------------------- view
        this._boxView = this.node.getChildByPath("BoxView");
        this._treasureBoxView = this._boxView.getChildByPath("Icon");
        tween()
            .target(this._treasureBoxView)
            .repeatForever(
                tween().sequence(
                    tween().by(0.05, { position: v3(0, 10, 0) }),
                    tween().by(0.1, { position: v3(0, -20, 0) }),
                    tween().by(0.1, { position: v3(0, 20, 0) }),
                    tween().by(0.05, { position: v3(0, -10, 0) }),
                    tween().delay(1)
                )
            )
            .start();
        this._treasureBoxView.active = false;

        this._getTimeLabel = this.node.getChildByPath("OpenButton/GetTimes").getComponent(Label);
        this._countDownLabel = this.node.getChildByPath("OpenButton/LimitCountdownTime").getComponent(Label);
        this._treasureCanGetIcon = this.node.getChildByPath("OpenButton/CanGetIcon");
        tween()
            .target(this._treasureCanGetIcon)
            .repeatForever(
                tween().sequence(
                    tween().by(0.05, { position: v3(0, 10, 0) }),
                    tween().by(0.1, { position: v3(0, -20, 0) }),
                    tween().by(0.1, { position: v3(0, 20, 0) }),
                    tween().by(0.05, { position: v3(0, -10, 0) }),
                    tween().delay(1)
                )
            )
            .start();
        this._treasureCanGetIcon.active = false;
    }

    start() {
        this._refreshUI();

        this._refreshCountDownTime();
        this.schedule(this._refreshCountDownTime, 1);
    }

    protected onDestroy(): void {}
    update(deltaTime: number) {}

    private _refreshUI() {
        const perTimeNeedProgress: number = 50;
        const progress: number = DataMgr.s.userInfo.data.exploreProgress;
        const heatValue: number = 200;

        const limitTimes: number = Math.floor(heatValue / 80);
        const canGeTimes: number = Math.min(limitTimes, Math.floor(progress / perTimeNeedProgress));
        const didGetTimes: number = DataMgr.s.userInfo.data.worldTreasureTodayDidGetTimes;
        // get times
        this._getTimeLabel.string = canGeTimes + "/" + limitTimes;
        // box open
        this._boxView.active = this._isOpenBox;
        // box can get tip
        this._treasureCanGetIcon.active = didGetTimes < canGeTimes;

        if (this._isOpenBox) {
            const currentProgress: number = progress - perTimeNeedProgress * canGeTimes;
            const totalProgress: number = perTimeNeedProgress;
            this._boxView.getChildByPath("PropgressView/Label").getComponent(Label).string = currentProgress + "/" + totalProgress;
            this._boxView.getChildByPath("PropgressView/ProgressBar").getComponent(ProgressBar).progress = Math.min(1, currentProgress / totalProgress);

            const treasureBoxView = this._boxView.getChildByPath("Icon");
            treasureBoxView.active = didGetTimes < canGeTimes;
            if (treasureBoxView.active) {
                const boxRank: number = 3;
                treasureBoxView.getComponent(Sprite).color = GameRankColor[boxRank - 1];
            }
            this._boxView.getComponent(Layout).updateLayout();
        }
    }
    private _refreshCountDownTime() {
        const currentTimeStamp = new Date().getTime();

        let endTime: number = null;
        if (currentTimeStamp < this._todayEigthTimestamp) {
            endTime = this._todayEigthTimestamp;
        } else {
            endTime = this._nextDayEightTimestamp;
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
    private onTapOpen() {
        if (this._isOpenBox) {
            return;
        }
        this._isOpenBox = true;
        this._refreshUI();
    }
    private onTapClose() {
        if (!this._isOpenBox) {
            return;
        }
        this._isOpenBox = false;
        this._refreshUI();
    }
    private async onTapProgress() {
        UIPanelManger.inst.pushPanel(UIName.WorldTreasureUI);
    }
    private async onTapTreasure() {
        if (this._currentTreasureData == null) {
            return;
        }
    }

    //---------------------------- socket notification
}
