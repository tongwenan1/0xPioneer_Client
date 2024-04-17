import { _decorator, Node, Button, Label } from "cc";
import { ClaimRewardUI } from "./ClaimRewardUI";
import { ItemMgr, LanMgr, UserInfoMgr } from "../Utils/Global";
import { UIName } from "../Const/ConstUIDefine";
import { TaskListUI } from "./TaskListUI";
import { NewSettlementUI } from "./NewSettlementUI";
import ViewController from "../BasicView/ViewController";
import NotificationMgr from "../Basic/NotificationMgr";
import { UserInfoEvent } from "../Const/UserInfoDefine";
import { NotificationName } from "../Const/Notification";
import Config from "../Const/Config";
import { MapMemberFactionType } from "../Const/ConstDefine";
import UIPanelManger from "../Basic/UIPanelMgr";
import GameMainHelper from "../Game/Helper/GameMainHelper";
import { DataMgr } from "../Data/DataMgr";
import { NFTBackpackUI } from "./NFTBackpackUI";
import ItemData from "../Const/Item";

const { ccclass, property } = _decorator;

@ccclass("MainUI")
export class MainUI extends ViewController implements UserInfoEvent {
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

        UserInfoMgr.addObserver(this);

        NotificationMgr.addListener(NotificationName.CHANGE_LANG, this.changeLang, this);
        NotificationMgr.addListener(NotificationName.CHOOSE_GANGSTER_ROUTE, this._refreshInnerOuterChange, this);
        NotificationMgr.addListener(NotificationName.GAME_INNER_BUILDING_LATTICE_EDIT_CHANGED, this._onInnerBuildingLatticeEditChanged, this);
        NotificationMgr.addListener(NotificationName.GAME_INNER_AND_OUTER_CHANGED, this._onInnerOuterChanged, this);
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_SHOW_HIDE_COUNT_CHANGED, this._onPioneerShowHideCountChanged, this);
    }

    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();

        this._claimRewardUI = this.node.getChildByPath("CommonContent/reward_ui").getComponent(ClaimRewardUI);

        this._refreshSettlememntTip();
        this._refreshInnerOuterChange();
        this._onInnerOuterChanged();
        this.changeLang();

        const bigGanster = DataMgr.s.pioneer.getById("gangster_3");
        if (bigGanster != null && bigGanster.show) {
            this.checkCanShowGansterComingTip(bigGanster.id);
        }

        this.backpackBtn.node.on(
            Button.EventType.CLICK,
            async () => {
                await UIPanelManger.inst.pushPanel(UIName.Backpack);
            },
            this
        );

        this.artifactBtn.node.on(
            Button.EventType.CLICK,
            async () => {
                await UIPanelManger.inst.pushPanel(UIName.Artifact);
            },
            this
        );

        // test
        // for (let i = 1; i <= 10; i++) {
        //     ArtifactMgr.addArtifact([new ArtifactData("700" + i, 1)]);
        // }
        //DataMgr.n.websocketMsg.create_pioneer({
        //    type: "0"
        //});
        ItemMgr.addItem([new ItemData("5001", 4)]);
        // ItemMgr.addItem([new ItemData("8", 1)]);
        // ItemMgr.addItem([new ItemData("9", 1)]);
        // ItemMgr.addItem([new ItemData("10", 1)]);
        // ItemMgr.addItem([new ItemData("11", 1)]);
        // PioneerDevelopMgr.generateNewNFT();
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        UserInfoMgr.removeObserver(this);

        NotificationMgr.removeListener(NotificationName.CHANGE_LANG, this.changeLang, this);
        NotificationMgr.removeListener(NotificationName.CHOOSE_GANGSTER_ROUTE, this._refreshInnerOuterChange, this);
        NotificationMgr.removeListener(NotificationName.GAME_INNER_BUILDING_LATTICE_EDIT_CHANGED, this._onInnerBuildingLatticeEditChanged, this);
        NotificationMgr.removeListener(NotificationName.GAME_INNER_AND_OUTER_CHANGED, this._onInnerOuterChanged, this);
        NotificationMgr.removeListener(NotificationName.MAP_PIONEER_SHOW_HIDE_COUNT_CHANGED, this._onPioneerShowHideCountChanged, this);
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
        // const building = BuildingMgr.getBuildingById("building_1");
        const building = DataMgr.s.mapBuilding.getBuildingById("building_1");

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
    private async onTapNFT() {
        const result = await UIPanelManger.inst.pushPanel(UIName.NFTBackpackUI);
        if (result.success) {
            result.node.getComponent(NFTBackpackUI);
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

    //-----------------------------------------------------------------
    //userInfoEvent
    playerNameChanged(value: string): void {}
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
    getProp(propId: string, num: number): void {}

    //----------------------------------------------------- notification
    private _onPioneerShowChanged(data: { id: string; show: boolean }) {
        this.checkCanShowGansterComingTip(data.id);
    }
    private _onPioneerShowHideCountChanged(data: { id: string }) {
        const pioneer = DataMgr.s.pioneer.getById(data.id);
        if (pioneer == undefined) {
            return;
        }
        if (pioneer.id == "gangster_3" && pioneer.showHideStruct != null && pioneer.showHideStruct.countTime > 0 && pioneer.showHideStruct.isShow) {
            this._gangsterComingTipView.active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamComing").active = false;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing").active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing/Tip").getComponent(Label).string = LanMgr.replaceLanById("200003", [
                this.secondsToTime(pioneer.showHideStruct.countTime),
            ]);
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
}
