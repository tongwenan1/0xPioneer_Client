export enum BattleReportType {
    Fight = 1,
    Mining = 2,
    Exploring,
}

export class BattleReportRecord {
    type: BattleReportType;
    timestamp: number;
    data: any;
    unread: boolean;
}

export class LocationInfo {
    type: "pos" | "building";
    buildingId?: string;
    pos?: { x: number, y: number };
}

export enum ReportsFilterType {
    None,
    ReportType,
    Pending,
}

export class ReportFilterState {
    public filterType: ReportsFilterType = ReportsFilterType.None;
    public reportType: BattleReportType = null;
}

export default class BattleReportsMgrDefine {
    public static isReportPending(report: BattleReportRecord): boolean {
        return report.type === BattleReportType.Exploring && report.data.hasNextStep && !report.data.nextStepFinished;
    }
}