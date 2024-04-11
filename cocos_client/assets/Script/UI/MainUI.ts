import { _decorator, Component, Node, Button, SpriteFrame, Sprite, Label, Prefab, instantiate, tiledLayerAssembler, Tween, v3, tween, math, randomRangeInt, Color, LabelOutline, ImageAsset } from 'cc';
import { TilePos } from '../Game/TiledMap/TileTool';
import { ClaimRewardUI } from './ClaimRewardUI';
import { PioneerMgrEvent } from '../Const/Manager/PioneerMgrDefine';
import { ArtifactMgr, BattleReportsMgr, BuildingMgr, ItemMgr, LanMgr, LocalDataLoader, PioneerMgr, UserInfoMgr } from '../Utils/Global';
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
import { MapMemberFactionType, ResourceCorrespondingItem } from '../Const/ConstDefine';
import UIPanelManger from '../Basic/UIPanelMgr';
import GameMainHelper from '../Game/Helper/GameMainHelper';
import ArtifactData from '../Model/ArtifactData';
import { DataMgr } from '../Data/DataMgr';

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

        this._gangsterComingTipView = this.node.getChildByPath("CommonContent/GangsterTipView");
        this._gangsterComingTipView.active = false;

        PioneerMgr.addObserver(this);
        UserInfoMgr.addObserver(this);

        NotificationMgr.addListener(NotificationName.CHANGE_LANG, this.changeLang, this);
        NotificationMgr.addListener(NotificationName.CHOOSE_GANGSTER_ROUTE, this._refreshInnerOuterChange, this);
        NotificationMgr.addListener(NotificationName.GAME_INNER_BUILDING_LATTICE_EDIT_CHANGED, this._onInnerBuildingLatticeEditChanged, this);
        NotificationMgr.addListener(NotificationName.GAME_INNER_AND_OUTER_CHANGED, this._onInnerOuterChanged, this);
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_SHOW_HIDE_COUNT_CHANGED, this._onPioneerShowHideCountChanged, this);

        // DataMgr.n.websocket.on("get_pioneers_res", this._get_pioneers_res);
    }

    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();

        this._claimRewardUI = this.node.getChildByPath("CommonContent/reward_ui").getComponent(ClaimRewardUI);

        this._refreshSettlememntTip();
        this._refreshInnerOuterChange();
        this._onInnerOuterChanged();
        this.changeLang();

        const bigGanster = PioneerMgr.getPioneerById("gangster_3");
        if (bigGanster != null && bigGanster.show) {
            this.checkCanShowGansterComingTip(bigGanster.id);
        }

        this.backpackBtn.node.on(Button.EventType.CLICK, async () => {
            await UIPanelManger.inst.pushPanel(UIName.Backpack);
        }, this);

        this.artifactBtn.node.on(Button.EventType.CLICK, async () => {
            await UIPanelManger.inst.pushPanel(UIName.Artifact);
        }, this);

        // test
        // for (let i = 1; i <= 10; i++) {
        //     ArtifactMgr.addArtifact([new ArtifactData("700" + i, 1)]);
        // }

        //DataMgr.n.websocketMsg.create_pioneer({
        //    type: "0"
        //});
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        PioneerMgr.removeObserver(this);
        UserInfoMgr.removeObserver(this);

        NotificationMgr.removeListener(NotificationName.CHANGE_LANG, this.changeLang, this);
        NotificationMgr.removeListener(NotificationName.CHOOSE_GANGSTER_ROUTE, this._refreshInnerOuterChange, this);
        NotificationMgr.removeListener(NotificationName.GAME_INNER_BUILDING_LATTICE_EDIT_CHANGED, this._onInnerBuildingLatticeEditChanged, this);
        NotificationMgr.removeListener(NotificationName.GAME_INNER_AND_OUTER_CHANGED, this._onInnerOuterChanged, this);
        NotificationMgr.removeListener(NotificationName.MAP_PIONEER_SHOW_HIDE_COUNT_CHANGED, this._onPioneerShowHideCountChanged, this);

        //DataMgr.n.websocket.off("get_pioneers_res", this._get_pioneers_res);
    }

    changeLang(): void {
        // useLanMgr
        // this.node.getChildByPath("CommonContent/LeftNode/title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("CommonContent/icon_treasure_box/Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("CommonContent/icon_artifact/Label").getComponent(Label).string = LanMgr.getLanById("107549");
    }

    private _refreshSettlememntTip() {
        const newSettle = localStorage.getItem("local_newSettle");
        const view = this.node.getChildByPath("CommonContent/NewSettlementTipView");
        view.active = newSettle != null;
    }
    private _refreshInnerOuterChange() {
        let isEnemy: boolean = false;
        const building = BuildingMgr.getBuildingById("building_1");
        if (building != null && building.faction == MapMemberFactionType.enemy) {
            isEnemy = true;
        }
        this.node.getChildByPath("CommonContent/InnerOutChangeBtnBg").active = !isEnemy;
    }

    private async onTapNewSettlementTip() {
        const currentData = localStorage.getItem("local_newSettle");
        if (currentData != null) {
            const beginLevel = parseInt(currentData.split("|")[0]);
            const endLevel = parseInt(currentData.split("|")[1]);
            const result = await UIPanelManger.inst.pushPanel(UIName.NewSettlementUI);
            if (result.success) {
                result.node.getComponent(NewSettlementUI).refreshUI(beginLevel, endLevel);
            }
            localStorage.removeItem("local_newSettle");
            this._refreshSettlememntTip();
        }
    }
    private async onTapTaskList() {
        const result = await UIPanelManger.inst.pushPanel(UIName.TaskListUI);
        if (result.success) {
            result.node.getComponent(TaskListUI).refreshUI();
        }
    }
    private onTapChangeBuildingSetPos() {
        GameMainHelper.instance.changeInnerBuildingLatticeEdit();
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
    pioneerLogicMoveTimeCountChanged(pioneer: MapPioneerModel): void {

    }
    pioneerLogicMove(pioneer: MapPioneerModel, logic: MapPioneerLogicModel): void {

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

    //----------------------------------------------------- notification
    private _onPioneerShowHideCountChanged(pioneer: MapPioneerModel) {
        if (pioneer.id == "gangster_3" &&
            pioneer.showHideStruct != null &&
            pioneer.showHideStruct.countTime > 0 &&
            pioneer.showHideStruct.isShow) {

            this._gangsterComingTipView.active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamComing").active = false;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing").active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing/Tip").getComponent(Label).string = LanMgr.replaceLanById("200003", [this.secondsToTime(pioneer.showHideStruct.countTime)]);
        }
    }

    private _onInnerBuildingLatticeEditChanged() {
        const edit: boolean = GameMainHelper.instance.isEditInnerBuildingLattice;
        this.node.getChildByPath("CommonContent").active = !edit;
    }
    private _onInnerOuterChanged() {
        const isOuter: boolean = GameMainHelper.instance.isGameShowOuter;
        this.node.getChildByPath("btnBuild").active = !isOuter;
    }


    // res
    private _get_pioneers_res() {
        let pioneers = DataMgr.s.pioneers.getAll;
        console.log("Pioneers info: ", pioneers);
    }
}


