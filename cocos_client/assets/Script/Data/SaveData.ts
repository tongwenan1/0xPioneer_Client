import { EraseShadowDataMgr } from "./Save/EraseShadowDataMgr";
import { MapBuildingDataMgr } from "./Save/MapBuildingDataMgr";
import { PioneersDataMgr } from "./Save/PioneersDataMgr";

export class SaveData {
    private _pioneersDataMgr: PioneersDataMgr;
    private _eraseShadowDataMgr: EraseShadowDataMgr;
    private _mapBuildingDataMgr: MapBuildingDataMgr;

    public get pioneers() {
        return this._pioneersDataMgr;
    }

    public get eraseShadow() {
        return this._eraseShadowDataMgr;
    }

    public get mapBuilding() {
        return this._mapBuildingDataMgr;
    }

    constructor() {
        this._pioneersDataMgr = new PioneersDataMgr();
        this._eraseShadowDataMgr = new EraseShadowDataMgr();
        this._mapBuildingDataMgr = new MapBuildingDataMgr();
    }

    public async load() {
        // await this._pioneersDataMgr.load();
        await this._eraseShadowDataMgr.loadObj();
        await this._mapBuildingDataMgr.loadObj();
    }
    public async save() {
        // await this._pioneersDataMgr.save();
        await this._eraseShadowDataMgr.saveObj();
        await this._mapBuildingDataMgr.saveObj();
    }
}
