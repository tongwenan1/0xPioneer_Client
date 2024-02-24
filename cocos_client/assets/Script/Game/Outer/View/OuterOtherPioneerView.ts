import { _decorator, Component, Node, Animation, Vec2, Vec3, CCInteger, CCFloat, TweenAction, tween, Graphics, Color, instantiate, Sprite, Quat, UITransform, misc, Label, ProgressBar, log, v3 } from 'cc';
import MapPioneerModel, { MapPioneerActionType, MapPioneerMoveDirection, MapPioneerType, MapNpcPioneerModel } from '../Model/MapPioneerModel';

const { ccclass, property } = _decorator;

@ccclass('OuterOtherPioneerView')
export class OuterOtherPioneerView extends Component {

    public refreshUI(pioneer: MapPioneerModel) {
        // name
        this.node.getChildByName("name").getComponent(Label).string = pioneer.name;
        // role
        for (const name of this._roleNames) {
            const view = this.node.getChildByPath("role/" + name);
            view.active = name === pioneer.name;
            if (view.active) {
                if (pioneer.actionType == MapPioneerActionType.idle) {
                    view.getChildByName("idle").active = true;
                    view.getChildByName("walk_left").active = false;
                    view.getChildByName("walk_right").active = false;
                    view.getChildByName("walk_top").active = false;
                    view.getChildByName("walk_bottom").active = false;
                } else if (pioneer.actionType == MapPioneerActionType.moving) {
                    view.getChildByName("idle").active = false;
                    view.getChildByName("walk_left").active = pioneer.moveDirection == MapPioneerMoveDirection.left;
                    view.getChildByName("walk_right").active = pioneer.moveDirection == MapPioneerMoveDirection.right;
                    view.getChildByName("walk_top").active = pioneer.moveDirection == MapPioneerMoveDirection.top;
                    view.getChildByName("walk_bottom").active = pioneer.moveDirection == MapPioneerMoveDirection.bottom;
                }
            }
        }
        // friendly
        this._nonFriendlyView.active = !pioneer.friendly;
        this._canSearchView.active = pioneer.type == MapPioneerType.gangster && pioneer.friendly;
        // taskhide
        if (pioneer instanceof MapNpcPioneerModel) {
            if (pioneer.taskObj != null && pioneer.taskHideTime > 0) {
                this._timeCountLabel.node.active = true;
                this._timeCountLabel.string = "task hide:" + pioneer.taskHideTime + "s";
            } else {
                this._timeCountLabel.node.active = false;
            }
            // hastask
            this._hasTaskView.active = false;
            this._taskPreparingView.active = false;
            if (pioneer.taskObj == null) {
    
            } else {
                if (pioneer.taskCdEndTime > 0) {
                    this._taskPreparingView.active = true;
                    this._taskPreparingView.getComponent(Label).string = "prepare task..." + pioneer.taskCdEndTime + "s";
                } else {
                    this._hasTaskView.active = true;
                }
            }
        }
    }

    private _hasTaskView: Node = null;
    private _playerChattingView: Node = null;
    private _taskPreparingView: Node = null;
    private _timeCountLabel: Label = null;

    private _nonFriendlyView: Node = null;
    private _canSearchView: Node = null;

    private _roleNames: string[] = [
        "artisan",
        "doomsdayGangBigTeam",
        "doomsdayGangSpy",
        "doomsdayGangTeam",
        "hunter",
        "prophetess",
        "rebels",
        "secretGuard"
    ];
    onLoad() {
        this._hasTaskView = this.node.getChildByPath("task_status/talkbubble");
        this._playerChattingView = this.node.getChildByPath("task_status/chatting");
        this._taskPreparingView = this.node.getChildByPath("task_status/prepare_task");
        this._timeCountLabel = this.node.getChildByPath("task_status/task_hide_count").getComponent(Label);

        this._nonFriendlyView = this.node.getChildByPath("action_status/non_friendly");
        this._canSearchView = this.node.getChildByPath("action_status/search")

        this._hasTaskView.active = false;
        this._playerChattingView.active = false;
        this._taskPreparingView.active = false;
        this._timeCountLabel.node.active = false;

        this._nonFriendlyView.active = false;
        this._canSearchView.active = false;
    }

    start() {

    }

    update(deltaTime: number) {

    }
}

