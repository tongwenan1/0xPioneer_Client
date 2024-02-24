import { _decorator, Component, Node, Animation, Vec2, Vec3, CCInteger, CCFloat, TweenAction, tween, Graphics, Color, instantiate, Sprite, Quat, UITransform, misc, Label, ProgressBar, log, v3, color } from 'cc';
import MapPioneerModel, { MapPioneerActionType, MapPioneerMoveDirection } from '../Model/MapPioneerModel';
const { ccclass, property } = _decorator;

@ccclass('MapPioneer')
export class MapPioneer extends Component {

    @property(Label)
    nameLabel: Label;

    @property(Node)
    speedUpTag: Node;

    private _model: MapPioneerModel = null;
    private _lastStatus: MapPioneerActionType = null;
    private _actionTimeStamp: number = 0;
    private _actionTotalTime: number = 0;

    private _addingtroopsView: Node = null;
    private _exploringView: Node = null;
    private _timeCountProgress: ProgressBar = null;
    private _timeCountLabel: Label = null;

    public refreshUI(model: MapPioneerModel) {
        this._model = model;
        this.nameLabel.string = this._model.name;
        this._actionTimeStamp = this._model.actionEndTimeStamp;
        this._actionTotalTime = this._actionTimeStamp - model.actionBeginTimeStamp;

        let idleView = null;
        let leftWalkView = null;
        let rightWalkView = null;
        let topWalkView = null;
        let bottomWalkView = null;
        let collectView = null;

        let roleView = null;
        if (model.id == "pioneer_0") {
            roleView = this.node.getChildByPath("role/self");
            for (const name of this._roleNames) {
                const templeView = this.node.getChildByPath("role/" + name);
                templeView.active = false;
            }
        } else {
            this.node.getChildByPath("role/self").active = false;
            for (const name of this._roleNames) {
                const templeView = this.node.getChildByPath("role/" + name);
                templeView.active = name == model.name;
                if (templeView.active) {
                    roleView = templeView;
                }
            }
        }
        roleView.active = true;
        idleView = roleView.getChildByName("idle");
        leftWalkView = roleView.getChildByName("walk_left");
        rightWalkView = roleView.getChildByName("walk_right");
        topWalkView = roleView.getChildByName("walk_top");
        bottomWalkView = roleView.getChildByName("walk_bottom");
        collectView = roleView.getChildByName("collect") == null ? null : roleView.getChildByName("collect");

        leftWalkView.active = false;
        rightWalkView.active = false;
        topWalkView.active = false;
        bottomWalkView.active = false;

        if (this._lastStatus != this._model.actionType) {
            this._lastStatus = this._model.actionType;

            idleView.active = false;
            collectView.active = false;

            this._addingtroopsView.active = false;
            this._exploringView.active = false;

            switch (this._model.actionType) {
                case MapPioneerActionType.defend: {
                    this.node.active = false; // not show
                }
                    break;

                case MapPioneerActionType.idle: {
                    this.node.active = true; // only show
                    idleView.active = true;
                }
                    break;

                case MapPioneerActionType.moving: {
                    this.node.active = true; // show
                }
                    break;

                case MapPioneerActionType.mining: {
                    this.node.active = true;
                    if (collectView != null) {
                        collectView.active = true;
                    }
                }
                    break;

                case MapPioneerActionType.addingtroops: {
                    this.node.active = true;
                    idleView.active = true;
                    this._addingtroopsView.active = true;
                }
                    break;

                case MapPioneerActionType.exploring: {
                    this.node.active = true;
                    idleView.active = true;
                    this._exploringView.active = true;
                }
                    break;

                default:
                    break;
            }
        }

        if (this._model.actionType == MapPioneerActionType.moving) {
            leftWalkView.active = this._model.moveDirection == MapPioneerMoveDirection.left;
            rightWalkView.active = this._model.moveDirection == MapPioneerMoveDirection.right;
            topWalkView.active = this._model.moveDirection == MapPioneerMoveDirection.top;
            bottomWalkView.active = this._model.moveDirection == MapPioneerMoveDirection.bottom;
        }
    }

    private _playingView: Node[] = [];
    public playGetResourceAnim(resourceId: string, num: number, callback: () => void) {
        if (num <= 0) {
            return;
        }
        const animView = instantiate(this._resourceAnimView);
        animView.active = true;
        animView.setParent(this.node);
        const resourceName = [
            "resource_01",
            "resource_02",
            "resource_03",
            "resource_04",
        ];
        for (const name of resourceName) {
            animView.getChildByName(name).active = resourceId == name;
        }
        animView.getChildByName("Label").getComponent(Label).string = "+" + num;

        animView.setPosition(v3(0, 90, 0));
        tween()
            .target(animView)
            .delay(this._playingView.length > 0 ? 0.2 : 0)
            .to(0.4, { position: v3(0, 150, 0) })
            .call(() => {
                animView.destroy();
                this._playingView.splice(this._playingView.indexOf(animView), 1);
                if (callback != null) {
                    callback();
                }
            })
            .start();

        this._playingView.push(animView);
    }

    private _resourceAnimView: Node = null;

    private _roleNames: string[] = [
        "artisan",
        "doomsdayGangBigTeam",
        "doomsdayGangSpy",
        "doomsdayGangTeam",
        "hunter",
        "prophetess",
        "rebels",
        "secretGuard",
    ];
    onLoad() {
        if (this.speedUpTag) {
            this.speedUpTag.active = false;
        }

        this._addingtroopsView = this.node.getChildByName("Addingtroops");
        this._addingtroopsView.active = false;

        this._exploringView = this.node.getChildByName("Exploring");
        this._exploringView.active = false;

        this._timeCountProgress = this.node.getChildByPath("lastTIme/progressBar").getComponent(ProgressBar);
        this._timeCountLabel = this.node.getChildByPath("lastTIme/time").getComponent(Label);

        this._resourceAnimView = this.node.getChildByName("resourceGetted");
        this._resourceAnimView.active = false;
    }
    start() {
    }
    update(deltaTime: number) {
        const currentTimeStamp = new Date().getTime();

        if (this._actionTimeStamp > currentTimeStamp) {

            this._timeCountProgress.node.active = true;
            this._timeCountLabel.node.active = true;

            this._timeCountProgress.progress = (this._actionTimeStamp - currentTimeStamp) / this._actionTotalTime;
            this._timeCountLabel.string = ((this._actionTimeStamp - currentTimeStamp) / 1000).toFixed(2) + "s";
        } else {
            this._timeCountProgress.node.active = false;
            this._timeCountLabel.node.active = false;
        }
    }

}


