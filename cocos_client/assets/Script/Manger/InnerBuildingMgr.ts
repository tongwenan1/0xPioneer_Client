import { resources } from "cc";

export default class InnerBuildingMgr {

    public getInfoById(infoId: string) {
        if (this._innerBuildingData.hasOwnProperty(infoId)) {
            return this._innerBuildingData[infoId];
        }
        return null;
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new InnerBuildingMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public constructor() {

    }

    private static _instance: InnerBuildingMgr = null;
    private _innerBuildingData: any = null;
    private async _initData() {
        const obj = await new Promise((resolve) => {
            resources.load("data_local/inner_building", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        })
        this._innerBuildingData = obj;
    }
}