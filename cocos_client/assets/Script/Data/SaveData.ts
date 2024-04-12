import { EraseShadowDataMgr } from "./Save/EraseShadowDataMgr";
import { PioneersDataMgr } from "./Save/PioneersDataMgr";

export class SaveData {
    private _pioneersDataMgr: PioneersDataMgr;
    private _eraseShadowDataMgr: EraseShadowDataMgr;

    public get pioneers() {
        return this._pioneersDataMgr;
    }

    public get eraseShadow() {
        return this._eraseShadowDataMgr;
    }

    constructor() {
        this._pioneersDataMgr = new PioneersDataMgr();
        this._eraseShadowDataMgr = new EraseShadowDataMgr();
    }

    public async load() {
        // await this._pioneersDataMgr.load();
        await this._eraseShadowDataMgr.loadObj();
    }
    public async save() {
        // await this._pioneersDataMgr.save();
        await this._eraseShadowDataMgr.saveObj();
    }
}
