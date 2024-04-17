import { CountDataMgr } from "./Save/CountDataMgr";
import { EraseShadowDataMgr } from "./Save/EraseShadowDataMgr";
import { MapBuildingDataMgr } from "./Save/MapBuildingDataMgr";
import { PioneersDataMgr } from "./Save/PioneersDataMgr";

export class SaveData {
    private _pioneersDataMgr: PioneersDataMgr;
    private _eraseShadowDataMgr: EraseShadowDataMgr;
    private _mapBuildingDataMgr: MapBuildingDataMgr;
    private _countDataMgr: CountDataMgr;

    public get pioneer() {
        return this._pioneersDataMgr;
    }

    public get eraseShadow() {
        return this._eraseShadowDataMgr;
    }

    public get mapBuilding() {
        return this._mapBuildingDataMgr;
    }

    public get count() {
        return this._countDataMgr;
    }

    constructor() {
        this._pioneersDataMgr = new PioneersDataMgr();
        this._eraseShadowDataMgr = new EraseShadowDataMgr();
        this._mapBuildingDataMgr = new MapBuildingDataMgr();
        this._countDataMgr = new CountDataMgr();
    }

    public async load() {
        await this._pioneersDataMgr.loadObj();
        await this._eraseShadowDataMgr.loadObj();
        await this._mapBuildingDataMgr.loadObj();
        await this._countDataMgr.loadObj();
    }
    public async save() {
        await this._eraseShadowDataMgr.saveObj();
        await this._mapBuildingDataMgr.saveObj();
        await this._pioneersDataMgr.saveObj();
        await this._countDataMgr.saveObj();
    }
}
