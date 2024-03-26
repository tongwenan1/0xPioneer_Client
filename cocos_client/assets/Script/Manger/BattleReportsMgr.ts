import NotificationMgr from "../Basic/NotificationMgr";
import ConfigConfig from "../Config/ConfigConfig";
import { EventName } from "../Const/ConstDefine";
import { BattleReportRecord, BattleReportType, BattleReportsEvent } from "../Const/Manager/BattleReportsMgrDefine";
import { BranchEventMgrEvent } from "../Const/Manager/BrachEventMgrDefine";
import { BranchEventMgr } from "../Utils/Global";

export default class BattleReportsMgr implements BranchEventMgrEvent {
    private _storage: BattleReportRecord[];
    private readonly LOCAL_STORAGE_KEY: string = 'local_battle_reports';

    public get unreadCount(): number {
        return this._storage.filter(record => record.unread).length;
    }

    public getReports(): BattleReportRecord[] {
        return this._storage;
    }

    public async initData() {
        this._loadData();
    }

    private _pushReport(type: BattleReportType, args: any) {
        // console.log(`BattleReportsMgr._pushReport: ${BattleReportType[type]}`);
        this._storage.push({
            type: type,
            timestamp: new Date().getTime(),
            data: args,
            unread: true,
        });
        this._autoDelete(false);
        this.saveData();
    }

    saveData() {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this._storage));
        this._fireOnBattleReportListChanged();
    }

    private _loadData() {
        const str = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        this._storage = str ? JSON.parse(str) : [];
    }

    private _registerEvents() { 
        NotificationMgr.addListener(EventName.FIGHT_FINISHED, this.onFightFinished, this);
        NotificationMgr.addListener(EventName.MINING_FINISHED, this.onMiningFinished, this);
        BranchEventMgr.addObserver(this);
    }

    public deleteReadReports() {
        this._storage = this._storage.filter(item => item.unread);
        this.saveData();
    }

    public markAllAsRead() {
        for (const report of this._storage) {
            report.unread = false;
        }
        this.saveData();
    }

    public _autoDelete(save: boolean = true) {
        this._autoDeleteWithMaxKeepRecords(save);
        this._autoDeleteWithMaxKeepDays(save);
    }

    private _autoDeleteWithMaxKeepRecords(save: boolean = true) {
        const maxKeepRecords = ConfigConfig.getById("110002").para[0];
        if (this._storage.length > maxKeepRecords) {
            console.log(`BattleReport: auto delete ${this._storage.length - maxKeepRecords} records, reason: maxKeepRecords`);
            this._storage = this._storage.slice(this._storage.length - maxKeepRecords);
            if (save) {
                this.saveData();
            }
        }
    }

    private _autoDeleteWithMaxKeepDays(save: boolean = true) {
        const maxKeepDays = ConfigConfig.getById("110000").para[0];
        const expireBeforeThisTime = Date.now() - (maxKeepDays * 86400 * 1000);
        // find first index to keep.
        // requires data in array in ascending order
        const firstIndexToKeep = this._storage.findIndex(item => item.timestamp >= expireBeforeThisTime);
        if (firstIndexToKeep > 0) {
            console.log(`BattleReport: auto delete ${firstIndexToKeep} records, reason: maxKeepDays`);
            this._storage = this._storage.slice(firstIndexToKeep);
            if (save) {
                this.saveData();
            }
        }
    }


    //#region event callbacks

    public onFightFinished(args: any) {
        this._pushReport(BattleReportType.Fight, args);
    }

    public onMiningFinished(args: any) {
        this._pushReport(BattleReportType.Mining, args);
    }

    onBranchEventStepEnd(currentEventId: string, hasNextStep: boolean): void {
        // console.log(`onBranchEventStepEnd. eventId: ${currentEventId}, hasNext: ${hasNextStep}`);

        // change state of prev report.
        // not very strict association check it's ok cause we don't have parallel events for now.
        let prevReport: BattleReportRecord = null;
        for (let i = this._storage.length - 1; i >= 0; i--) { // reverse find
            const item = this._storage[i];
            if (item.type == BattleReportType.Exploring
                && item.data.hasNextStep && !item.data.nextStepFinished) {
                prevReport = item;
                break;
            }
        }
        if (prevReport) {
            prevReport.data.nextStepFinished = true;
        }

        const activeEventState = BranchEventMgr.latestActiveEventState;
        this._pushReport(BattleReportType.Exploring, {
            pioneerId: activeEventState.pioneerId,
            eventId: currentEventId,
            buildingId: activeEventState.buildingId,
            hasNextStep: hasNextStep,
            nextStepFinished: false,
            rewards: BranchEventMgr.getEventItemRewards(currentEventId),
        });
    }
    //#endregion

    //#region BattleReportsEvent stub
    private _observers: BattleReportsEvent[] = [];

    public addObserver(observer: BattleReportsEvent) {
        this._observers.push(observer);
    }

    public removeObserver(observer: BattleReportsEvent) {
        const index: number = this._observers.indexOf(observer);
        if (index != -1) {
            this._observers.splice(index, 1);
        }
    }

    private _fireOnBattleReportListChanged() {
        for (const observe of this._observers) {
            if (observe.onBattleReportListChanged != null) {
                observe.onBattleReportListChanged();
            }
        }
    }
    //#endregion
    public constructor() {
        this._registerEvents();
    }
}
