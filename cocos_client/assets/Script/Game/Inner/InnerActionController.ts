import { EventMouse, Node, UITransform, Vec3, _decorator } from "cc";
import ViewController from "../../BasicView/ViewController";
import GameMainHelper from "../Helper/GameMainHelper";

const { ccclass, property } = _decorator;

@ccclass('InnerActionController')
export default class InnerActionController extends ViewController {

    private _mouseDown: boolean = false;
    private _showInnerCameraPosition: Vec3 = Vec3.ZERO;
    private _showInnerCameraZoom: number = 1;
    protected viewDidLoad(): void {
        super.viewDidLoad();
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        const cameraSize = GameMainHelper.instance.gameCameraSize;

        let uiTrans = this.node.getComponent(UITransform);
        let halfMapWidth = uiTrans.contentSize.width / 2;
        let halfMapHeight = uiTrans.contentSize.height / 2;

        let moveDistX = halfMapWidth - cameraSize.width / 2;
        let moveDistY = halfMapHeight - cameraSize.height / 2;

        let downx = 0;
        let downy = 0;
        this.node.on(Node.EventType.MOUSE_DOWN, (event: EventMouse) => {
            this._mouseDown = true;

            downx = event.getLocation().x;
            downy = event.getLocation().y;
        }, this);

        this.node.on(Node.EventType.MOUSE_UP, (event: EventMouse) => {
            this._mouseDown = false;
            var pos = event.getLocation();

            if (downx == pos.x &&
                downy == pos.y) {
            };
        }, this);

        this.node.on(Node.EventType.MOUSE_WHEEL, (event: EventMouse) => {
            let zoom = GameMainHelper.instance.gameCameraZoom;
            if (event.getScrollY() > 0) {
                zoom -= 0.05;
            } else {
                zoom += 0.05;
            }
            GameMainHelper.instance.changeGameCameraZoom(zoom);
        }, this);

        this.node.on(Node.EventType.MOUSE_MOVE, (event: EventMouse) => {
            if (this._mouseDown) {
                let pos = GameMainHelper.instance.gameCameraPosition.add(new Vec3(-event.movementX, event.movementY, 0));
                if (pos.x < -moveDistX) {
                    pos.x = -moveDistX;

                } else if (pos.x > moveDistX) {
                    pos.x = moveDistX;
                }

                if (pos.y < -moveDistY) {
                    pos.y = -moveDistY;

                } else if (pos.y > moveDistY) {
                    pos.y = moveDistY;
                }
                GameMainHelper.instance.changeGameCameraPosition(pos);
            }
        }, this);
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();

        GameMainHelper.instance.changeGameCameraPosition(this._showInnerCameraPosition.clone());
        GameMainHelper.instance.changeGameCameraZoom(this._showInnerCameraZoom);
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();

        this._showInnerCameraPosition = GameMainHelper.instance.gameCameraPosition.clone();
        this._showInnerCameraZoom = GameMainHelper.instance.gameCameraZoom;
    }
}