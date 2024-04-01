import ArtifactConfig from "../Config/ArtifactConfig";
import ArtifactEffectConfig from "../Config/ArtifactEffectConfig";
import BoxInfoConfig from "../Config/BoxInfoConfig";
import ConfigConfig from "../Config/ConfigConfig";
import DropConfig from "../Config/DropConfig";
import EvaluationConfig from "../Config/EvaluationConfig";
import EventConfig from "../Config/EventConfig";
import InnerBuildingConfig from "../Config/InnerBuildingConfig";
import InnerBuildingLvlUpConfig from "../Config/InnerBuildingLvlUpConfig";
import ItemConfig from "../Config/ItemConfig";
import LanConfig from "../Config/LanConfig";
import LvlupConfig from "../Config/LvlupConfig";
import TalkConfig from "../Config/TalkConfig";
import TaskConfig from "../Config/TaskConfig";
import TaskStepConfigData from "../Config/TaskStepConfig";

export default class ConfigMgr {
    public static async init(): Promise<boolean> {
        if (!(await ArtifactConfig.init())) return false;
        if (!(await ItemConfig.init())) return false;
        if (!(await ArtifactEffectConfig.init())) return false;
        if (!(await BoxInfoConfig.init())) return false;
        if (!(await ConfigConfig.init())) return false;
        if (!(await DropConfig.init())) return false;
        if (!(await EvaluationConfig.init())) return false;
        if (!(await EventConfig.init())) return false;
        if (!(await LanConfig.init())) return false;
        if (!(await LvlupConfig.init())) return false;
        if (!(await InnerBuildingConfig.init())) return false;
        if (!(await InnerBuildingLvlUpConfig.init())) return false;
        if (!(await TalkConfig.init())) return false;
        if (!(await TaskConfig.init())) return false;
        if (!(await TaskStepConfigData.init())) return false;

        return true;
    }
}
