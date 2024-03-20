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

export interface BattleReportsEvent {
    onBattleReportListChanged?(): void;
}

export default class BattleReportsMgrDefine {
    public static isReportPending(report: BattleReportRecord): boolean {
        return report.type === BattleReportType.Exploring && report.data.hasNextStep && !report.data.nextStepFinished;
    }
}