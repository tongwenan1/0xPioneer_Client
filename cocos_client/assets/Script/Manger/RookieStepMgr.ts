import { Canvas, Node, UITransform, find } from "cc";
import NotificationMgr from "../Basic/NotificationMgr";
import UIPanelManger, { UIPanelLayerType } from "../Basic/UIPanelMgr";
import { UIName } from "../Const/ConstUIDefine";
import { NotificationName } from "../Const/Notification";
import { RookieStepMaskUI } from "../UI/RookieGuide/RookieStepMaskUI";
import { DataMgr } from "../Data/DataMgr";
import { RookieStep } from "../Const/RookieDefine";
import { NetworkMgr } from "../Net/NetworkMgr";
import { s2c_user } from "../Net/msg/WebsocketMsg";
import GameMainHelper from "../Game/Helper/GameMainHelper";

export default class RookieStepMgr {
    private static _instance: RookieStepMgr;
    private _maskView: RookieStepMaskUI = null;

    public async init() {
        const result = await UIPanelManger.inst.pushPanel(UIName.RookieStepMaskUI, UIPanelLayerType.HUD);
        if (!result.success) {
            return;
        }
        this._maskView = result.node.getComponent(RookieStepMaskUI);
        this._refreshMaskShow();

        NotificationMgr.addListener(NotificationName.USERINFO_DID_CHANGE_HEAT, this.onHeatChange, this);
        NotificationMgr.addListener(NotificationName.TALK_FINISH, this._onTalkFinish, this);
        NotificationMgr.addListener(NotificationName.GAME_CAMERA_POSITION_CHANGED, this._onGameCameraPosChange, this);

        NotificationMgr.addListener(NotificationName.USERINFO_ROOKE_STEP_CHANGE, this._onRookieStepChange, this);
        NotificationMgr.addListener(NotificationName.ROOKIE_GUIDE_FIGHT_ENEMY_WIN, this._onRookieFightWin, this);
        NotificationMgr.addListener(NotificationName.ROOKIE_GUIDE_BUILDING_UPGRADE_CLOSE, this._onRookieBuildingUpgradeClose, this);

        NotificationMgr.addListener(NotificationName.ROOKIE_GUIDE_NEED_MASK_SHOW, this._onRooieNeedMaskShow, this);

        NetworkMgr.websocket.on("player_worldbox_beginner_open_res", this.player_worldbox_beginner_open_res);
    }

    public static instance(): RookieStepMgr {
        if (!this._instance) {
            this._instance = new RookieStepMgr();
        }
        return this._instance;
    }

    public constructor() {}

    private _refreshMaskShow() {
        const rookieStep = DataMgr.s.userInfo.data.rookieStep;
        this._maskView.node.active = rookieStep != RookieStep.WAKE_UP && rookieStep != RookieStep.FINISH;
    }

    private onHeatChange() {
        const rookieStep = DataMgr.s.userInfo.data.rookieStep;
        if (rookieStep == RookieStep.PIOT_TO_HEAT) {
            // next step
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.NPC_TALK_4,
            });
        }
    }
    private _onTalkFinish(data: { talkId: string }) {
        const rookieStep: RookieStep = DataMgr.s.userInfo.data.rookieStep;
        if (rookieStep == RookieStep.NPC_TALK_1 && data.talkId == "talk02") {
            // next step
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.NPC_TALK_3,
            });
        } else if (rookieStep == RookieStep.NPC_TALK_3 && data.talkId == "talk03") {
            // next step
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.PIOT_TO_HEAT,
            });
        } else if (rookieStep == RookieStep.NPC_TALK_4 && data.talkId == "talk04") {
            // next step
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.OPEN_BOX_1,
            });
        } else if (rookieStep == RookieStep.NPC_TALK_5 && data.talkId == "talk05") {
            // next step
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.TASK_SHOW_TAP_1,
            });
        } else if (rookieStep == RookieStep.NPC_TALK_6 && data.talkId == "talk06") {
            // next step
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.OPNE_BOX_2,
            });
        } else if (rookieStep == RookieStep.NPC_TALK_7 && data.talkId == "talk07") {
            // next step
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.ENTER_INNER,
            });
        } else if (rookieStep == RookieStep.MAIN_BUILDING_TAP_1 && data.talkId == "talk18") {
            // upgrade tapindex -3,  show tap close tap
            NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_BUILDING_UPGRADE, { tapIndex: "-3" });
        }
    }
    private _onGameCameraPosChange() {
        const rookieStep: RookieStep = DataMgr.s.userInfo.data.rookieStep;
        if (rookieStep == RookieStep.TASK_SHOW_TAP_1) {
            const pioneer = DataMgr.s.pioneer.getById("gangster_1");
            if (pioneer == undefined) {
                return;
            }
            GameMainHelper.instance.tiledMapShadowErase(pioneer.stayPos);
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.ENEMY_FIGHT,
            });
        } else if (rookieStep == RookieStep.TASK_SHOW_TAP_2) {
            const pioneer = DataMgr.s.pioneer.getById("npc_0");
            if (pioneer == undefined) {
                return;
            }
            GameMainHelper.instance.tiledMapShadowErase(pioneer.stayPos);
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.NPC_TALK_6,
            });
        } else if (rookieStep == RookieStep.ENTER_INNER) {
            const view = find("Main/Canvas/GameContent/Game/OutScene/TiledMap/deco_layer/MAP_building_1");
            if (view == null) {
                return;
            }
            this._maskView.configuration(true, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
                NetworkMgr.websocketMsg.player_rookie_update({
                    rookieStep: RookieStep.MAIN_BUILDING_TAP_1,
                });
            });
        }
    }

    private _onRookieStepChange() {
        this._refreshMaskShow();
        const rookieStep = DataMgr.s.userInfo.data.rookieStep;

        if (
            rookieStep == RookieStep.NPC_TALK_1 ||
            rookieStep == RookieStep.NPC_TALK_3 ||
            rookieStep == RookieStep.NPC_TALK_4 ||
            rookieStep == RookieStep.NPC_TALK_5 ||
            rookieStep == RookieStep.NPC_TALK_6 ||
            rookieStep == RookieStep.NPC_TALK_7
        ) {
            const view = find("Main/Canvas/GameContent/Game/OutScene/TiledMap/deco_layer/MAP_npc_0");
            if (view == null) {
                return;
            }
            this._maskView.configuration(true, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_MAP_PIONEER, { pioneerId: "npc_0" });
            });
        } else if (rookieStep == RookieStep.PIOT_TO_HEAT) {
            const view = find("Main/UI_Canvas/UI_ROOT/MainUI/CommonContent/HeatTreasureUI/__ViewContent/Content/HeatProgress/HeatValue");
            if (view == null) {
                return;
            }
            this._maskView.configuration(false, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_HEAT_CONVERT);
            });
        } else if (rookieStep == RookieStep.OPEN_BOX_1 || rookieStep == RookieStep.OPNE_BOX_2) {
            let index: number = 0;
            if (rookieStep == RookieStep.OPEN_BOX_1) {
                index = 0;
            } else if (rookieStep == RookieStep.OPNE_BOX_2) {
                index = 1;
            }
            const view = find("Main/UI_Canvas/UI_ROOT/MainUI/CommonContent/HeatTreasureUI/__ViewContent/Content/ProgressBar/BoxContent/HEAT_TREASURE_" + index);
            if (view == null) {
                return;
            }
            this._maskView.configuration(false, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_HEAT_BOX, { tapIndex: index + "" });
            });
        } else if (rookieStep == RookieStep.TASK_SHOW_TAP_1) {
            const view = find("Main/UI_Canvas/UI_ROOT/MainUI/CommonContent/TaskButton");
            if (view == null) {
                return;
            }
            this._maskView.configuration(false, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_MAIN_TASK);
            });
        } else if (rookieStep == RookieStep.TASK_SHOW_TAP_2) {
            NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_MAIN_TASK);
        } else if (rookieStep == RookieStep.TASK_SHOW_TAP_3) {
            if (!GameMainHelper.instance.isGameShowOuter) {
                GameMainHelper.instance.changeInnerAndOuterShow();
            }
            NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_MAIN_TASK);
        } else if (rookieStep == RookieStep.ENEMY_FIGHT) {
            const view = find("Main/Canvas/GameContent/Game/OutScene/TiledMap/deco_layer/MAP_gangster_1");
            if (view == null) {
                return;
            }
            if (GameMainHelper.instance.gameCameraWorldPosition != view.worldPosition) {
                GameMainHelper.instance.changeGameCameraWorldPosition(view.worldPosition);
                const pioneer = DataMgr.s.pioneer.getById("gangster_1");
                if (pioneer == undefined) {
                    return;
                }
                GameMainHelper.instance.tiledMapShadowErase(pioneer.stayPos);
            }
            this._maskView.configuration(true, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_MAP_PIONEER, { pioneerId: "gangster_1" });
            });
        } else if (rookieStep == RookieStep.ENTER_INNER) {
            const view = find("Main/Canvas/GameContent/Game/OutScene/TiledMap/deco_layer/MAP_building_1");
            if (view == null) {
                return;
            }
            const building = DataMgr.s.mapBuilding.getBuildingById("building_1");
            if (building == undefined) {
                return;
            }
            GameMainHelper.instance.changeGameCameraWorldPosition(view.worldPosition, true);
            GameMainHelper.instance.tiledMapShadowErase(building.stayMapPositions[3]);
        } else if (rookieStep == RookieStep.MAIN_BUILDING_TAP_1) {
            GameMainHelper.instance.changeInnerAndOuterShow();
            const view = find("Main/Canvas/GameContent/Game/InnerSceneRe/BuildingLattice/StreetView/buildingView_1/MainCity");
            if (view == null) {
                return;
            }
            this._maskView.configuration(false, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_MAIN_BUILDING);
            });
        }
    }
    private _onRookieFightWin() {
        const rookieStep = DataMgr.s.userInfo.data.rookieStep;
        if (rookieStep == RookieStep.ENEMY_FIGHT) {
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.TASK_SHOW_TAP_2,
            });
        }
    }
    private _onRookieBuildingUpgradeClose() {
        const rookieStep = DataMgr.s.userInfo.data.rookieStep;
        if (rookieStep == RookieStep.MAIN_BUILDING_TAP_1) {
            const view = find("Main/UI_Canvas/UI_ROOT/MainUI/CommonContent/InnerOutChangeBtnBg");
            if (view == null) {
                return;
            }
            this._maskView.configuration(false, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
                NetworkMgr.websocketMsg.player_rookie_update({
                    rookieStep: RookieStep.TASK_SHOW_TAP_3,
                });
            });
        }
    }

    private _onRooieNeedMaskShow(data: { tag: string; view: Node; tapIndex: string }) {
        if (data.view == null) {
            return;
        }
        const { tag, view, tapIndex } = data;
        let isFromGameView: boolean = false;
        if (tag == "mapAction") {
            isFromGameView = true;
        }
        this._maskView.configuration(isFromGameView, view.worldPosition, view.getComponent(UITransform).contentSize, () => {
            if (tag == "dialogue") {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_DIALOGUE, { tapIndex: tapIndex });
            } else if (tag == "mapAction") {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_MAP_ACTION, { tapIndex: tapIndex });
            } else if (tag == "mapActionConfrim") {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_MAP_ACTION_CONFRIM, { tapIndex: tapIndex });
            } else if (tag == "task") {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_TASK_ITEM, { tapIndex: tapIndex });
            } else if (tag == "buildingUpgrade") {
                NotificationMgr.triggerEvent(NotificationName.ROOKIE_GUIDE_TAP_BUILDING_UPGRADE, { tapIndex: tapIndex });
            }
        });
    }

    //-------------------------------------- socket notify
    private player_worldbox_beginner_open_res = (e: any) => {
        const p: s2c_user.Iplayer_worldbox_beginner_open_res = e.data;
        if (p.res !== 1) {
            return;
        }
        const rookieStep = DataMgr.s.userInfo.data.rookieStep;
        if (rookieStep == RookieStep.OPEN_BOX_1 && p.boxId == "9001") {
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.NPC_TALK_5,
            });
        } else if (rookieStep == RookieStep.OPNE_BOX_2 && p.boxId == "9002") {
            NetworkMgr.websocketMsg.player_rookie_update({
                rookieStep: RookieStep.NPC_TALK_7,
            });
        }
    };
}
