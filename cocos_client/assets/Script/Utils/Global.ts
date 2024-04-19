import af from "../Manger/ArtifactMgr";
import br from "../Manger/BattleReportsMgr";
import bd from "../Manger/BuildingMgr";
import ev from "../Manger/EvaluationMgr";
import im from "../Manger/ItemMgr";
import l from "../Manger/LanMgr";
import locad from "../Manger/LocalDataLoader";
import p from "../Manger/PioneerMgr";
import tk from "../Manger/TaskMgr";
import user from "../Manger/UserInfoMgr";
import pd from "../Manger/PioneerDevelopMgr";
import game from "../Manger/GameMgr";

import audio from "../Basic/AudioMgr";
import res from "../Basic/ResourcesMgr";

const ArtifactMgr = new af();
const BuildingMgr = new bd();
const EvaluationMgr = new ev();
const ItemMgr = new im();
const LanMgr = new l();
const LocalDataLoader = new locad();
const PioneerMgr = new p();
const TaskMgr = new tk();
const UserInfoMgr = new user();
const BattleReportsMgr = new br();
const PioneerDevelopMgr = new pd();
const GameMgr = new game();

const AudioMgr = new audio();
const ResourcesMgr = new res();

export {
    // game
    LocalDataLoader,
    ArtifactMgr,
    BattleReportsMgr,
    BuildingMgr,
    EvaluationMgr,
    ItemMgr,
    LanMgr,
    PioneerMgr,
    TaskMgr,
    UserInfoMgr,
    PioneerDevelopMgr,
    GameMgr,

    // system
    AudioMgr,
    ResourcesMgr
};
