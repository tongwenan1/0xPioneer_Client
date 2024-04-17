import { CountDataMgr } from "./Save/CountDataMgr";
import { ArtifactDataMgr } from "./Save/ArtifactDataMgr";
import { EraseShadowDataMgr } from "./Save/EraseShadowDataMgr";
import { MapBuildingDataMgr } from "./Save/MapBuildingDataMgr";
import { PioneersDataMgr } from "./Save/PioneersDataMgr";
import { BattleReportDataMgr } from "./Save/BattleReportDataMgr";
import { ItemDataMgr } from "./Save/ItemDataMgr";
import { SettlementDataMgr } from "./Save/SettlementDataMgr";
// import { UserDataMgr } from "./Save/UserDataMgr";

export class SaveData {
    private _pioneersDataMgr: PioneersDataMgr;
    private _eraseShadowDataMgr: EraseShadowDataMgr;
    private _mapBuildingDataMgr: MapBuildingDataMgr;
    private _countDataMgr: CountDataMgr;
    private _artifactDataMgr: ArtifactDataMgr;
    private _battleReportDataMgr: BattleReportDataMgr;
    private _itemDataMgr: ItemDataMgr;
    private _settlementDataMgr: SettlementDataMgr
    // private _userDataMgr: UserDataMgr

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

    public get item() {
        return this._itemDataMgr;
    }

    public get battleReport() {
        return this._battleReportDataMgr;
    }

    public get settlement() {
        return this._settlementDataMgr;
    }

    // public get user() {
    //     return this._userDataMgr;
    // }

    constructor() {
        this._pioneersDataMgr = new PioneersDataMgr();
        this._eraseShadowDataMgr = new EraseShadowDataMgr();
        this._mapBuildingDataMgr = new MapBuildingDataMgr();
        this._countDataMgr = new CountDataMgr();
        this._artifactDataMgr = new ArtifactDataMgr();
        this._battleReportDataMgr = new BattleReportDataMgr();
        this._itemDataMgr = new ItemDataMgr();
        this._settlementDataMgr = new SettlementDataMgr();
        // this._userDataMgr = new UserDataMgr();
    }

    public async load() {
        await this._pioneersDataMgr.loadObj();
        await this._eraseShadowDataMgr.loadObj();
        await this._mapBuildingDataMgr.loadObj();
        await this._countDataMgr.loadObj();
        await this._artifactDataMgr.loadObj();
        await this._battleReportDataMgr.loadObj();
        await this._itemDataMgr.loadObj();
        await this._settlementDataMgr.loadObj();
        // await this._userDataMgr.loadObj();
    }
    public async save() {
        await this._eraseShadowDataMgr.saveObj();
        await this._mapBuildingDataMgr.saveObj();
        await this._pioneersDataMgr.saveObj();
        await this._countDataMgr.saveObj();
        await this._artifactDataMgr.saveObj();
        await this._battleReportDataMgr.saveObj();
        await this._itemDataMgr.saveObj();
        await this._settlementDataMgr.saveObj();
        // await this._userDataMgr.saveObj();
    }
}
