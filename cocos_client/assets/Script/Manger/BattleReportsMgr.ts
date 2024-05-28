import NotificationMgr from "../Basic/NotificationMgr";
import EventConfig from "../Config/EventConfig";
import { NotificationName } from "../Const/Notification";
import { FIGHT_FINISHED_DATA, MINING_FINISHED_DATA } from "../Const/PioneerDefine";
import { DataMgr } from "../Data/DataMgr";
import { EVENT_STEPEND_DATA } from "../Const/Event";
import ConfigConfig from "../Config/ConfigConfig";
import { BattleReportMaxKeepDaysParam, BattleReportMaxKeepRecordsParam, ConfigType } from "../Const/Config";

export default class BattleReportsMgr {
    private _maxKeepRecords: number;
    private _maxKeepDays: number;

    public constructor() {}

    public init() {
        this._maxKeepRecords = (ConfigConfig.getConfig(ConfigType.BattleReportMaxKeepRecords) as BattleReportMaxKeepRecordsParam).maxKeepRecords;
        this._maxKeepDays = (ConfigConfig.getConfig(ConfigType.BattleReportMaxKeepDays) as BattleReportMaxKeepDaysParam).maxKeepDays;
        
        NotificationMgr.addListener(NotificationName.FIGHT_FINISHED, this.onFightFinished, this);
        NotificationMgr.addListener(NotificationName.MINING_FINISHED, this.onMiningFinished, this);
        NotificationMgr.addListener(NotificationName.EVENT_STEPEND, this.onEventStepEnd, this);
    }

    private autoClearData() {
        if (this._maxKeepRecords) {
            DataMgr.s.battleReport.deleteWithMaxKeepRecords(this._maxKeepRecords);
        }

        if (this._maxKeepDays) {
            DataMgr.s.battleReport.deleteWithMaxKeepDays(this._maxKeepDays);
        }
    }

    private onFightFinished(args: FIGHT_FINISHED_DATA) {
        DataMgr.s.battleReport.addObj_fight(args);
        this.autoClearData();
        DataMgr.s.battleReport.saveObj();
    }
    private onMiningFinished(args: MINING_FINISHED_DATA) {
        DataMgr.s.battleReport.addObj_mining(args);
        this.autoClearData();
        DataMgr.s.battleReport.saveObj();
    }
    private onEventStepEnd(args: EVENT_STEPEND_DATA): void {
        DataMgr.s.battleReport.check_prev_report_state();
        DataMgr.s.battleReport.addObj_exploring({
            pioneerId: args.pioneerId,
            eventId: args.eventId,
            buildingId: args.buildingId,
            hasNextStep: args.hasNextStep,
            nextStepFinished: false,
            rewards: EventConfig.getRewards(args.eventId),
        });
        DataMgr.s.battleReport.saveObj();
    }
}
