import NotificationMgr from "../Basic/NotificationMgr";
import ConfigConfig from "../Config/ConfigConfig";
import EventConfig from "../Config/EventConfig";
import Config, { BattleReportMaxKeepDaysParam, BattleReportMaxKeepRecordsParam, ConfigType } from "../Const/Config";
import BattleReportsMgrDefine, { BattleReportRecord, BattleReportType } from "../Const/BattleReport";
import { NotificationName } from "../Const/Notification";
import GlobalData from "../Data/GlobalData";

export default class BattleReportsMgr {
    private _storage: BattleReportRecord[];
    private readonly LOCAL_STORAGE_KEY: string = 'local_battle_reports';

    public get unreadCount(): number {
        return this._storage.filter(record => record.unread).length;
    }

    public get emergencyCount(): number {
        return this._storage
            .filter(report => BattleReportsMgrDefine.isReportPending(report) && report.unread)
            .length;
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
        if (Config.canSaveLocalData) {
            localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this._storage));
        }
        NotificationMgr.triggerEvent(NotificationName.BATTLE_REPORT_LIST_CHANGED);
    }

    private _loadData() {
        const str = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        this._storage = str ? JSON.parse(str) : [];
    }

    private _registerEvents() { 
        NotificationMgr.addListener(NotificationName.FIGHT_FINISHED, this.onFightFinished, this);
        NotificationMgr.addListener(NotificationName.MINING_FINISHED, this.onMiningFinished, this);
        NotificationMgr.addListener(NotificationName.EVENT_STEPEND, this.onEventStepEnd, this);
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
        const maxKeepRecords = (ConfigConfig.getConfig(ConfigType.BattleReportMaxKeepRecords) as BattleReportMaxKeepRecordsParam).maxKeepRecords;
        if (this._storage.length > maxKeepRecords) {
            console.log(`BattleReport: auto delete ${this._storage.length - maxKeepRecords} records, reason: maxKeepRecords`);
            this._storage = this._storage.slice(this._storage.length - maxKeepRecords);
            if (save) {
                this.saveData();
            }
        }
    }

    private _autoDeleteWithMaxKeepDays(save: boolean = true) {
        const maxKeepDays = (ConfigConfig.getConfig(ConfigType.BattleReportMaxKeepDays) as BattleReportMaxKeepDaysParam).maxKeepDays;
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

    private onEventStepEnd(args: any): void {
        // console.log(`onBranchEventStepEnd. eventId: ${currentEventId}, hasNext: ${hasNextStep}`);

        const currentEventId: string = args[0];
        const hasNextStep: boolean = args[1];
        
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

        const activeEventState = GlobalData.latestActiveEventState;
        this._pushReport(BattleReportType.Exploring, {
            pioneerId: activeEventState.pioneerId,
            eventId: currentEventId,
            buildingId: activeEventState.buildingId,
            hasNextStep: hasNextStep,
            nextStepFinished: false,
            rewards: EventConfig.getRewards(currentEventId),
        });
    }
    //#endregion

    public constructor() {
        this._registerEvents();
    }
}
