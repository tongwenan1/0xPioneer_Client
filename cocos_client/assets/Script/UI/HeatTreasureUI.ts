import { _decorator, Component, Node, instantiate, director, BoxCharacterController, Label, Layout, UITransform, ProgressBar, Button, tween, v3 } from "cc";
import { LanMgr } from "../Utils/Global";
import { UIName } from "../Const/ConstUIDefine";
import { UIHUDController } from "./UIHUDController";
import BoxInfoConfig from "../Config/BoxInfoConfig";
import { BoxInfoConfigData } from "../Const/BoxInfo";
import UIPanelManger from "../Basic/UIPanelMgr";
import { DataMgr } from "../Data/DataMgr";
import ConfigConfig from "../Config/ConfigConfig";
import { ConfigType, ExploreForOneBoxParam, PiotToHeatCoefficientParam, WorldBoxThresholdParam } from "../Const/Config";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import GameMusicPlayMgr from "../Manger/GameMusicPlayMgr";
import { RookieStep } from "../Const/RookieDefine";
import { RookieStepMaskUI } from "./RookieGuide/RookieStepMaskUI";
import { NetworkMgr } from "../Net/NetworkMgr";
import { ResourceCorrespondingItem } from "../Const/ConstDefine";
import ItemData from "../Const/Item";
import TalkConfig from "../Config/TalkConfig";
import { DialogueUI } from "./Outer/DialogueUI";
const { ccclass, property } = _decorator;

@ccclass("HeatTreasureUI")
export class HeatTreasureUI extends Component {
    private _boxDatas: BoxInfoConfigData[] = [];

    private _boxContent: Node = null;
    private _boxItem: Node = null;

    protected onLoad(): void {
        this._boxContent = this.node.getChildByPath("__ViewContent/Content/ProgressBar/BoxContent");
        this._boxItem = this._boxContent.getChildByPath("Treasure");
        this._boxItem.removeFromParent();

        NotificationMgr.addListener(NotificationName.USERINFO_DID_CHANGE_TREASURE_PROGRESS, this._refreshUI, this);
        NotificationMgr.addListener(NotificationName.USERINFO_DID_CHANGE_HEAT, this._refreshUI, this);
        NotificationMgr.addListener(NotificationName.USERINFO_ROOKE_STEP_CHANGE, this._refreshUI, this);

        NotificationMgr.addListener(NotificationName.ROOKIE_GUIDE_TAP_HEAT_CONVERT, this._onRookieConvertHeat, this);
        NotificationMgr.addListener(NotificationName.ROOKIE_GUIDE_TAP_HEAT_BOX, this._onRookieTapBox, this);
    }
    protected start(): void {
        this._refreshUI();
    }

    protected onDestroy(): void {
        NotificationMgr.removeListener(NotificationName.USERINFO_DID_CHANGE_TREASURE_PROGRESS, this._refreshUI, this);
        NotificationMgr.removeListener(NotificationName.USERINFO_DID_CHANGE_HEAT, this._refreshUI, this);
        NotificationMgr.removeListener(NotificationName.USERINFO_ROOKE_STEP_CHANGE, this._refreshUI, this);

        NotificationMgr.removeListener(NotificationName.ROOKIE_GUIDE_TAP_HEAT_CONVERT, this._onRookieConvertHeat, this);
        NotificationMgr.removeListener(NotificationName.ROOKIE_GUIDE_TAP_HEAT_BOX, this._onRookieTapBox, this);
    }

    update(deltaTime: number) {}

    private _refreshUI() {
        const rookieStep: RookieStep = DataMgr.s.userInfo.data.rookieStep;

        const treasureProgressView = this.node.getChildByPath("__ViewContent/Content/ProgressBar");
        const detailButton = this.node.getChildByPath("__ViewContent/Content/DetailButton");
        const questionButton = this.node.getChildByPath("__ViewContent/Content/QuestionButton");

        treasureProgressView.active = false;
        detailButton.active = false;
        questionButton.active = false;

        if (rookieStep >= RookieStep.NPC_TALK_4) {
            treasureProgressView.active = true;
            detailButton.active = true;
            questionButton.active = true;
        }
        //------------------------------------------ heat
        const heatValue: number = DataMgr.s.userInfo.data.heatValue.currentHeatValue;
        const worldBoxThreshold: number[] = (ConfigConfig.getConfig(ConfigType.WorldBoxThreshold) as WorldBoxThresholdParam).thresholds;
        const beginPointerValue: number = 113;
        const endPointerValue: number = -113;
        const maxHeatThreshold: number = worldBoxThreshold[worldBoxThreshold.length - 1];

        const pointerView = this.node.getChildByPath("__ViewContent/Content/HeatProgress/Pointer");
        const fullLabel = this.node.getChildByPath("__ViewContent/Content/HeatProgress/Full");
        const heatValueView = this.node.getChildByPath("__ViewContent/Content/HeatProgress/HeatValue");

        pointerView.angle = beginPointerValue + (endPointerValue - beginPointerValue) * Math.min(1, heatValue / maxHeatThreshold);
        if (heatValue >= worldBoxThreshold[worldBoxThreshold.length - 1]) {
            fullLabel.active = true;
            heatValueView.active = false;
        } else {
            fullLabel.active = false;
            heatValueView.active = true;
            heatValueView.getChildByPath("Value").getComponent(Label).string = heatValue.toString();
        }

        //------------------------------------------ box
        let exploreValue: number = DataMgr.s.userInfo.data.exploreProgress;
        const perBoxNeedExploreValue: number = (ConfigConfig.getConfig(ConfigType.ExploreForOneBox) as ExploreForOneBoxParam).value;

        let isFinishRookie: boolean = rookieStep == RookieStep.FINISH;
        this._boxDatas = [];
        if (isFinishRookie) {
        } else {
            for (let i = 1; i <= 3; i++) {
                this._boxDatas.push(BoxInfoConfig.getById("900" + i));
            }
            if (rookieStep >= RookieStep.OPNE_BOX_2) {
                exploreValue = perBoxNeedExploreValue * 2;
            } else if (rookieStep >= RookieStep.NPC_TALK_4) {
                exploreValue = perBoxNeedExploreValue;
            } 
        }
        const boxNum: number = this._boxDatas.length;
        const exploreTotalValue: number = perBoxNeedExploreValue * boxNum;

        const boxContentWidth: number = this._boxContent.getComponent(UITransform).width;

        this.node.getChildByPath("__ViewContent/Content/ProgressBar").getComponent(ProgressBar).progress = Math.min(1, exploreValue / exploreTotalValue);

        this._boxContent.removeAllChildren();
        for (let i = 0; i < boxNum; i++) {
            const rank = isFinishRookie ? 3 : 0;
            let item = instantiate(this._boxItem);
            item.name = "HEAT_TREASURE_" + i;
            item.setParent(this._boxContent);

            let treasureView = null;
            for (let j = 0; j <= 5; j++) {
                item.getChildByPath("Treasure_box_" + j).active = j == rank;
                if (j == rank) {
                    treasureView = item.getChildByPath("Treasure_box_" + j);
                }
            }
            if (treasureView != null) {
                treasureView.getChildByName("Common").active = exploreValue < ((i + 1) * perBoxNeedExploreValue);
                treasureView.getChildByName("Light").active = exploreValue >= ((i + 1) * perBoxNeedExploreValue);
                if (rank > 0) {
                    if (treasureView["actiontween"] == null) {
                        treasureView["actiontween"] = tween()
                            .target(treasureView)
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
                    }
                } else {
                    if (treasureView["actiontween"] != null) {
                        treasureView["actiontween"].stop();
                    }
                }
            }

            item.getComponent(Button).clickEvents[0].customEventData = i.toString();
            item.setPosition(v3(-boxContentWidth / 2 + (boxContentWidth / boxNum) * (i + 1), 0, 0));
        }
    }

    //------------------------------------------ action
    private async onTapBoxItem(event: Event, customEventData: string) {
        GameMusicPlayMgr.playTapButtonEffect();
        const index = parseInt(customEventData);
        if (index < 0 || index > this._boxDatas.length - 1) {
            return;
        }
        const data = this._boxDatas[index];
        if (DataMgr.s.userInfo.data.rookieStep != RookieStep.FINISH) {
            // rookie get box
            NetworkMgr.websocketMsg.player_worldbox_beginner_open({
                boxIndex: index,
            });
        }
    }
    private onTapConvertPiotToHeat() {
        const piotNum: number = DataMgr.s.item.getObj_item_count(ResourceCorrespondingItem.Gold);
        const coefficient: number = (ConfigConfig.getConfig(ConfigType.PiotToHeatCoefficient) as PiotToHeatCoefficientParam).coefficient;
        if (piotNum * coefficient < 1) {
            //useLanMgr
            UIHUDController.showCenterTip("Please get more PIOT");
            return;
        }
        const converNum: number = Math.floor(piotNum * coefficient);
        NetworkMgr.websocketMsg.player_piot_to_heat({
            piotNum: converNum * (1 / coefficient),
        });
    }
    private onTapDetail() {
        GameMusicPlayMgr.playTapButtonEffect();
        UIPanelManger.inst.pushPanel(UIName.WorldTreasureDetailUI);
    }
    private onTapQuestion() {
        GameMusicPlayMgr.playTapButtonEffect();
        UIPanelManger.inst.pushPanel(UIName.WorldTreasureTipUI);
    }

    //----------------------------------- notification
    private _onRookieConvertHeat() {
        this.onTapConvertPiotToHeat();
    }
    private _onRookieTapBox(data: { tapIndex: string }) {
        if (data == null || data.tapIndex == null) {
            return;
        }
        this.onTapBoxItem(null, data.tapIndex);
    }
}
