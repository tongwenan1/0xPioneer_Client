import { _decorator, Node, instantiate, Label, Layout, UITransform, Button, ScrollView, v2, Color, Sprite, ProgressBar } from "cc";
import UIPanelManger from "../Basic/UIPanelMgr";
import { DataMgr } from "../Data/DataMgr";
import ViewController from "../BasicView/ViewController";
import ItemData from "../Const/Item";
import { WorldBoxConfigData } from "../Const/WorldBoxDefine";
import WorldBoxConfig from "../Config/WorldBoxConfig";
import CommonTools from "../Tool/CommonTools";
import ConfigConfig from "../Config/ConfigConfig";
import { ConfigType, WorldBoxThresholdParam } from "../Const/Config";
import { GameRankColor, GetPropRankColor } from "../Const/ConstDefine";
import { BackpackItem } from "./BackpackItem";
import { NetworkMgr } from "../Net/NetworkMgr";
const { ccclass, property } = _decorator;

@ccclass("WorldTreasureUI")
export class WorldTreasureUI extends ViewController {
    //----------------------------------------- data
    private _boxDatas: WorldBoxConfigData[] = [];
    private _boxRank: number = 0;
    private _canClaimBoxIndex: number = -1;
    private _boxNames: string[] = [];
    private _todayEightTimestamp: number = 0;
    private _nextDayEightTimestamp: number = 0;
    //----------------------------------------- view
    private _currentBoxTitleLabel: Label = null;
    private _currentBoxRewardItemItem: Node = null;
    private _currentBoxRewardItem: Node = null;
    private _currentBoxRewardContent: Node = null;

    private _claimButton: Button = null;
    private _claimCountDownLabel: Label = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._boxRank = 3;
        // useLanMgr
        this._boxNames = [
            "Rank 1 Boxes", //LanMgr.getLanById("107549"),
            "Rank 2 Boxes", //LanMgr.getLanById("107549"),
            "Rank 3 Boxes", //LanMgr.getLanById("107549"),
            "Rank 4 Boxes", //LanMgr.getLanById("107549"),
            "Rank 5 Boxes", //LanMgr.getLanById("107549"),
        ];
        this._todayEightTimestamp = CommonTools.getDayAMTimestamp(8);
        this._nextDayEightTimestamp = CommonTools.getNextDayAMTimestamp(8);

        this._currentBoxTitleLabel = this.node.getChildByPath("__ViewContent/RightContent/Title").getComponent(Label);
        this._currentBoxRewardContent = this.node.getChildByPath("__ViewContent/RightContent/ScrollView/View/Content");
        this._currentBoxRewardItem = this._currentBoxRewardContent.getChildByPath("Item");
        this._currentBoxRewardItem.removeFromParent();
        this._currentBoxRewardItemItem = this._currentBoxRewardItem.getChildByPath("RewardContent/BackpackItem");
        this._currentBoxRewardItemItem.removeFromParent();

        this._claimButton = this.node.getChildByPath("__ViewContent/LeftContent/TimeProgressView/ClaimButton").getComponent(Button);
        this._claimCountDownLabel = this.node.getChildByPath("__ViewContent/CountDown").getComponent(Label);

        // useLanMgr
        // this.node.getChildByPath("__ViewContent/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/LeftContent/CurrentBoxView/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/RightContent/ClaimButton/Label").getComponent(Label).string = LanMgr.getLanById("107549");
    }
    protected viewDidStart(): void {
        super.viewDidStart();

        this._refreshUI();
        // next day eight hour timestamp
        this._refreshCountDownTime();
        this.schedule(this._refreshCountDownTime, 1);
    }
    protected viewDidDestroy(): void {
        super.viewDidDestroy();
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByPath("__ViewContent");
    }

    private _refreshUI() {
        const currentIndex: number = Math.max(0, Math.min(this._boxRank - 1, 4));

        const leftView = this.node.getChildByPath("__ViewContent/LeftContent");
        //------------------- current box
        const boxView = leftView.getChildByPath("CurrentBoxView/Item");
        // title
        const title = boxView.getChildByPath("Title").getComponent(Label);
        title.string = this._boxNames[currentIndex];
        title.color = GameRankColor[currentIndex];
        // icon
        boxView.getChildByPath("Icon").getComponent(Sprite).color = GameRankColor[currentIndex];

        //------------------- max chance
        const perTimeNeedProgress: number = 50;
        const progress: number = DataMgr.s.userInfo.data.exploreProgress;
        const heatValue: number = 200;
        const limitTimes: number = Math.floor(heatValue / 80);
        const canGeTimes: number = Math.min(limitTimes, Math.floor(progress / perTimeNeedProgress));
        const didGetTimes: number = DataMgr.s.userInfo.data.worldTreasureTodayDidGetTimes;

        leftView.getChildByPath("TimeView/MaxTimes").getComponent(Label).string = "Max Claim Chance: " + limitTimes;
        leftView.getChildByPath("TimeView/PSYCProgress").getComponent(Label).string = "999/1000";

        const currentProgress: number = progress - perTimeNeedProgress * canGeTimes;
        const totalProgress: number = perTimeNeedProgress;

        leftView.getChildByPath("TimeProgressView/Times").getComponent(Label).string = "Claim Chance Obtained: " + Math.max(0, canGeTimes - didGetTimes);
        leftView.getChildByPath("TimeProgressView/ProgressBar").getComponent(ProgressBar).progress = Math.min(1, currentProgress / totalProgress);
        leftView.getChildByPath("TimeProgressView/ProgressBar/Label").getComponent(Label).string = currentProgress + "/" + totalProgress;

        this._claimButton.getComponent(Button).interactable = canGeTimes < didGetTimes;
        this._claimButton.getComponent(Sprite).grayscale = !(canGeTimes < didGetTimes);

        //------------------- reward
        this._currentBoxTitleLabel.string = this._boxNames[currentIndex];
        this._currentBoxTitleLabel.color = GameRankColor[currentIndex];

        this._currentBoxRewardContent.destroyAllChildren();
        let rewardDataDay: number = CommonTools.getDayOfWeek() - 1;
        if (rewardDataDay == 0) {
            rewardDataDay = 7;
        }
        this._boxDatas = WorldBoxConfig.getByDayAndRank(rewardDataDay, this._boxRank);
        const rewardItemMap: Map<number, Node> = new Map();
        for (const data of this._boxDatas) {
            let itemView = null;
            if (!rewardItemMap.has(data.level)) {
                itemView = instantiate(this._currentBoxRewardItem);
                itemView.setParent(this._currentBoxRewardContent);
                itemView.getChildByPath("Title").getComponent(Label).string = "Rewards Rank " + data.level;
                rewardItemMap.set(data.level, itemView);
            } else {
                itemView = rewardItemMap.get(data.level);
            }
            for (const itemData of data.reward) {
                const rewardItemItem = instantiate(this._currentBoxRewardItemItem);
                itemView.getChildByPath("RewardContent").addChild(rewardItemItem);
                rewardItemItem.getComponent(BackpackItem).refreshUI(new ItemData(itemData[0], itemData[1]));
                rewardItemItem.getChildByPath("Num").getComponent(Label).string = "x" + itemData[1];
            }
        }
    }

    private _refreshCountDownTime() {
        const currentTimeStamp = new Date().getTime();
        let endTime: number = null;
        if (currentTimeStamp < this._todayEightTimestamp) {
            endTime = this._todayEightTimestamp;
        } else {
            endTime = this._nextDayEightTimestamp;
        }
        if (endTime == null) {
            this._claimCountDownLabel.node.active = false;
        } else {
            this._claimCountDownLabel.node.active = true;
            const gapTime: number = Math.max(0, endTime - currentTimeStamp);
            this._claimCountDownLabel.string = "Claim Countdown: " + CommonTools.formatSeconds(gapTime / 1000, "HHh MMm");
        }
    }
    //------------------------------------------ action
    private onTapClaim() {
        NetworkMgr.websocketMsg.player_world_treasure_lottery({});
    }
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }

    //----------------------------------------- notification
}
