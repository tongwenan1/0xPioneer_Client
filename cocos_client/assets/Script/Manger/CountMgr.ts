export enum CountType {
    actionPioneer = "actionPioneer",
    actionBuilding = "actionBuilding",
    openBox = "openBox",
    selectDialog = "selectDialog",
    showEvent = "showEvent",
    buildInnerBuilding = "buildInnerBuilding",
    generateTroops = "generateTroops",
    useItem = "useItem",
}


export interface CountModel {
    type: CountType;
    timeStamp: number;
    data: any;
}

export default class CountMgr {
    public static get instance() {
        if (!this._instance) {
            this._instance = new CountMgr();
        }
        return this._instance;
    }

    public addNewCount(count: CountModel) {
        this._counts.push(count);
        localStorage.setItem("localCount", JSON.stringify(this._counts));
    }


    private static _instance: CountMgr = null;
    private _counts: CountModel[] = null;
    public constructor() {
        this._counts = [];

        const localCounts = localStorage.getItem("localCount");
        if (localCounts != null) {
            this._counts = JSON.parse(localCounts);
        }
    }
}