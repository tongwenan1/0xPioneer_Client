import {_decorator, Button, Component, Label, Node, ProgressBar, RichText, Sprite, SpriteFrame} from 'cc';
import CommonTools from "db://assets/Script/Tool/CommonTools";
import BattleReportsMgr, {BattleReportRecord, BattleReportType} from "db://assets/Script/Manger/BattleReportsMgr";
import BuildingMgr from "db://assets/Script/Manger/BuildingMgr";
import PioneerMgr from "db://assets/Script/Manger/PioneerMgr";
import MapHelper from "db://assets/Script/Utils/MapHelper";
import {GameMain} from "db://assets/Script/GameMain";

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

    @property({type: RichText, group: 'Common'})
    public eventLocationLabel: RichText = null;

    @property({type: Label, group: 'Mining'})
    public timeElapsedLabel: Label = null;

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
        if (this.eventLocationLabel)
            this.eventLocationLabel.node.on(Button.EventType.CLICK, this.onClickLocation, this);
        if (this.lootsButton)
            this.lootsButton.node.on(Button.EventType.CLICK, this.onClickLoots, this);
    }

    public initWithReportData(report: BattleReportRecord): void {
        this._report = report;

        if (this.pendingMark) {
            this.pendingMark.active = BattleReportsMgr.isReportPending(report);
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
        this.leftNameLabel.string = selfRoleInfo.name;
        this.leftHpBar.progress = selfRoleInfo.hp / selfRoleInfo.hpMax;
        this.leftHpText.string = `${selfRoleInfo.hp} / ${selfRoleInfo.hpMax}`;
        this.leftAttackerOrDefenderSign.spriteFrame = data.attackerIsSelf ? this.attackerSign : this.defenderSign;

        const enemyRoleInfo = !data.attackerIsSelf ? data.attacker : data.defender;
        this.rightNameLabel.string = enemyRoleInfo.name;
        this.rightHpBar.progress = enemyRoleInfo.hp / enemyRoleInfo.hpMax;
        this.rightHpText.string = `${enemyRoleInfo.hp} / ${enemyRoleInfo.hpMax}`;
        this.rightAttackerOrDefenderSign.spriteFrame = !data.attackerIsSelf ? this.attackerSign : this.defenderSign;

        const selfWin = selfRoleInfo.hp != 0;
        this.eventResultLabel.string = selfWin ? 'Victory' : 'Defeat';
        this.eventTimeLabel.string = CommonTools.formatDateTime(report.timestamp);

        this.eventLocationLabel.string = `Location: <u>World Map ${CommonTools.formatMapPosition(data.position)}</u>`;
        this._locationInfo = {type: "pos", pos: data.position};

        this._loots = data.rewards;
        this.lootsButton.node.active = data.rewards.length != 0;
    }

    private _initWithMiningReport(report: BattleReportRecord): void {
        let buildingInfo = BuildingMgr.instance.getBuildingById(report.data.buildingId);
        let pioneerInfo = PioneerMgr.instance.getPioneerById(report.data.pioneerId);

        const roleName = pioneerInfo.name;
        const location = buildingInfo.locationString();
        const duration = report.data.duration; // in milliseconds
        const rewards = report.data.rewards;
        let miningResult = `Mining progress:\n100%`;

        this.leftNameLabel.string = roleName;

        this.eventLocationLabel.string = `Location: <u>${location}</u>`;
        this._locationInfo = {type: "building", buildingId: buildingInfo.id};

        this.timeElapsedLabel.string = `Duration: ${CommonTools.formatSeconds(Math.floor(duration / 1000))}`;

        this.eventTimeLabel.string = CommonTools.formatDateTime(report.timestamp);
        this.eventResultLabel.string = miningResult;

        this._loots = rewards;
        this.lootsButton.node.active = rewards.length != 0;
    }

    private _initWithExploreReport(report: BattleReportRecord): void {
        let buildingInfo = BuildingMgr.instance.getBuildingById(report.data.buildingId);
        let pioneerInfo = PioneerMgr.instance.getPioneerById(report.data.pioneerId);

        const roleName = pioneerInfo.name;
        const location = buildingInfo.locationString();
        const rewards = report.data.rewards;

        this.leftNameLabel.string = roleName;
        this.eventLocationLabel.string = `Location: <u>${location}</u>`;
        this._locationInfo = {type: "building", buildingId: buildingInfo.id};

        this.eventTimeLabel.string = CommonTools.formatDateTime(report.timestamp);

        if (report.data.hasNextStep && !report.data.nextStepFinished) {
            this.eventResultLabel.node.active = false;
            this.branchSelectionButton.node.active = true;
            this.branchSelectionButton.node.on(Button.EventType.CLICK, () => {
                GameMain.inst.UI.ShowTip("Under construction");
            }, this);
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
                let building = BuildingMgr.instance.getBuildingById(this._locationInfo.buildingId);
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
}