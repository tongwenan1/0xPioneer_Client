import { resources } from "cc";

export default class BranchEventMgr {

    public getEventById(eventId: string) {
        return this._events.filter((event)=> {
            return event.id == eventId;
        });
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new BranchEventMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private static _instance: BranchEventMgr = null;
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
}