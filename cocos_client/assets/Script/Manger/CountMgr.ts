import Config from "../Const/Config";
import { CountModel } from "../Const/Count";
import CLog from "../Utils/CLog";

export default class CountMgr {
    private _localStorageKey = "localCount";
    private _counts: CountModel[] = [];

    public constructor() { }

    public initData() {
        const jsonStr = localStorage.getItem(this._localStorageKey);
        if (jsonStr) {
            try {
                this._counts = JSON.parse(jsonStr);
                return true;
            } catch (e) {
                CLog.error("CountMgr initData error", e);
                return false;
            }
        }
        return true;
    }

    public addNewCount(count: CountModel) {
        this._counts.push(count);
        if (Config.canSaveLocalData) {
            localStorage.setItem(this._localStorageKey, JSON.stringify(this._counts));
        }
    }
}
