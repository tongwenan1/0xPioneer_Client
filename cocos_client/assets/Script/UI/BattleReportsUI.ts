import {_decorator, Button, Color, instantiate, Label, Layout, Mask, Node, ScrollView, UITransform} from 'cc';
import {PopUpUI} from "db://assets/Script/BasicView/PopUpUI";
import {BattleReportListItemUI} from "./BattleReportListItemUI";
import BattleReportsMgr, {BattleReportsEvent, BattleReportType} from "db://assets/Script/Manger/BattleReportsMgr";

const {ccclass} = _decorator;

enum ReportsFilterType {
    None,
    ReportType,
    Pending,
}

class ReportFilterState {
    public filterType: ReportsFilterType = ReportsFilterType.None;
    public reportType: BattleReportType = null;
}

@ccclass('BattleReportListUI')
export class BattleReportsUI extends PopUpUI implements BattleReportsEvent {

    private _reportUiItems: BattleReportListItemUI[] = [];
    private _fightTypeItemTemplate: Node = null;
    private _miningTypeItemTemplate: Node = null;
    private _exploreTypeItemTemplate: Node = null;
    private _reportListScrollView: ScrollView = null;
    /** all / fight / mining / ... */
    private _typeFilterButtons: Button[] = null;
    private _pendingButton: Button = null;
    private _markAllAsReadButton: Button = null;
    private _deleteReadReportsButton: Button = null;

    private _filterState: ReportFilterState = new ReportFilterState();
    private _autoMarkReadSkipFrames = 0;

    private readonly buttonLabelActiveColor: Color = new Color("433824");
    private readonly buttonLabelGrayColor: Color = new Color("817674");

    public override get typeName(): string {
        return "BattleReportsUI";
    }

    public refreshUI() {
        this._refreshFilterGroup();

        for (const item of this._reportUiItems) {
            item.node.destroy();
        }
        this._reportUiItems = [];

        const reports = this._getReportsFiltered();
        if (!reports)
            return;

        // traverse backwards to display later report first
        for (let i = reports.length - 1; i >= 0; i--) {
            const report = reports[i];
            let uiItem: BattleReportListItemUI;
            switch (report.type) {
                case BattleReportType.Fight:
                    uiItem = instantiate(this._fightTypeItemTemplate).getComponent(BattleReportListItemUI);
                    break;
                case BattleReportType.Mining:
                    uiItem = instantiate(this._miningTypeItemTemplate).getComponent(BattleReportListItemUI);
                    break;
                case BattleReportType.Exploring:
                    uiItem = instantiate(this._exploreTypeItemTemplate).getComponent(BattleReportListItemUI);
                    break;
                default:
                    console.error(`Unknown report type: ${report.type}`);
                    continue;
            }

            this._reportUiItems.push(uiItem);
            uiItem.initWithReportData(report);
            uiItem.node.setParent(this._fightTypeItemTemplate.parent);
            uiItem.node.active = true;
        }
    }

    public refreshUIWithKeepScrollPosition(){
        // save scroll state
        const scrollOffsetBefore = this._reportListScrollView.getScrollOffset();
        const layoutComp = this._fightTypeItemTemplate.parent.getComponent(Layout);
        const scrollViewContentHeightBefore = layoutComp.getComponent(UITransform).height;

        this.refreshUI();
        layoutComp.updateLayout();

        // restore scroll position and keep the position of items on screen
        const heightDiff = layoutComp.getComponent(UITransform).height - scrollViewContentHeightBefore;
        if (heightDiff > 0) {
            this._reportListScrollView.stopAutoScroll();
            this._reportListScrollView.scrollToOffset(scrollOffsetBefore.add2f(0, heightDiff));
        }
    }

    onLoad(): void {
        this._fightTypeItemTemplate = this.node.getChildByPath('frame/ScrollView/view/content/fightTypeItemTemplate');
        this._fightTypeItemTemplate.active = false;
        this._miningTypeItemTemplate = this.node.getChildByPath('frame/ScrollView/view/content/miningTypeItemTemplate');
        this._miningTypeItemTemplate.active = false;
        this._exploreTypeItemTemplate = this.node.getChildByPath('frame/ScrollView/view/content/exploreTypeItemTemplate');
        this._exploreTypeItemTemplate.active = false;

        const filterGroupRoot = this.node.getChildByPath('frame/navbar/reportTypeFilterGroup');
        this._typeFilterButtons = filterGroupRoot.children.map(node => node.getComponent(Button));
        this._pendingButton = this.node.getChildByPath('frame/pendingButton').getComponent(Button);
        this._initFilterGroup();

        this._deleteReadReportsButton = this.node.getChildByPath('frame/deleteReadButton').getComponent(Button);
        this._deleteReadReportsButton.node.on(Button.EventType.CLICK, this._onClickDeleteReadReports, this);
        this._markAllAsReadButton = this.node.getChildByPath('frame/markAllAsReadButton').getComponent(Button);
        this._markAllAsReadButton.node.on(Button.EventType.CLICK, this._onClickMarkAllAsRead, this);

        this._reportListScrollView = this.node.getChildByPath('frame/ScrollView').getComponent(ScrollView);
    }

    update(_deltaTime: number) {
        this._autoMarkRead();
    }

    private _autoMarkRead() {
        // Extra spare frame for engine to doing the layout correctly,
        // otherwise this will mark all the reports as read.
        if (this._autoMarkReadSkipFrames > 0) {
            this._autoMarkReadSkipFrames--;
            return;
        }
        // Mark report as read when center of the item UI is visible.
        const mask = this._reportListScrollView.node.getChildByName('view').getComponent(Mask);
        let changed = 0;

        for (const reportUiItem of this._reportUiItems) {
            if (reportUiItem.report.unread) {
                const boundingBox = reportUiItem.getComponent(UITransform).getBoundingBoxToWorld();
                if (mask.isHit(boundingBox.center)) {
                    reportUiItem.report.unread = false;
                    changed++;
                }
            }
        }
        if (changed) {
            // console.log(`BattleReportsUI auto mark ${changed} reports.`);
            BattleReportsMgr.Instance.saveData();
        }
    }

    private _onClickMarkAllAsRead() {
        BattleReportsMgr.Instance.markAllAsRead();
        this.refreshUI();
    }

    private _onClickDeleteReadReports() {
        BattleReportsMgr.Instance.deleteReadReports();
        this.refreshUI();
    }

    protected onEnable() {
        BattleReportsMgr.Instance.addObserver(this);

        // Select filter tab "All" every time enter the reports UI.
        this._filterState.filterType = ReportsFilterType.None;
        this.refreshUI();

        this._autoMarkReadSkipFrames = 1;
    }

    protected onDisable() {
        BattleReportsMgr.Instance.removeObserver(this);
    }

    //#region filter group methods
    private _initFilterGroup() {
        // register events

        // button: All
        this._typeFilterButtons[0].node.on(Button.EventType.CLICK, () => {
            this._filterState.filterType = ReportsFilterType.None;
            this.refreshUI();
        }, this);

        // button: Fight/Mining/...
        // same index as enum BattleReportType
        for (let i = 1; i < this._typeFilterButtons.length; i++) {
            const iCopy = i;
            this._typeFilterButtons[i].node.on(Button.EventType.CLICK, () => {
                this._filterState.filterType = ReportsFilterType.ReportType;
                this._filterState.reportType = iCopy;
                this.refreshUI();
            }, this);
        }

        // button: Pending
        this._pendingButton.node.on(Button.EventType.CLICK, () => {
            this._filterState.filterType = ReportsFilterType.Pending;
            this.refreshUI();
        }, this);
    }

    private _refreshFilterGroup() {
        const filterType = this._filterState.filterType;

        const filterAllActive = filterType == ReportsFilterType.None;
        this._typeFilterButtons[0].interactable = !filterAllActive;
        this._typeFilterButtons[0].getComponentInChildren(Label).color = filterAllActive ? this.buttonLabelActiveColor : this.buttonLabelGrayColor;

        const typeFilterCurrentIndex = filterType == ReportsFilterType.ReportType ? this._filterState.reportType : -1;
        for (let i = 1; i < this._typeFilterButtons.length; i++) {
            const active = i == typeFilterCurrentIndex;
            this._typeFilterButtons[i].interactable = !active;
            this._typeFilterButtons[i].getComponentInChildren(Label).color = active ? this.buttonLabelActiveColor : this.buttonLabelGrayColor;
        }

        const filterPendingActive = filterType == ReportsFilterType.Pending;
        this._pendingButton.interactable = !filterPendingActive;
        this._pendingButton.getComponentInChildren(Label).color = filterPendingActive ? this.buttonLabelActiveColor : this.buttonLabelGrayColor;
    }

    private _getReportsFiltered() {
        const reports = BattleReportsMgr.Instance.getReports();
        if (!reports) {
            return [];
        }

        switch (this._filterState.filterType) {
            case ReportsFilterType.None:
                return reports;
            case ReportsFilterType.ReportType:
                return reports.filter(item => item.type === this._filterState.reportType);
            case ReportsFilterType.Pending:
                return reports.filter(item => BattleReportsMgr.isReportPending(item));
            default:
                console.error(`Unsupported filterType ${this._filterState.filterType}`);
        }
    }

    //#endregion

    //---------------------------------------------------
    // action
    onTapClose() {
        this.show(false);
    }

    public onBattleReportListChanged() {
        this.scheduleOnce(this.refreshUIWithKeepScrollPosition);
    }
}

