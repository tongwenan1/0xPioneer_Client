import { CountDataMgr } from "./Save/CountDataMgr";
import { ArtifactDataMgr } from "./Save/ArtifactDataMgr";
import { EraseShadowDataMgr } from "./Save/EraseShadowDataMgr";
import { MapBuildingDataMgr } from "./Save/MapBuildingDataMgr";
import { PioneersDataMgr } from "./Save/PioneersDataMgr";
import { BattleReportDataMgr } from "./Save/BattleReportDataMgr";
import { ItemDataMgr } from "./Save/ItemDataMgr";
import { SettlementDataMgr } from "./Save/SettlementDataMgr";
import UserInfoDataMgr from "./Save/UserInfoDataMgr";
import TaskDataMgr from "./Save/TaskDataMgr";
import NFTPioneerDataMgr from "./Save/NFTPioneerDataMgr";

export class SaveData {
    private _pioneersDataMgr: PioneersDataMgr;
    private _nftPioneerDataMgr: NFTPioneerDataMgr;
    private _eraseShadowDataMgr: EraseShadowDataMgr;
    private _mapBuildingDataMgr: MapBuildingDataMgr;
    private _countDataMgr: CountDataMgr;
    private _artifactDataMgr: ArtifactDataMgr;
    private _battleReportDataMgr: BattleReportDataMgr;
    private _itemDataMgr: ItemDataMgr;
    private _settlementDataMgr: SettlementDataMgr;
    private _userInfoDataMgr: UserInfoDataMgr;
    private _taskDataMgr: TaskDataMgr;

    public get pioneer() {
        return this._pioneersDataMgr;
    }

    public get nftPioneer() {
        return this._nftPioneerDataMgr;
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

    public get userInfo() {
        return this._userInfoDataMgr;
    }

    public get task() {
        return this._taskDataMgr;
    }

    constructor() {
        this._pioneersDataMgr = new PioneersDataMgr();
        this._nftPioneerDataMgr = new NFTPioneerDataMgr();
        this._eraseShadowDataMgr = new EraseShadowDataMgr();
        this._mapBuildingDataMgr = new MapBuildingDataMgr();
        this._countDataMgr = new CountDataMgr();
        this._artifactDataMgr = new ArtifactDataMgr();
        this._battleReportDataMgr = new BattleReportDataMgr();
        this._itemDataMgr = new ItemDataMgr();
        this._settlementDataMgr = new SettlementDataMgr();
        this._userInfoDataMgr = new UserInfoDataMgr();
        this._taskDataMgr = new TaskDataMgr();
    }

    public async load(walletAddr: string) {
        await this._pioneersDataMgr.loadObj(walletAddr);
        await this._nftPioneerDataMgr.loadObj(walletAddr);
        await this._eraseShadowDataMgr.loadObj(walletAddr);
        await this._mapBuildingDataMgr.loadObj(walletAddr);
        await this._countDataMgr.loadObj(walletAddr);
        await this._artifactDataMgr.loadObj(walletAddr);
        await this._battleReportDataMgr.loadObj(walletAddr);
        await this._itemDataMgr.loadObj(walletAddr);
        await this._settlementDataMgr.loadObj(walletAddr);
        // await this._userInfoDataMgr.loadObj(walletAddr, null);
        await this._taskDataMgr.loadObj(walletAddr);
    }
    public async save() {
        await this._eraseShadowDataMgr.saveObj();
        await this._mapBuildingDataMgr.saveObj();
        await this._pioneersDataMgr.saveObj();
        await this._nftPioneerDataMgr.saveObj();
        await this._countDataMgr.saveObj();
        await this._artifactDataMgr.saveObj();
        await this._battleReportDataMgr.saveObj();
        await this._itemDataMgr.saveObj();
        await this._settlementDataMgr.saveObj();
        await this._userInfoDataMgr.saveObj();
        await this._taskDataMgr.saveObj();
    }
}
