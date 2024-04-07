import { _decorator, Component, Node, Button, SpriteFrame, Sprite, Label, Prefab, instantiate, tiledLayerAssembler, Tween, v3, tween, math, randomRangeInt, Color, LabelOutline, ImageAsset } from 'cc';
import { TilePos } from '../Game/TiledMap/TileTool';
import { ClaimRewardUI } from './ClaimRewardUI';
import { PioneerMgrEvent } from '../Const/Manager/PioneerMgrDefine';
import { BattleReportsMgr, BuildingMgr, LanMgr, LocalDataLoader, PioneerMgr, UIPanelMgr, UserInfoMgr } from '../Utils/Global';
import { MapPioneerActionType } from '../Const/Model/MapPioneerModelDefine';
import MapPioneerModel, { MapPioneerLogicModel } from '../Game/Outer/Model/MapPioneerModel';
import { UIName } from '../Const/ConstUIDefine';
import { TaskListUI } from './TaskListUI';
import { NewSettlementUI } from './NewSettlementUI';
import ViewController from '../BasicView/ViewController';
import NotificationMgr from '../Basic/NotificationMgr';
import { UserInfoEvent } from '../Const/UserInfoDefine';
import { NotificationName } from '../Const/Notification';
import Config from '../Const/Config';
import { MapMemberFactionType } from '../Const/ConstDefine';

const { ccclass, property } = _decorator;

@ccclass('MainUI')
export class MainUI extends ViewController implements PioneerMgrEvent, UserInfoEvent {

    @property(Button)
    backpackBtn: Button = null;

    @property(Button)
    artifactBtn: Button = null;

    private _claimRewardUI: ClaimRewardUI;
    private _gangsterComingTipView: Node = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._gangsterComingTipView = this.node.getChildByName("GangsterTipView");
        this._gangsterComingTipView.active = false;

        PioneerMgr.addObserver(this);
        UserInfoMgr.addObserver(this);

        NotificationMgr.addListener(NotificationName.CHANGE_LANG, this.changeLang, this);
        NotificationMgr.addListener(NotificationName.CHOOSE_GANGSTER_ROUTE, this._refreshInnerOuterChange, this);
    }
    
    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();

        this._claimRewardUI = this.node.getChildByName("reward_ui").getComponent(ClaimRewardUI);

        this._refreshSettlememntTip();
        this._refreshInnerOuterChange();
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
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        PioneerMgr.removeObserver(this);
        UserInfoMgr.removeObserver(this);

        NotificationMgr.removeListener(NotificationName.CHANGE_LANG, this.changeLang, this);
        NotificationMgr.removeListener(NotificationName.CHOOSE_GANGSTER_ROUTE, this._refreshInnerOuterChange, this);
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
    private _refreshInnerOuterChange() {
        let isEnemy: boolean = false;
        const building = BuildingMgr.getBuildingById("building_1");
        if (building != null && building.faction == MapMemberFactionType.enemy) {
            isEnemy = true;
        }
        this.node.getChildByName("InnerOutChangeBtnBg").active = !isEnemy;
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
        if (pioneerId == "gangster_3") {
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
    addNewOnePioneer(newPioneer: MapPioneerModel): void {

    }
    destroyOnePioneer(pioneerId: string): void {

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
            if (Config.canSaveLocalData) {
                localStorage.setItem("local_newSettle", beginLevel + "|" + endLevel);
            }
            this._refreshSettlememntTip();
        }
    }
    playerExplorationValueChanged?(value: number): void {
        this._claimRewardUI.refreshUI();
    }
    getProp(propId: string, num: number): void {

    }
}


