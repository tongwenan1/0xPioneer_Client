import { _decorator, Button, Component, Label, Layout, Node, ProgressBar, Sprite, tween, v3 } from "cc";
import { UIName } from "../../Const/ConstUIDefine";
import UIPanelManger from "../../Basic/UIPanelMgr";
import { BoxInfoConfigData } from "../../Const/BoxInfo";
import BoxInfoConfig from "../../Config/BoxInfoConfig";
import { DataMgr } from "../../Data/DataMgr";
import CommonTools from "../../Tool/CommonTools";
import { GameRankColor } from "../../Const/ConstDefine";
import ConfigConfig from "../../Config/ConfigConfig";
import { ConfigType, WorldTreasureChanceLimitHeatValueCoefficientParam, WorldTreasureChancePerBoxExploreProgressParam } from "../../Const/Config";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import { NetworkMgr } from "../../Net/NetworkMgr";
const { ccclass, property } = _decorator;

@ccclass("ReWorldTreasureView")
export class ReWorldTreasureView extends Component {
    //----------------------------------------- view
    private _getTimeLabel: Label = null;
    private _treasureCanGetIcon: Node = null;

    protected onLoad(): void {
        //----------------------------------------- view
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
        NotificationMgr.addListener(NotificationName.USERINFO_DID_CHANGE_TREASURE_PROGRESS, this._refreshUI, this);
        NotificationMgr.addListener(NotificationName.USERINFO_DID_CHANGE_HEAT, this._refreshUI, this);
    }

    protected onDestroy(): void {
        NotificationMgr.removeListener(NotificationName.USERINFO_DID_CHANGE_TREASURE_PROGRESS, this._refreshUI, this);
        NotificationMgr.removeListener(NotificationName.USERINFO_DID_CHANGE_HEAT, this._refreshUI, this);
    }
    update(deltaTime: number) {}

    private _refreshUI() {
        const perTimeNeedProgress: number = (
            ConfigConfig.getConfig(ConfigType.WorldTreasureChancePerBoxExploreProgress) as WorldTreasureChancePerBoxExploreProgressParam
        ).progress;

        const progress: number = DataMgr.s.userInfo.data.exploreProgress;
        const canGeTimes: number = DataMgr.s.userInfo.data.heatValue.lotteryProcessLimit;
        const didGetTimes: number = DataMgr.s.userInfo.data.heatValue.lotteryTimes;
        const canGetBox: boolean = didGetTimes < canGeTimes;
        // box can get tip
        this._treasureCanGetIcon.active = canGetBox;

        const currentProgress: number = progress - perTimeNeedProgress * canGeTimes;
        const totalProgress: number = perTimeNeedProgress;
        this.node.getChildByPath("OpenButton/Bg/Value").getComponent(Label).string = Math.floor(currentProgress / totalProgress) * 100 + "%";
        this.node.getChildByPath("OpenButton/Bg/ProgressBar").getComponent(ProgressBar).progress = Math.min(1, currentProgress / totalProgress);
    }
    //----------------------------------------------
    private async onTapProgress() {
        UIPanelManger.inst.pushPanel(UIName.WorldTreasureUIRe);
    }
}
