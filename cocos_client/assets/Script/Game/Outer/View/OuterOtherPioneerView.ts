import { _decorator, Component, Node, Animation, Vec2, Vec3, CCInteger, CCFloat, TweenAction, tween, Graphics, Color, instantiate, Sprite, Quat, UITransform, misc, Label, ProgressBar, log, v3 } from 'cc';
import { LanMgr } from '../../../Utils/Global';
import { MapPioneerActionType, MapPioneerMoveDirection, MapPioneerType } from '../../../Const/Model/MapPioneerModelDefine';
import MapPioneerModel, { MapNpcPioneerModel } from '../Model/MapPioneerModel';

const { ccclass, property } = _decorator;

@ccclass('OuterOtherPioneerView')
export class OuterOtherPioneerView extends Component {

    public refreshUI(pioneer: MapPioneerModel) {
        // name
        this.node.getChildByPath("name").getComponent(Label).string = LanMgr.getLanById(pioneer.name);
        // role
        for (const name of this._roleNames) {
            const view = this.node.getChildByPath("role/" + name);
            view.active = name === pioneer.animType;
            if (view.active) {
                const wLeft = view.getChildByPath("walk_left");
                const wRight = view.getChildByPath("walk_right");
                const wTop = view.getChildByPath("walk_top");
                const wBottom = view.getChildByPath("walk_bottom");
                if (pioneer.actionType == MapPioneerActionType.idle) {
                    view.getChildByPath("idle").active = true;

                    if (wLeft != null) {
                        wLeft.active = false;
                    }
                    if (wRight != null) {
                        wRight.active = false;
                    }
                    if (wTop != null) {
                        wTop.active = false;
                    }
                    if (wBottom != null) {
                        wBottom.active = false;
                    }
                } else if (pioneer.actionType == MapPioneerActionType.moving) {
                    view.getChildByPath("idle").active = false;
                    if (wLeft != null) {
                        wLeft.active = pioneer.moveDirection == MapPioneerMoveDirection.left;
                    }
                    if (wRight != null) {
                        wRight.active = pioneer.moveDirection == MapPioneerMoveDirection.right;
                    }
                    if (wTop != null) {
                        wTop.active = pioneer.moveDirection == MapPioneerMoveDirection.top;
                    }
                    if (wBottom != null) {
                        wBottom.active = pioneer.moveDirection == MapPioneerMoveDirection.bottom;
                    }
                }
            }
        }
        // friendly
        const statusView = this.node.getChildByPath("StatusView");
        statusView.active = false;
        if (!pioneer.friendly) {
            statusView.active = true;
            // useLanMgr
            // statusView.getChildByName("Text").getComponent(Label).string = LanMgr.getLanById("201001");
            statusView.getChildByPath("Text").getComponent(Label).string = "Battle";
            statusView.getChildByPath("Icon/Battle").active = true;
            statusView.getChildByPath("Icon/Search").active = false;
            statusView.getChildByName("Level").getComponent(Label).string = "Lv.1";

        } else if (pioneer.type == MapPioneerType.gangster && pioneer.friendly) {
            statusView.active = true;
            // useLanMgr
            // statusView.getChildByName("Text").getComponent(Label).string = LanMgr.getLanById("201001");
            statusView.getChildByPath("Text").getComponent(Label).string = "Search";
            statusView.getChildByPath("Icon/Battle").active = false;
            statusView.getChildByPath("Icon/Search").active = true;
            statusView.getChildByName("Level").getComponent(Label).string = "Lv.1";
        }
      
        // taskhide
        if (pioneer instanceof MapNpcPioneerModel) {
            this._hasTaskView.active = pioneer.talkId != null;
            // if (pioneer.taskObj != null && pioneer.taskHideTime > 0) {
            //     this._timeCountLabel.node.active = true;
                
            //     // useLanMgr
            //     this._timeCountLabel.string =  LanMgr.replaceLanById("202001", [pioneer.taskHideTime]);
            //     // this._timeCountLabel.string = "task hide:" + pioneer.taskHideTime + "s";
                
            // } else {
            //     this._timeCountLabel.node.active = false;
            // }
            // // hastask
            // this._hasTaskView.active = false;
            // this._taskPreparingView.active = false;
            // if (pioneer.taskObj == null) {
    
            // } else {
            //     if (pioneer.taskCdEndTime > 0) {
            //         this._taskPreparingView.active = true;

            //         // useLanMgr
            //         this._taskPreparingView.getComponent(Label).string =  LanMgr.replaceLanById("202002", [pioneer.taskCdEndTime]);
            //         // this._taskPreparingView.getComponent(Label).string = "prepare task..." + pioneer.taskCdEndTime + "s";

            //     } else {
            //         this._hasTaskView.active = true;
            //     }
            // }
        }
    }

    private _hasTaskView: Node = null;
    private _playerChattingView: Node = null;
    private _taskPreparingView: Node = null;
    private _timeCountLabel: Label = null;

    private _roleNames: string[] = [
        "artisan",
        "doomsdayGangBigTeam",
        "doomsdayGangSpy",
        "doomsdayGangTeam",
        "hunter",
        "prophetess",
        "rebels",
        "secretGuard",
        "chief",
        "rabbit",
        "doc",
        "marauder"
    ];
    onLoad() {
        this._hasTaskView = this.node.getChildByPath("task_status/talkbubble");
        this._playerChattingView = this.node.getChildByPath("task_status/chatting");
        this._taskPreparingView = this.node.getChildByPath("task_status/prepare_task");
        this._timeCountLabel = this.node.getChildByPath("task_status/task_hide_count").getComponent(Label);


        this._hasTaskView.active = false;
        this._playerChattingView.active = false;
        this._taskPreparingView.active = false;
        this._timeCountLabel.node.active = false;
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


