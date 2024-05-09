import {
    _decorator,
    Node,
    instantiate,
    Label,
    Layout,
    UITransform,
    Button,
    ScrollView,
    v2,
    Color,
    Sprite,
} from "cc";
import UIPanelManger from "../Basic/UIPanelMgr";
import { DataMgr } from "../Data/DataMgr";
import ViewController from "../BasicView/ViewController";
import ItemData from "../Const/Item";
import { WorldBoxConfigData } from "../Const/WorldBoxDefine";
import WorldBoxConfig from "../Config/WorldBoxConfig";
import CommonTools from "../Tool/CommonTools";
import ConfigConfig from "../Config/ConfigConfig";
import { ConfigType, WorldBoxThresholdParam } from "../Const/Config";
import { GetPropRankColor } from "../Const/ConstDefine";
import { BackpackItem } from "./BackpackItem";
import { NetworkMgr } from "../Net/NetworkMgr";
const { ccclass, property } = _decorator;

@ccclass("WorldTreasureUI")
export class WorldTreasureUI extends ViewController {
    //----------------------------------------- data
    private _boxDatas: WorldBoxConfigData[] = [];
    private _currentBoxIndex: number = 0;
    private _canClaimBoxIndex: number = -1;
    private _boxNames: string[] = [];
    private _rankColors: Color[] = [];
    //----------------------------------------- view
    private _currentPointLabel: Label = null;

    private _progressBoxItem: Node = null;
    private _progressBoxContent: Node = null;
    private _allProgressBoxItems: Node[] = [];

    private _currentBoxTitleLabel: Label = null;
    private _currentBoxRewardItemItem: Node = null;
    private _currentBoxRewardItem: Node = null;
    private _currentBoxRewardContent: Node = null;
    private _claimButton: Button = null;
    private _claimCountDownLabel: Label = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        // useLanMgr
        this._boxNames = [
            "Rank 1 Boxes", //LanMgr.getLanById("107549"),
            "Rank 2 Boxes", //LanMgr.getLanById("107549"),
            "Rank 3 Boxes", //LanMgr.getLanById("107549"),
            "Rank 4 Boxes", //LanMgr.getLanById("107549"),
            "Rank 5 Boxes", //LanMgr.getLanById("107549"),
        ];
        this._rankColors = [
            new Color().fromHEX(GetPropRankColor.RANK1),
            new Color().fromHEX(GetPropRankColor.RANK2),
            new Color().fromHEX(GetPropRankColor.RANK3),
            new Color().fromHEX(GetPropRankColor.RANK4),
            new Color().fromHEX(GetPropRankColor.RANK5),
        ];

        this._currentPointLabel = this.node.getChildByPath("__ViewContent/LeftContent/Point").getComponent(Label);

        this._progressBoxContent = this.node.getChildByPath("__ViewContent/LeftContent/ScrollView/View/Content");
        this._progressBoxItem = this._progressBoxContent.getChildByPath("Item");
        this._progressBoxItem.removeFromParent();

        this._currentBoxTitleLabel = this.node.getChildByPath("__ViewContent/RightContent/Title").getComponent(Label);
        this._currentBoxRewardContent = this.node.getChildByPath("__ViewContent/RightContent/ScrollView/View/Content");
        this._currentBoxRewardItem = this._currentBoxRewardContent.getChildByPath("Item");
        this._currentBoxRewardItem.removeFromParent();
        this._currentBoxRewardItemItem = this._currentBoxRewardItem.getChildByPath("RewardContent/BackpackItem");
        this._currentBoxRewardItemItem.removeFromParent();
        this._claimButton = this.node.getChildByPath("__ViewContent/RightContent/ClaimButton").getComponent(Button);
        this._claimCountDownLabel = this.node.getChildByPath("__ViewContent/CountDown").getComponent(Label);

        // useLanMgr
        // this.node.getChildByPath("__ViewContent/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/LeftContent/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("__ViewContent/RightContent/ClaimButton/Label").getComponent(Label).string = LanMgr.getLanById("107549");

        NetworkMgr.websocket.on("player_heat_value_change_res", this._on_player_heat_value_change_res.bind(this));
    }
    protected viewDidStart(): void {
        super.viewDidStart();

        this._initBox();
        this._refreshUI();
    }
    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        console.log('exce notifi off');
        NetworkMgr.websocket.off("player_heat_value_change_res", this._on_player_heat_value_change_res.bind(this));
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByPath("__ViewContent");
    }

    private _initBox() {
        const currentHeatValue: number = DataMgr.s.userInfo.data.heatValue.currentHeatValue;
        this._currentPointLabel.string = "Current Points: " + currentHeatValue;
        const boxThresholds = (ConfigConfig.getConfig(ConfigType.WorldBoxThreshold) as WorldBoxThresholdParam).thresholds;
        for (let i = 0; i < 5; i++) {
            const boxView = instantiate(this._progressBoxItem);
            this._progressBoxContent.addChild(boxView);

            // title
            const title = boxView.getChildByPath("Title").getComponent(Label);
            title.string = this._boxNames[i];
            title.color = this._rankColors[i];
            // icon
            boxView.getChildByPath("Icon").getComponent(Sprite).color = this._rankColors[i];
            // tip
            let tipString: string = "";
            if (i == boxThresholds.length - 1) {
                tipString = "points >=" + boxThresholds[i];
                if (currentHeatValue >= boxThresholds[i]) {
                    this._canClaimBoxIndex = i;
                }
            } else {
                if (i + 1 < boxThresholds.length) {
                    tipString = boxThresholds[i] + "<= points <" + boxThresholds[i + 1];
                    if (currentHeatValue >= boxThresholds[i] && currentHeatValue < boxThresholds[i + 1]) {
                        this._canClaimBoxIndex = i;
                    }
                }
            }
            boxView.getChildByPath("Tip").getComponent(Label).string = tipString;
            // button
            boxView.getComponent(Button).clickEvents[0].customEventData = i.toString();

            this._allProgressBoxItems.push(boxView);
        }
        this._progressBoxContent.getComponent(Layout).updateLayout();

        if (this._canClaimBoxIndex >= 0) {
            this._currentBoxIndex = this._canClaimBoxIndex;
        }

        // next day eight hour timestamp
        this._refreshCountDownTime();
        this.schedule(() => {
            this._refreshCountDownTime();
        }, 1);
    }

    private _refreshUI(anim: boolean = false) {
        let currentHeatValue: number = DataMgr.s.userInfo.data.heatValue.currentHeatValue;
        this._currentPointLabel.string = "Current Points: " + currentHeatValue;
        const boxThresholds = (ConfigConfig.getConfig(ConfigType.WorldBoxThreshold) as WorldBoxThresholdParam).thresholds;
        for (let i = 0; i < this._allProgressBoxItems.length; i++) {
            if (i == boxThresholds.length - 1) {
                if (currentHeatValue >= boxThresholds[i]) {
                    this._canClaimBoxIndex = i;
                }
            } else {
                if (i + 1 < boxThresholds.length) {
                    if (currentHeatValue >= boxThresholds[i] && currentHeatValue < boxThresholds[i + 1]) {
                        this._canClaimBoxIndex = i;
                    }
                }
            }
        }

        for (const item of this._allProgressBoxItems) {
            item.getChildByPath("Select").active = this._currentBoxIndex == this._allProgressBoxItems.indexOf(item);
        }
        this.scheduleOnce(() => {
            this.node
                .getChildByPath("__ViewContent/LeftContent/ScrollView")
                .getComponent(ScrollView)
                .scrollToOffset(
                    v2(
                        0,
                        (this._progressBoxItem.getComponent(UITransform).height + this._progressBoxContent.getComponent(Layout).spacingY) *
                            (this._allProgressBoxItems.length - 1 - this._currentBoxIndex)
                    ),
                    anim ? 1.0 : 0
                );
        });

        // reward
        this._currentBoxTitleLabel.string = this._boxNames[this._currentBoxIndex];
        this._currentBoxTitleLabel.color = this._rankColors[this._currentBoxIndex];

        this._currentBoxRewardContent.destroyAllChildren();
        let rewardDataDay: number = CommonTools.getDayOfWeek() - 1;
        if (rewardDataDay == 0) {
            rewardDataDay = 7;
        }
        this._boxDatas = WorldBoxConfig.getByDayAndRank(rewardDataDay, this._currentBoxIndex + 1);
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
            this._claimCountDownLabel.node.active = false;
        } else {
            this._claimCountDownLabel.node.active = true;
            const gapTime: number = Math.max(0, endTime - currentTimeStamp);
            this._claimCountDownLabel.string = "Claim Countdown: " + CommonTools.formatSeconds(gapTime / 1000, "HHh MMm");
        }
        const claimButtonCanTap: boolean = this._currentBoxIndex == this._canClaimBoxIndex && canClaim;
        this._claimButton.interactable = claimButtonCanTap;
        this._claimButton.node.getComponent(Sprite).grayscale = !claimButtonCanTap;
    }
    //------------------------------------------ action
    private async onTapBoxItem(event: Event, customEventData: string) {
        const index = parseInt(customEventData);
        if (index != this._currentBoxIndex) {
            this._currentBoxIndex = index;
            this._refreshUI(true);
            this._refreshCountDownTime();
        }
    }
    private onTapClaim() {
        NetworkMgr.websocketMsg.player_world_treasure_lottery({});
    }
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }

    //----------------------------------------- notification
    private _on_player_heat_value_change_res() {
        console.log('exce notifitrigger');
        this._refreshUI();
        this._refreshCountDownTime();
    }
}
