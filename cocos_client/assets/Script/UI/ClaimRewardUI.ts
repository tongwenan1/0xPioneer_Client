import { _decorator, Component, Node, instantiate, director, BoxCharacterController, Label, Layout, UITransform, ProgressBar, Button, tween, v3, } from "cc";
import UserInfoMgr from "../Manger/UserInfoMgr";
import { GameMain } from "../GameMain";
import BoxMgr from "../Manger/BoxMgr";
import EventMgr from "../Manger/EventMgr"; 
import LanMgr from "../Manger/LanMgr";
import { EventName } from "../Const/ConstDefine";
import DropMgr from "../Manger/DropMgr";
const { ccclass, property } = _decorator;

@ccclass("ClaimRewardUI")
export class ClaimRewardUI extends Component {
    @property(Node) RewardBoxArr: Node;

    public refreshUI() {
        let value = UserInfoMgr.Instance.explorationValue;

        let showBox = false;
        for (let i = 0; i < this._boxViews.length; i++) {
            if (i < this._boxDatas.length) {
                const data = this._boxDatas[i];
                // 0-no 1-can 2-getted
                let getStatus: number = 0;
                if (UserInfoMgr.Instance.gettedExplorationRewardIds.indexOf(data.id) != -1) {
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
    private _boxDatas: any[] = [];
    private _maxthreshold: number = 0;

    private _boxViews: Node[] = [];

    protected onLoad(): void {
        EventMgr.on(EventName.LOADING_FINISH, this.loadOver, this);
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
            this._boxDatas = BoxMgr.Instance.getAllBox();
            let pre = this.RewardBoxArr.getChildByName("icon_treasure_box");
            pre.active = false;
            for (let i = 0; i < this._boxDatas.length; i++) {
                let item = instantiate(pre);
                item.active = true;
                item.setParent(this.RewardBoxArr);
                for (let j = 0; j < 3; j++) {
                    item.getChildByPath("Treasure/Treasure_box_" + j).active = j == this._boxDatas[i].icon;
                }
                item.getChildByName("Progress").getComponent(Label).string = this._boxDatas[i].threshold;
                item.getChildByName("Button").getComponent(Button).clickEvents[0].customEventData = i.toString();
                this._boxViews.push(item);
                this._maxthreshold = Math.max(this._maxthreshold, this._boxDatas[i].threshold);
            }
            const gap = this.RewardBoxArr.getComponent(UITransform).width / (this._boxDatas.length);
            this.RewardBoxArr.getComponent(Layout).spacingX = gap;
            this.RewardBoxArr.getComponent(Layout).paddingLeft = gap;
            this.RewardBoxArr.getComponent(Layout).updateLayout();

            this.refreshUI();
        }
    }

    //------------------------------------------ action
    private onTapBoxItem(event: Event, customEventData: string) {
        const index = parseInt(customEventData);
        const data = this._boxDatas[index];
        // 0-no 1-can 2-getted
        let getStatus: number = 0;
        if (UserInfoMgr.Instance.gettedExplorationRewardIds.indexOf(data.id) != -1) {
            getStatus = 2;
        } else if (UserInfoMgr.Instance.explorationValue >= data.threshold) {
            getStatus = 1;
        }
        if (getStatus == 2) {

        } else if (getStatus == 1) {
            GameMain.inst.UI.treasureGettedUI.show(true);
            GameMain.inst.UI.treasureGettedUI.dialogShow(data, ()=> {
                this.refreshUI();
            });
        } else if (getStatus == 0) {

            // useLanMgr
            GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("200002"));
            // GameMain.inst.UI.ShowTip("Please explore more to get it");
        }
    }
}
