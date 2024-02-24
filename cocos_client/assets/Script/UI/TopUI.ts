import { Component, Label, ProgressBar, Node, Sprite, _decorator, Tween, v3, warn, EventHandler, Button, randomRangeInt } from 'cc';
import { GameMain } from '../GameMain';
import EventMgr from '../Manger/EventMgr';
import UserInfo, { FinishedEvent, UserInfoEvent } from '../Manger/UserInfoMgr';
const { ccclass, property } = _decorator;


@ccclass('TopUI')
export default class TopUI extends Component implements UserInfoEvent {

    @property(Label)
    txtPlayerName: Label = null;

    @property(Label)
    txtPlayerLV: Label = null;

    @property(Label)
    txtLvProgress: Label = null;

    @property(Label)
    txtMoney: Label = null;

    @property(Label)
    txtEnergy: Label = null;

    @property(ProgressBar)
    lvProgress: ProgressBar = null;

    @property(Sprite)
    sprPlayerHead: Sprite = null;

    private _started: boolean = false;
    private _dataLoaded: boolean = false;
    protected onLoad(): void {
        UserInfo.Instance.addObserver(this);

        EventMgr.on("Event_LoadOver", this.loadOver, this);
    }

    start() {
        this._started = true;
        this._startAction();
    }

    protected onDestroy(): void {
        UserInfo.Instance.removeObserver(this);
    }

    private loadOver() {
        this._dataLoaded = true;
        this._startAction();
    }

    private _startAction() {
        if (this._started && this._dataLoaded) {
            this.refreshTopUI();
        }
    }

    refreshTopUI() {
        const info = UserInfo.Instance;
        this.txtPlayerName.string = info.playerName;
        this.txtPlayerLV.string = "LV" + info.level;
        this.txtLvProgress.string = `${info.exp}/${1000}`;
        this.txtMoney.string = "" + info.money;
        this.txtEnergy.string = "" + info.energy;
        this.lvProgress.progress = 0;

        const resourceView = this.node.getChildByName("Resource");
        resourceView.getChildByPath("Food/Label").getComponent(Label).string = info.food.toString();
        resourceView.getChildByPath("Wood/Label").getComponent(Label).string = info.wood.toString();
        resourceView.getChildByPath("Stone/Label").getComponent(Label).string = info.stone.toString();
        resourceView.getChildByPath("Troops/Label").getComponent(Label).string = info.troop.toString();
    }

    /**
     * 
     * @param type 0-energy 1-money 2-food 3-wood 4-stone 5-troop
     * @param changedNum 
     * @param showNumLabel 
     */
    private playNumChangedAnim(type: number, changedNum: number, showNumLabel: Label) {
        let node = new Node();
        let lbl = node.addComponent(Label);
        lbl.string = (changedNum > 0) ? ("+" + changedNum) : ("" + changedNum);
        node.parent = showNumLabel.node;
        node.position = v3(0, showNumLabel.node.position.y - 30);

        let seq = new Tween(node);
        seq.to(0.4, { position: v3(node.position.x, node.position.y + 30) }, null);
        seq.call(() => {
            node.destroy();
            let resultNum = 0;
            if (type == 0) {
                resultNum = UserInfo.Instance.energy;
            } else if (type == 1) {
                resultNum = UserInfo.Instance.money;
            } else if (type == 2) {
                resultNum = UserInfo.Instance.food;
            } else if (type == 3) {
                resultNum = UserInfo.Instance.wood;
            } else if (type == 4) {
                resultNum = UserInfo.Instance.stone;
            } else if (type == 5) {
                resultNum = UserInfo.Instance.troop;
            }
            showNumLabel.string = resultNum.toString();
        });
        seq.start();
    }

    //------------------------------------------------ action
    private onTapTaskList() {
        GameMain.inst.UI.taskListUI.refreshUI();
        GameMain.inst.UI.taskListUI.show(true);
    }
    //-----------------------------------------------
    // userinfoevent
    playerNameChanged(value: string): void {
        this.refreshTopUI();
    }
    playerEnergyChanged(value: number): void {
        this.refreshTopUI();
    }
    playerMoneyChanged(value: number): void {
        this.refreshTopUI();
    }
    playerFoodChanged(value: number): void {
        this.refreshTopUI();
    }
    playerWoodChanged(value: number): void {
        this.refreshTopUI();
    }
    playerStoneChanged(value: number): void {
        this.refreshTopUI();
    }
    playerTroopChanged(value: number): void {
        this.refreshTopUI();
    }

    getNewTask(taskId: string): void {

    }
    triggerTaskStepAction(action: string, delayTime: number): void {

    }
    finishEvent(event: FinishedEvent): void {

    }
    getProp(propId: string, num: number): void {

    }
    gameTaskOver(): void {

    }
    taskProgressChanged(taskId: string): void {
        
    }
    taskFailed(taskId: string): void {
        
    }
    generateTroopTimeCountChanged(leftTime: number): void {
        
    }
}