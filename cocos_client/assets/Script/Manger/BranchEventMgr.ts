import { resources } from "cc";
import { ActiveEventState, BranchEventMgrEvent } from "../Const/Manager/BrachEventMgrDefine";

export default class BranchEventMgr {
    private _observers: BranchEventMgrEvent[] = [];
    public latestActiveEventState: ActiveEventState = new ActiveEventState();

    public getEventById(eventId: string) {
        return this._events.filter((event)=> {
            return event.id == eventId;
        });
    }

    /** get item type rewards only, used for display */
    public getEventItemRewards(eventId: string): { id: string, num: number }[] {
        const event: { reward: any } = this._events.find(event => event.id == eventId);
        if (!event.reward) {
            return [];
        }

        return event.reward
            .filter((item: any) => item != null)
            .filter(([type, _id, _num]) => type == 1)
            .map(([_type, id, num]) => ({id: id, num: num}));
    }

    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private _events: any[] = null;
    private async _initData() {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/event", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        })
        this._events = [];
        for (const key in obj) {
            this._events.push(obj[key]);
        }
    }

    //#region event
    public addObserver(observer: BranchEventMgrEvent) {
        this._observers.push(observer);
    }
    public removeObserver(observer: BranchEventMgrEvent) {
        const index: number = this._observers.indexOf(observer);
        if (index != -1) {
            this._observers.splice(index, 1);
        }
    }
    public fireOnBranchEventStepEnd(currentEventId: string, hasNextStep: boolean){
        for (const observe of this._observers) {
            if (observe.onBranchEventStepEnd != null) {
                observe.onBranchEventStepEnd(currentEventId, hasNextStep);
            }
        }
    }
    //#endregion
}