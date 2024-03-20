import { CountModel } from "../Const/Manager/CountMgrDefine";

export default class CountMgr {

    public addNewCount(count: CountModel) {
        this._counts.push(count);
        localStorage.setItem("localCount", JSON.stringify(this._counts));
    }


    private _counts: CountModel[] = null;
    public constructor() {
        this._counts = [];

        const localCounts = localStorage.getItem("localCount");
        if (localCounts != null) {
            this._counts = JSON.parse(localCounts);
        }
    }
}