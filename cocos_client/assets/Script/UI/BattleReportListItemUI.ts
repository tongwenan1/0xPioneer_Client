import {_decorator, Button, Component, Label, Node, ProgressBar, RichText, Sprite, SpriteFrame} from 'cc';
import CommonTools from "db://assets/Script/Tool/CommonTools";
import MapHelper from "db://assets/Script/Utils/MapHelper";
import {GameMain} from "db://assets/Script/GameMain";
import BattleReportsMgrDefine, { BattleReportRecord, BattleReportType } from '../Const/Manager/BattleReportsMgrDefine';
import { BranchEventMgr, BuildingMgr, LanMgr, PioneerMgr } from '../Utils/Global';

const {ccclass, property} = _decorator;

class LocationInfo {
    type: "pos" | "building";
    buildingId?: string;
    pos?: { x: number, y: number };
}

@ccclass('BattleReportListItemUI')
export class BattleReportListItemUI extends Component {
    @property({type: Label, group: 'Common'})
    public leftNameLabel: Label = null;

    @property({type: Sprite, group: 'Common'})
    public leftAvatarIconSprite: Sprite = null;

    @property({type: ProgressBar, group: 'Fight'})
    public leftHpBar: ProgressBar = null;

    @property({type: Label, group: 'Fight'})
    public leftHpText: Label = null;

    @property({type: Sprite, group: 'Fight'})
    public leftAttackerOrDefenderSign: Sprite = null;

    @property({type: Label, group: 'Fight'})
    public rightNameLabel: Label = null;

    @property({type: Sprite, group: 'Fight'})
    public rightAvatarIconSprite: Sprite = null;

    @property({type: ProgressBar, group: 'Fight'})
    public rightHpBar: ProgressBar = null;

    @property({type: Label, group: 'Fight'})
    public rightHpText: Label = null;

    @property({type: Sprite, group: 'Fight'})
    public rightAttackerOrDefenderSign: Sprite = null;

    @property({type: SpriteFrame, group: 'Fight'})
    public attackerSign: SpriteFrame = null;

    @property({type: SpriteFrame, group: 'Fight'})
    public defenderSign: SpriteFrame = null;

    @property({type: Label, group: 'Common'})
    public eventTimeLabel: Label = null;

    @property({type: Label, group: 'Common'})
    public eventResultLabel: Label = null;

    @property({type: Sprite, group: 'Fight'})
    public fightResultSprite: Sprite = null;

    @property({type: SpriteFrame, group: 'Fight'})
    public fightResultVictory: SpriteFrame = null;

    @property({type: SpriteFrame, group: 'Fight'})
    public fightResultDefeat: SpriteFrame = null;

    @property({type: RichText, group: 'Common'})
    public eventLocationLabel: RichText = null;

    @property({type: RichText, group: 'Mining'})
    public timeElapsedLabel: RichText = null;

    @property({type: RichText, group: 'Mining'})
    public miningResultLabel: RichText = null;


    @property({type: Node, group: 'Common'})
    public pendingMark: Node = null;

    @property({type: Button, group: 'Common'})
    public lootsButton: Button = null;

    @property({type: Button, group: 'Explore'})
    public branchSelectionButton: Button = null;

    private _locationInfo: LocationInfo = null;
    private _loots: { id: string, num: number }[] = null;

    private _report: BattleReportRecord = null;
    public get report() {
        return this._report;
    }

    protected onLoad() {
        if (this.lootsButton)
            this.lootsButton.node.on(Button.EventType.CLICK, this.onClickLoots, this);
    }

    public initWithReportData(report: BattleReportRecord): void {
        this._report = report;

        if (this.pendingMark) {
            this.pendingMark.active = BattleReportsMgrDefine.isReportPending(report); 
        }

        switch (report.type) {
            case BattleReportType.Fight:
                this._initWithFightReport(report);
                break;
            case BattleReportType.Mining:
                this._initWithMiningReport(report);
                break;
            case BattleReportType.Exploring:
                this._initWithExploreReport(report);
                break;
            default:
                console.error(`Unknown report type ${report.type}. ${JSON.stringify(report)}`)
                break;
        }
    }

    private _initWithFightReport(report: BattleReportRecord): void {
        const data = report.data;
        const selfRoleInfo = data.attackerIsSelf ? data.attacker : data.defender;
        this.leftNameLabel.string = LanMgr.getLanById(selfRoleInfo.name);
        this.leftHpBar.progress = selfRoleInfo.hp / selfRoleInfo.hpMax;
        this.leftHpText.string = `${selfRoleInfo.hp} / ${selfRoleInfo.hpMax}`;
        this.leftAttackerOrDefenderSign.spriteFrame = data.attackerIsSelf ? this.attackerSign : this.defenderSign;

        const enemyRoleInfo = !data.attackerIsSelf ? data.attacker : data.defender;
        this.rightNameLabel.string = LanMgr.getLanById(enemyRoleInfo.name);
        this.rightHpBar.progress = enemyRoleInfo.hp / enemyRoleInfo.hpMax;
        this.rightHpText.string = `${enemyRoleInfo.hp} / ${enemyRoleInfo.hpMax}`;
        this.rightAttackerOrDefenderSign.spriteFrame = !data.attackerIsSelf ? this.attackerSign : this.defenderSign;

        const selfWin = selfRoleInfo.hp != 0;
        this.fightResultSprite.spriteFrame = selfWin ? this.fightResultVictory : this.fightResultDefeat;
        this.eventTimeLabel.string = CommonTools.formatDateTime(report.timestamp);

        this._locationInfo = {type: "pos", pos: data.position};
        this.eventLocationLabel.string = this._locationString(this._locationInfo);

        this._loots = data.rewards;
        this.lootsButton.node.active = data.rewards.length != 0;
    }

    private _initWithMiningReport(report: BattleReportRecord): void {
        let buildingInfo = BuildingMgr.getBuildingById(report.data.buildingId);
        let pioneerInfo = PioneerMgr.getPioneerById(report.data.pioneerId);

        const roleName = LanMgr.getLanById(pioneerInfo.name);
        const duration = report.data.duration; // in milliseconds
        const rewards = report.data.rewards;

        this.leftNameLabel.string = roleName;

        this._locationInfo = {type: "building", buildingId: buildingInfo.id};
        this.eventLocationLabel.string = this._locationString(this._locationInfo);

        this.timeElapsedLabel.string = LanMgr.replaceLanById("701003", [CommonTools.formatSeconds(Math.floor(duration / 1000))]);

        this.eventTimeLabel.string = CommonTools.formatDateTime(report.timestamp);
        this.miningResultLabel.string = LanMgr.replaceLanById("701001", ["100"]);

        this._loots = rewards;
        this.lootsButton.node.active = rewards.length != 0;
    }

    private _initWithExploreReport(report: BattleReportRecord): void {
        let buildingInfo = BuildingMgr.getBuildingById(report.data.buildingId);
        let pioneerInfo = PioneerMgr.getPioneerById(report.data.pioneerId);

        const roleName = LanMgr.getLanById(pioneerInfo.name);
        const rewards = report.data.rewards;

        this.leftNameLabel.string = roleName;
        this._locationInfo = {type: "building", buildingId: buildingInfo.id};
        this.eventLocationLabel.string = this._locationString(this._locationInfo);

        this.eventTimeLabel.string = CommonTools.formatDateTime(report.timestamp);

        if (report.data.hasNextStep && !report.data.nextStepFinished) {
            this.eventResultLabel.node.active = false;
            this.branchSelectionButton.node.active = true;
            this.branchSelectionButton.node.on(Button.EventType.CLICK, this.onClickBranchSelection, this);
        } else {
            this.eventResultLabel.node.active = true;
            this.branchSelectionButton.node.active = false;
        }

        this._loots = rewards;
        this.lootsButton.node.active = rewards && rewards.length != 0;
    }

    private onClickLocation() {
        if (!this._locationInfo) {
            console.error("BattleReportListItemUI._locationInfo empty");
            return;
        }

        let pos: { x: number, y: number };
        switch (this._locationInfo.type) {
            case "pos":
                pos = this._locationInfo.pos;
                break;
            case "building":
                let building = BuildingMgr.getBuildingById(this._locationInfo.buildingId);
                pos = building.stayMapPositions[0];
                break;
            default:
                console.error(`Unknown _locationInfo.type: ${this._locationInfo.type}`);
                return;
        }

        GameMain.inst.UI.battleReportsUI.show(false);
        MapHelper.highlightPosOnOuterMap(pos);
    }

    private onClickLoots() {
        if (!this._loots) {
            console.error("BattleReportListItemUI._loots empty");
            return;
        }

        GameMain.inst.UI.lootsPopupUI.showItems(this._loots);
    }

    onClickBranchSelection() {
        const reportData = this.report.data;
        const building = BuildingMgr.getBuildingById(reportData.buildingId);
        const findEvents = BranchEventMgr.getEventById(building.eventId);
        if (findEvents.length == 0) {
            GameMain.inst.UI.ShowTip("Error");
            return;
        }

        GameMain.inst.UI.battleReportsUI.show(false);
        const currentEvent = findEvents[0];
        PioneerMgr.pioneerDealWithEvent(reportData.pioneerId, reportData.buildingId, currentEvent);
    }

    private _locationString(locationInfo: LocationInfo): string {
        if (locationInfo.type === "building") {
            const building = BuildingMgr.getBuildingById(locationInfo.buildingId);
            return `${LanMgr.getLanById(building.name)} <color=#a1cb7f>${CommonTools.formatMapPosition(building.stayMapPositions[0])}</color>`;
        } else {
            return `${LanMgr.getLanById("701002")} <color=#a1cb7f>${CommonTools.formatMapPosition(locationInfo.pos)}</color>`;
        }
    }
}