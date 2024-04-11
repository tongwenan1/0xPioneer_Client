import { PioneersDataMgr } from "./Save/PioneersDataMgr";

export class SaveData {
    private _pioneersDataMgr: PioneersDataMgr;


    public get pioneers() {
        return this._pioneersDataMgr;
    }
    constructor() {
        this._pioneersDataMgr = new PioneersDataMgr();
    }

}