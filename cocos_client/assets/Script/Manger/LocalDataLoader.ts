import { ArtifactMgr, BattleReportsMgr, BoxMgr, BranchEventMgr, BuildingMgr, ConfigMgr, DropMgr, EvaluationMgr, InnerBuildingMgr, ItemMgr, LanMgr, LvlupMgr, PioneerMgr, TalkMgr, TaskMgr, UserInfoMgr } from "../Utils/Global";

export default class LocalDataLoader {

    public async loadLocalDatas() {
        this._loadStatus = 1;
        this._importSaveOnStartIfExists();

        await LanMgr.initData();
        await BranchEventMgr.initData();
        await DropMgr.initData();
        await BoxMgr.initData();
        await InnerBuildingMgr.initData();
        await TalkMgr.initData();
        await UserInfoMgr.initData();
        await BuildingMgr.initData();
        await TaskMgr.initData();
        await PioneerMgr.initData();
        await ItemMgr.initData();
        await ConfigMgr.initData();
        await BattleReportsMgr.initData();
        await LvlupMgr.initData();
        await ArtifactMgr.initData();
        await EvaluationMgr.initData();
        this._loadStatus = 2;
    }

    private _importSaveOnStartIfExists() {
        const saveToImport = localStorage.getItem("importSaveOnStart");
        if (saveToImport) {
            localStorage.removeItem("importSaveOnStart");
            const saveObj: {} = JSON.parse(saveToImport);
            localStorage.clear();
            for (const k in saveObj) {
                localStorage.setItem(k, saveObj[k]);
            }
            console.log("Import save data done.");
        }
    }

    /**
     * 0-noload 
     * 1-loading 
     * 2-loaded
     */
    public get loadStatus() {
        return this._loadStatus;
    }

    public set loadStatus(value) {
        this._loadStatus = value;
    }

    private _loadStatus: number = 0;
}