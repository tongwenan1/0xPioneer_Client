import CLog from "../Utils/CLog";
import { ArtifactMgr, AudioMgr, BattleReportsMgr, BuildingMgr, CountMgr, ItemMgr, LanMgr, PioneerMgr, TaskMgr, UserInfoMgr } from "../Utils/Global";
import ConfigMgr from "./ConfigMgr";

export default class LocalDataLoader {
    public async loadLocalDatas() {
        
        this._loadStatus = 1;
        this._importSaveOnStartIfExists();

        if (!await ArtifactMgr.initData()) return;
        if (!await CountMgr.initData()) return;
        if (!await LanMgr.initData()) return;

        await UserInfoMgr.initData();
        await BuildingMgr.initData();
        await TaskMgr.initData();
        await PioneerMgr.initData();
        await ItemMgr.initData();
        await BattleReportsMgr.initData();

        AudioMgr.prepareAudioSource();
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
            CLog.debug("Import save data done.");
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
