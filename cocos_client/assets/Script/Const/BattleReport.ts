import { EVENT_STEPEND_DATA } from "./Event";
import { FIGHT_FINISHED_DATA, MINING_FINISHED_DATA } from "./PioneerDefine";

export enum BattleReportType {
    Fight = 1,
    Mining = 2,
    Exploring,
}
export enum ReportsFilterType {
    None,
    ReportType,
    Pending,
}

export interface BattleReportData {
    type: BattleReportType;
    timestamp: number;
    unread: boolean;
    data: FIGHT_FINISHED_DATA | MINING_FINISHED_DATA | BattleReportExploringData;
}
export interface BattleReportExploringData {
    pioneerId: string;
    eventId: string;
    buildingId: string;
    hasNextStep: boolean;
    nextStepFinished: boolean;
    rewards: { id: string; num: number }[];
}

export interface LocationInfo {
    type: "pos" | "building";
    buildingId?: string;
    pos?: { x: number; y: number };
}

export class ReportFilterState {
    public filterType: ReportsFilterType = ReportsFilterType.None;
    public reportType: BattleReportType = null;
}

// export default class BattleReportsMgrDefine {
//     public static isReportPending(report: BattleReportData): boolean {
//         return report.type === BattleReportType.Exploring && report.data.hasNextStep && !report.data.nextStepFinished;
//     }
// }

export interface ActiveEventState {
    /** current event id */
    eventId: string;
    prevEventId: string;
    pioneerId: string;
    buildingId: string;
}
