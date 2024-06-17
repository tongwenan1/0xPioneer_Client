import { _decorator, Camera, Component, Node } from "cc";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import GameMainHelper from "../Game/Helper/GameMainHelper";
const { ccclass, property } = _decorator;

@ccclass("GameOverlayCamera")
export class GameOverlayCamera extends Component {
    start() {
        NotificationMgr.addListener(NotificationName.GAME_CAMERA_POSITION_CHANGED, this._onGameCameraPositionChange, this);
        NotificationMgr.addListener(NotificationName.GAME_CAMERA_ZOOM_CHANGED, this._onGameCameraZoomChange, this);
    }

    update(deltaTime: number) {}

    //------------------------- notification
    private _onGameCameraPositionChange() {
        this.node.worldPosition = GameMainHelper.instance.gameCameraWorldPosition;
    }
    private _onGameCameraZoomChange() {
        this.node.getComponent(Camera).orthoHeight = GameMainHelper.instance.gameCameraOrthoHeight;
    }
}
