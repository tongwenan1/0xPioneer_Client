import af from "../Manger/ArtifactMgr";
import br from "../Manger/BattleReportsMgr";
import Be from "../Manger/BranchEventMgr";
import bd from "../Manger/BuildingMgr";
import ct from "../Manger/CountMgr";
import Dp from "../Manger/DropMgr";
import ev from "../Manger/EvaluationMgr";
import ibd from "../Manger/InnerBuildingMgr";
import im from "../Manger/ItemMgr";
import l from "../Manger/LanMgr";
import locad from "../Manger/LocalDataLoader";
import lvl from "../Manger/LvlupMgr";
import p from "../Manger/PioneerMgr";
import s from "../Manger/SettlementMgr";
import t from "../Manger/TalkMgr";
import tk from "../Manger/TaskMgr";
import user from "../Manger/UserInfoMgr";

import audio from "../Basic/AudioMgr";
import uip from "../Basic/UIPanelMgr";
import res from "../Basic/ResourcesMgr";

const ArtifactMgr = new af();
const BranchEventMgr = new Be();
const BuildingMgr = new bd();
const CountMgr = new ct();
const DropMgr = new Dp();
const EvaluationMgr = new ev();
const InnerBuildingMgr = new ibd();
const ItemMgr = new im();
const LanMgr = new l();
const LocalDataLoader = new locad();
const LvlupMgr = new lvl();
const PioneerMgr = new p();
const SettlementMgr = new s();
const TalkMgr = new t();
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
    BranchEventMgr,
    BuildingMgr,
    CountMgr,
    DropMgr,
    EvaluationMgr,
    InnerBuildingMgr,
    ItemMgr,
    LanMgr,
    LvlupMgr,
    PioneerMgr,
    SettlementMgr,
    TalkMgr,
    TaskMgr,
    UserInfoMgr,

    // system
    AudioMgr,
    UIPanelMgr,
    ResourcesMgr
};
