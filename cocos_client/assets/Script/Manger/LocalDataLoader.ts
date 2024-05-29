import Config from "../Const/Config";
import CLog from "../Utils/CLog";
import { PioneerMgr } from "../Utils/Global";

export default class LocalDataLoader {
    public async loadLocalDatas() {
        this._importSaveOnStartIfExists();
        PioneerMgr.initData();
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
