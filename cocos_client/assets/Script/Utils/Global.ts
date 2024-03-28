import af from "../Manger/ArtifactMgr";
import br from "../Manger/BattleReportsMgr";
import bd from "../Manger/BuildingMgr";
import ct from "../Manger/CountMgr";
import ev from "../Manger/EvaluationMgr";
import im from "../Manger/ItemMgr";
import l from "../Manger/LanMgr";
import locad from "../Manger/LocalDataLoader";
import p from "../Manger/PioneerMgr";
import s from "../Manger/SettlementMgr";
import tk from "../Manger/TaskMgr";
import user from "../Manger/UserInfoMgr";

import audio from "../Basic/AudioMgr";
import uip from "../Basic/UIPanelMgr";
import res from "../Basic/ResourcesMgr";

const ArtifactMgr = new af();
const BuildingMgr = new bd();
const CountMgr = new ct();
const EvaluationMgr = new ev();
const ItemMgr = new im();
const LanMgr = new l();
const LocalDataLoader = new locad();
const PioneerMgr = new p();
const SettlementMgr = new s();
const TaskMgr = new tk();
const UserInfoMgr = new user();
const BattleReportsMgr = new br();

const AudioMgr = new audio();
const ResourcesMgr = new res();
const UIPanelMgr = new uip(ResourcesMgr);

export {
    // game
    LocalDataLoader,
    ArtifactMgr,
    BattleReportsMgr,
    BuildingMgr,
    CountMgr,
    EvaluationMgr,
    ItemMgr,
    LanMgr,
    PioneerMgr,
    SettlementMgr,
    TaskMgr,
    UserInfoMgr,

    // system
    AudioMgr,
    UIPanelMgr,
    ResourcesMgr
};
