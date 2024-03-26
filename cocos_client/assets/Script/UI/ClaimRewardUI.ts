import { _decorator, Component, Node, instantiate, director, BoxCharacterController, Label, Layout, UITransform, ProgressBar, Button, tween, v3, } from "cc";
import { EventName } from "../Const/ConstDefine";
import { LanMgr, UIPanelMgr, UserInfoMgr } from "../Utils/Global";
import { UIName } from "../Const/ConstUIDefine";
import { TreasureGettedUI } from "./TreasureGettedUI";
import { UIHUDController } from "./UIHUDController";
import NotificationMgr from "../Basic/NotificationMgr";
import BoxInfoConfig from "../Config/BoxInfoConfig";
import { BoxInfoConfigData } from "../Const/BoxInfo";
const { ccclass, property } = _decorator;

@ccclass("ClaimRewardUI")
export class ClaimRewardUI extends Component {
    @property(Node) RewardBoxArr: Node;

    public refreshUI() {
        let value = UserInfoMgr.explorationValue;
        let showBox = false;
        for (let i = 0; i < this._boxViews.length; i++) {
            if (i < this._boxDatas.length) {
                const data = this._boxDatas[i];
                // 0-no 1-can 2-getted
                let getStatus: number = 0;
                if (UserInfoMgr.gettedExplorationRewardIds.indexOf(data.id) != -1) {
                    getStatus = 2;
                } else if (value >= data.threshold) {
                    getStatus = 1;
                }
                this._boxViews[i].getChildByPath("Treasure").active = getStatus != 2;
                if (getStatus != 2) {
                    for (let j = 0; j < 3; j++) {
                        const treasureView = this._boxViews[i].getChildByPath("Treasure/Treasure_box_" + j);
                        treasureView.active = j == this._boxDatas[i].icon;
                        if (treasureView.active) {
                            treasureView.getChildByName("Common").active = getStatus == 0;
                            treasureView.getChildByName("Light").active = getStatus == 1;
                            if (getStatus == 1) {
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
                                    ).start();
                                }
                            } else {
                                if (treasureView["actiontween"] != null) {
                                    treasureView["actiontween"].stop();
                                }
                            }
                        }
                    }
                    showBox = true;
                }
            }
        }
        this.node.getChildByPath("bg-001/progress_bg_exp/ProgressBar").getComponent(ProgressBar).progress = Math.min(1, value / this._maxthreshold);
        if (!showBox) {
            this.node.active = false;
        }
    }

    private _started: boolean = false;
    private _dataLoaded: boolean = false;
    private _boxDatas: BoxInfoConfigData[] = [];
    private _maxthreshold: number = 0;

    private _boxViews: Node[] = [];

    protected onLoad(): void {
        NotificationMgr.addListener(EventName.LOADING_FINISH, this.loadOver, this);
    }
    start() {
        this._started = true;
        this._startAction();
    }

    update(deltaTime: number) { }

    private loadOver() {
        this._dataLoaded = true;
        this._startAction();
    }

    private _startAction() {
        if (this._started && this._dataLoaded) {
            this._boxDatas = BoxInfoConfig.getAllBox();
            let pre = this.RewardBoxArr.getChildByName("icon_treasure_box");
            pre.active = false;

            let beginThresholdValue: number = 0;
            for (let i = 0; i < this._boxDatas.length; i++) {
                let item = instantiate(pre);
                item.active = true;
                item.setParent(this.RewardBoxArr);
                for (let j = 0; j < 3; j++) {
                    item.getChildByPath("Treasure/Treasure_box_" + j).active = j == this._boxDatas[i].icon;
                }
                item.getChildByName("Progress").getComponent(Label).string = this._boxDatas[i].threshold.toString();
                item.getChildByName("Treasure").getComponent(Button).clickEvents[0].customEventData = i.toString();
                this._boxViews.push(item);
                item["__fromthreshold"] = beginThresholdValue + this._boxDatas[i].threshold;
                this._maxthreshold = Math.max(this._maxthreshold, this._boxDatas[i].threshold);
            }
            const parentWidth = this.RewardBoxArr.getComponent(UITransform).width;
            for (const boxItem of this._boxViews) {
                boxItem.setPosition(v3(parentWidth * (boxItem["__fromthreshold"] / this._maxthreshold), boxItem.position.y, boxItem.position.z));
            }
            this.refreshUI();
        }
    }

    //------------------------------------------ action
    private async onTapBoxItem(event: Event, customEventData: string) {
        const index = parseInt(customEventData);
        const data = this._boxDatas[index];
        // 0-no 1-can 2-getted
        let getStatus: number = 0;
        if (UserInfoMgr.gettedExplorationRewardIds.indexOf(data.id) != -1) {
            getStatus = 2;
        } else if (UserInfoMgr.explorationValue >= data.threshold) {
            getStatus = 1;
        }
        if (getStatus == 2) {

        } else if (getStatus == 1) {
            const view = await UIPanelMgr.openPanel(UIName.TreasureGettedUI);
            if (view != null) {
                view.getComponent(TreasureGettedUI).dialogShow(data, ()=> {
                    this.refreshUI();
                });
            }
        } else if (getStatus == 0) {

            // useLanMgr
            UIHUDController.showCenterTip(LanMgr.getLanById("200002"));
            // UIHUDController.showCenterTip("Please explore more to get it");
        }
    }
}
