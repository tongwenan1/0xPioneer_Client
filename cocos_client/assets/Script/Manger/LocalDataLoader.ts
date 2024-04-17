import Config from "../Const/Config";
import CLog from "../Utils/CLog";
import { ArtifactMgr, BattleReportsMgr, BuildingMgr, ItemMgr, LanMgr, PioneerDevelopMgr, PioneerMgr, TaskMgr, UserInfoMgr } from "../Utils/Global";

export default class LocalDataLoader {
    public async loadLocalDatas() {
        this._importSaveOnStartIfExists();

        await UserInfoMgr.initData();
        await BuildingMgr.initData();
        await TaskMgr.initData();
        await ItemMgr.initData();

        PioneerMgr.initData();
        PioneerDevelopMgr.initData();
    }

    private _importSaveOnStartIfExists() {
        const saveToImport = localStorage.getItem("importSaveOnStart");
        if (saveToImport) {
            localStorage.removeItem("importSaveOnStart");
            const saveObj: {} = JSON.parse(saveToImport);
            localStorage.clear();
            for (const k in saveObj) {
                if (Config.canSaveLocalData) {
                    localStorage.setItem(k, saveObj[k]);
                }
            }
            CLog.debug("Import save data done.");
        }
    }
}
