import { resources } from "cc";

export default class TalkMgr {

    public getTalk(talkId: string) {
        if (this._talks[talkId] != null) {
            return this._talks[talkId];
        }
        return null;
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new TalkMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private static _instance: TalkMgr = null;
    private _talks: any = null;
    private async _initData() {
        const obj = await new Promise((resolve) => {
            resources.load("data_local/talk", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        })
        if (obj != null) {
            this._talks = obj;
        }
    }
}