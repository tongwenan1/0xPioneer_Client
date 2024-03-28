import ArtifactConfig from "../Config/ArtifactConfig";
import ArtifactEffectConfig from "../Config/ArtifactEffectConfig";
import BoxInfoConfig from "../Config/BoxInfoConfig";
import ConfigConfig from "../Config/ConfigConfig";
import DropConfig from "../Config/DropConfig";
import EvaluationConfig from "../Config/EvaluationConfig";
import InnerBuildingConfig from "../Config/InnerBuildingConfig";
import InnerBuildingLvlUpConfig from "../Config/InnerBuildingLvlUpConfig";
import LanConfig from "../Config/LanConfig";
import LvlupConfig from "../Config/LvlupConfig";
import TalkConfig from "../Config/TalkConfig";
import {
    ArtifactMgr,
    AudioMgr,
    BattleReportsMgr,
    BranchEventMgr,
    BuildingMgr,
    CountMgr,
    ItemMgr,
    LanMgr,
    PioneerMgr,
    TaskMgr,
    UserInfoMgr,
} from "../Utils/Global";

export default class LocalDataLoader {
    public async loadLocalDatas() {
        // load configs
        await ArtifactConfig.init();
        await ArtifactEffectConfig.init();
        await BoxInfoConfig.init();
        await ConfigConfig.init();
        await DropConfig.init();
        await EvaluationConfig.init();
        await LanConfig.init();
        await LvlupConfig.init();
        await InnerBuildingConfig.init();
        await InnerBuildingLvlUpConfig.init();
        await TalkConfig.init();

        this._loadStatus = 1;
        this._importSaveOnStartIfExists();

        await ArtifactMgr.initData();
        await CountMgr.initData();
        await LanMgr.initData();

        await BranchEventMgr.initData();
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
