import { EventTarget } from "cc";
import af from "../Manger/ArtifactMgr";
import br from "../Manger/BattleReportsMgr";
import box from "../Manger/BoxMgr";
import Be from "../Manger/BranchEventMgr";
import bd from "../Manger/BuildingMgr";
import cf from "../Manger/ConfigMgr";
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

const ArtifactMgr = new af();
const BattleReportsMgr = new br();
const BoxMgr = new box();
const BranchEventMgr = new Be();
const BuildingMgr = new bd();
const ConfigMgr = new cf();
const CountMgr = new ct();
const DropMgr = new Dp();
const EvaluationMgr = new ev();
const EventMgr = new EventTarget();
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
const AudioMgr = new audio();

export {
    // game
    LocalDataLoader,
    ArtifactMgr,
    BattleReportsMgr,
    BoxMgr,
    BranchEventMgr,
    BuildingMgr,
    ConfigMgr,
    CountMgr,
    DropMgr,
    EvaluationMgr,
    EventMgr,
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
    AudioMgr
};
