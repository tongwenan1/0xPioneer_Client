import { _decorator, Component, Node, Button, SpriteFrame, Sprite, Label, Prefab, instantiate, tiledLayerAssembler, Tween, v3, tween, math, randomRangeInt, Color, LabelOutline, ImageAsset } from 'cc';
import { TilePos } from '../Game/TiledMap/TileTool';
import { ClaimRewardUI } from './ClaimRewardUI';
import { EventName } from '../Const/ConstDefine';
import { PioneerMgrEvent } from '../Const/Manager/PioneerMgrDefine';
import { FinishedEvent, UserInfoEvent } from '../Const/Manager/UserInfoMgrDefine';
import { BattleReportsEvent } from '../Const/Manager/BattleReportsMgrDefine';
import { BattleReportsMgr, EventMgr, LanMgr, LocalDataLoader, PioneerMgr, UIPanelMgr, UserInfoMgr } from '../Utils/Global';
import { MapPioneerActionType } from '../Const/Model/MapPioneerModelDefine';
import MapPioneerModel, { MapPioneerLogicModel } from '../Game/Outer/Model/MapPioneerModel';
import { UIName } from '../Const/ConstUIDefine';
import { TaskListUI } from './TaskListUI';
import { NewSettlementUI } from './NewSettlementUI';
import ViewController from '../BasicView/ViewController';

const { ccclass, property } = _decorator;

@ccclass('MainUI')
export class MainUI extends ViewController implements PioneerMgrEvent, UserInfoEvent, BattleReportsEvent {

    @property(Button)
    backpackBtn: Button = null;

    @property(Button)
    public battleReportsBtn: Button = null;

    @property(Button)
    artifactBtn: Button = null;

    private _claimRewardUI: ClaimRewardUI;
    private _gangsterComingTipView: Node = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._gangsterComingTipView = this.node.getChildByName("GangsterTipView");
        this._gangsterComingTipView.active = false;

        this._refreshSettlememntTip();
        PioneerMgr.addObserver(this);
        UserInfoMgr.addObserver(this);
        BattleReportsMgr.addObserver(this);

        EventMgr.on(EventName.CHANGE_LANG, this.changeLang, this);
    }
    
    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();

        this._claimRewardUI = this.node.getChildByName("reward_ui").getComponent(ClaimRewardUI);

        if (LocalDataLoader.loadStatus == 0) {
            await LocalDataLoader.loadLocalDatas();
        }
        EventMgr.emit(EventName.LOADING_FINISH);

        this.changeLang();

        const bigGanster = PioneerMgr.getPioneerById("gangster_3");
        if (bigGanster != null && bigGanster.show) {
            this.checkCanShowGansterComingTip(bigGanster.id);
        }

        this.backpackBtn.node.on(Button.EventType.CLICK, async () => {
            await UIPanelMgr.openPanel(UIName.Backpack);
        }, this);

        this.artifactBtn.node.on(Button.EventType.CLICK, async () => {
            await UIPanelMgr.openPanel(UIName.Artifact);
        }, this);

        this.battleReportsBtn.node.on(Button.EventType.CLICK, async () => {
            await UIPanelMgr.openPanel(UIName.BattleReportUI);
        }, this);
        this.updateBattleReportsUnreadCount();
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        PioneerMgr.removeObserver(this);
        UserInfoMgr.removeObserver(this);
        BattleReportsMgr.removeObserver(this);

        EventMgr.off(EventName.CHANGE_LANG, this.changeLang, this);
    }
    
    private updateBattleReportsUnreadCount() {
        const node = this.battleReportsBtn.node.getChildByName('unreadCount');
        const label = node.getChildByName('unreadCountLabel').getComponent(Label);
        if (node) {
            const count = BattleReportsMgr.unreadCount;
            if (count != 0) {
                label.string = count.toString();
                node.active = true;
            } else {
                node.active = false;
            }
        }
    }

    changeLang(): void {
        // useLanMgr
        // this.node.getChildByPath("LeftNode/title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("icon_treasure_box/Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("icon_artifact/Label").getComponent(Label).string = LanMgr.getLanById("107549");
    }

    private _refreshSettlememntTip() {
        const newSettle = localStorage.getItem("local_newSettle");
        const view = this.node.getChildByName("NewSettlementTipView");
        view.active = newSettle != null;
    }

    onBuliClick() {

    }

    private async onTapNewSettlementTip() {
        const currentData = localStorage.getItem("local_newSettle");
        if (currentData != null) {
            const beginLevel = parseInt(currentData.split("|")[0]);
            const endLevel = parseInt(currentData.split("|")[1]);
            const view = await UIPanelMgr.openPanel(UIName.NewSettlementUI);
            if (view != null) {
                view.getComponent(NewSettlementUI).refreshUI(beginLevel, endLevel);
            }
            localStorage.removeItem("local_newSettle");
            this._refreshSettlememntTip();
        }
    }
    private async onTapTaskList() {
        const view = await UIPanelMgr.openPanel(UIName.TaskListUI);
        if (view != null) {
            view.getComponent(TaskListUI).refreshUI();
        }
    }

    private checkCanShowGansterComingTip(pioneerId: string) {
        if (pioneerId == "gangster_3" && UserInfoMgr.finishedEvents.indexOf(FinishedEvent.KillDoomsDayGangTeam) != -1) {
            this._gangsterComingTipView.active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamComing").active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing").active = false;
        }
    }

    private padZero(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }

    private secondsToTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const formattedHours = this.padZero(hours);
        const formattedMinutes = this.padZero(minutes);
        const formattedSeconds = this.padZero(remainingSeconds);

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    //------------------------------------------
    // PioneerMgrEvent
    pioneerActionTypeChanged(pioneerId: string, actionType: MapPioneerActionType, actionEndTimeStamp: number): void {

    }
    pioneerHpMaxChanged(pioneerId: string): void {

    }
    pioneerAttackChanged(pioneerId: string): void {

    }
    pioneerLoseHp(pioneerId: string, value: number): void {

    }
    pionerrRebirthCount(pioneerId: string, count: number): void {

    }
    pioneerRebirth(pioneerId: string): void {

    }
    pioneerDidShow(pioneerId: string): void {
        this.checkCanShowGansterComingTip(pioneerId);
    }
    pioneerDidHide(pioneerId: string): void {

    }
    pioneerDidNonFriendly(pioneerId: string): void {

    }
    pioneerDidFriendly(pioneerId: string): void {

    }
    addNewOnePioneer(newPioneer: MapPioneerModel): void {

    }
    destroyOnePioneer(pioneerId: string): void {

    }
    pioneerTaskBeenGetted(pioneerId: string, taskId: string): void {

    }
    showGetTaskDialog(task: any): void {

    }

    exploredPioneer(pioneerId: string): void {

    }
    exploredBuilding(buildingId: string): void {

    }
    miningBuilding(actionPioneerId: string, buildingId: string): void {

    }
    eventBuilding(actionPioneerId: string, buildingId: string, eventId: string): void {

    }
    pioneerTaskHideTimeCountChanged(pioneerId: string, timeCount: number): void {

    }
    pioneerTaskCdTimeCountChanged(pioneerId: string, timeCount: number): void {

    }
    pioneerLogicMoveTimeCountChanged(pioneer: MapPioneerModel): void {

    }
    pioneerLogicMove(pioneer: MapPioneerModel, logic: MapPioneerLogicModel): void {

    }
    pioneerShowCount(pioneerId: string, count: number): void {
        if (pioneerId == "gangster_3" && count > 0) {
            this._gangsterComingTipView.active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamComing").active = false;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing").active = true;

            // useLanMgr
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing/Tip").getComponent(Label).string = LanMgr.replaceLanById("200003", [this.secondsToTime(count)]);
            // this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing/Tip").getComponent(Label).string = "Big Team Coming: " + this.secondsToTime(count);
        }
    }
    playerPioneerShowMovePath(pioneerId: string, path: TilePos[]): void {

    }

    //-----------------------------------------------------------------
    //userInfoEvent
    playerNameChanged(value: string): void {

    }
    playerLvlupChanged(value: number): void {
        const gap: number = 4;
        if (value % gap == 0) {
            const currentSettle: number = value / gap - 1;
            const beginLevel: number = currentSettle * gap + 1;
            const endLevel: number = (currentSettle + 1) * gap;
            localStorage.setItem("local_newSettle", beginLevel + "|" + endLevel);
            this._refreshSettlememntTip();
        }
    }
    playerExplorationValueChanged?(value: number): void {
        this._claimRewardUI.refreshUI();
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
        this._gangsterComingTipView.active = false;
    }
    taskProgressChanged(taskId: string): void {

    }
    taskFailed(taskId: string): void {

    }
    generateTroopTimeCountChanged(leftTime: number): void {

    }

    onBattleReportListChanged() {
        this.updateBattleReportsUnreadCount();
    }
}


