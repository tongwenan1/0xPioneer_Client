import { CountDataMgr } from "./Save/CountDataMgr";
import { ArtifactDataMgr } from "./Save/ArtifactDataMgr";
import { EraseShadowDataMgr } from "./Save/EraseShadowDataMgr";
import { MapBuildingDataMgr } from "./Save/MapBuildingDataMgr";
import { PioneersDataMgr } from "./Save/PioneersDataMgr";

export class SaveData {
    private _pioneersDataMgr: PioneersDataMgr;
    private _eraseShadowDataMgr: EraseShadowDataMgr;
    private _mapBuildingDataMgr: MapBuildingDataMgr;
    private _countDataMgr: CountDataMgr;
    private _artifactDataMgr: ArtifactDataMgr;
    // private _itemDataMgr: ItemDataMgr;

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

    public get artifact() {
        return this._artifactDataMgr;
    }

    // public get item() {
    //     return this._itemDataMgr;
    // }

    constructor() {
        this._pioneersDataMgr = new PioneersDataMgr();
        this._eraseShadowDataMgr = new EraseShadowDataMgr();
        this._mapBuildingDataMgr = new MapBuildingDataMgr();
        this._countDataMgr = new CountDataMgr();
        this._artifactDataMgr = new ArtifactDataMgr();
        // this._itemDataMgr = new ItemDataMgr();
    }

    public async load() {
        await this._pioneersDataMgr.loadObj();
        await this._eraseShadowDataMgr.loadObj();
        await this._mapBuildingDataMgr.loadObj();
        await this._countDataMgr.loadObj();
        await this._artifactDataMgr.loadObj();
        // await this._itemDataMgr.loadObj();
    }
    public async save() {
        await this._eraseShadowDataMgr.saveObj();
        await this._mapBuildingDataMgr.saveObj();
        await this._pioneersDataMgr.saveObj();
        await this._countDataMgr.saveObj();
        await this._artifactDataMgr.saveObj();
        // await this._itemDataMgr.saveObj();
    }
}
