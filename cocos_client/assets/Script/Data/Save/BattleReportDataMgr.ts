import NotificationMgr from "../../Basic/NotificationMgr";
import { BattleReportData, BattleReportExploringData, BattleReportType } from "../../Const/BattleReport";
import { NotificationName } from "../../Const/Notification";
import { FIGHT_FINISHED_DATA, MINING_FINISHED_DATA } from "../../Const/PioneerDefine";
import CLog from "../../Utils/CLog";

export class BattleReportDataMgr {
    private _data: BattleReportData[];

    private _baseKey: string = "local_battle_reports";
    private _key = "";

    public constructor() {}

    public async loadObj(walletAddr: string) {
        this._key = walletAddr + "|" + this._baseKey;
        if (this._data == null) {
            this._data = [];
            const data = localStorage.getItem(this._key);
            if (data) {
                this._data = JSON.parse(data) as BattleReportData[];
            }
        }
        CLog.debug("BattleReportDataMgr: loadObj, ", this._data);
    }

    public getObj() {
        return this._data;
    }

    private addObj(data: BattleReportData) {
        this._data.push(data);
    }
    public addObj_fight(args: FIGHT_FINISHED_DATA) {
        this.addObj({
            type: BattleReportType.Fight,
            timestamp: new Date().getTime(),
            unread: true,
            data: args,
        });
    }
    public addObj_mining(args: MINING_FINISHED_DATA) {
        this.addObj({
            type: BattleReportType.Mining,
            timestamp: new Date().getTime(),
            unread: true,
            data: args,
        });
    }
    public addObj_exploring(args: BattleReportExploringData) {
        this.addObj({
            type: BattleReportType.Exploring,
            timestamp: new Date().getTime(),
            unread: true,
            data: args,
        });
    }

    public async saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
        NotificationMgr.triggerEvent(NotificationName.BATTLE_REPORT_LIST_CHANGED);
    }

    public get unreadCount(): number {
        return this._data.filter((record) => record.unread).length;
    }
    public get emergencyCount(): number {
        return this._data.filter((report) => this.isReportPending(report) && report.unread).length;
    }

    public isReportPending(report: BattleReportData): boolean {
        if (report.type !== BattleReportType.Exploring) return false;

        const reportData = report.data as BattleReportExploringData;
        if (!reportData.hasNextStep) return false;
        if (reportData.nextStepFinished) return false;

        return true;
    }

    public deleteReadReports() {
        this._data = this._data.filter((item) => item.unread);
        this.saveObj();
    }

    public markAllAsRead() {
        for (const report of this._data) {
            report.unread = false;
        }
        this.saveObj();
    }

    public deleteWithMaxKeepRecords(maxKeepRecords: number) {
        if (this._data.length <= maxKeepRecords) return;
        CLog.warn(`BattleReportsMgr: deleteWithMaxKeepRecords, delete ${this._data.length - maxKeepRecords} records`);
        this._data = this._data.slice(this._data.length - maxKeepRecords);
    }

    public deleteWithMaxKeepDays(maxKeepDays: number) {
        const expireBeforeThisTime = Date.now() - maxKeepDays * 86400 * 1000;
        // find first index to keep.
        // requires data in array in ascending order
        const firstIndexToKeep = this._data.findIndex((item) => item.timestamp >= expireBeforeThisTime);
        if (firstIndexToKeep > 0) {
            CLog.warn(`BattleReportsMgr: deleteWithMaxKeepDays, delete ${firstIndexToKeep} records`);
            this._data = this._data.slice(firstIndexToKeep);
        }
    }

    public check_prev_report_state() {
        // change state of prev report.
        // not very strict association check it's ok cause we don't have parallel events for now.
        for (let i = this._data.length - 1; i >= 0; i--) {
            // reverse find
            const item = this._data[i];
            if (item.type != BattleReportType.Exploring) continue;

            const itemData = item.data as BattleReportExploringData;
            if (itemData.hasNextStep && !itemData.nextStepFinished) {
                itemData.nextStepFinished = true;
                break;
            }
        }
    }
}
