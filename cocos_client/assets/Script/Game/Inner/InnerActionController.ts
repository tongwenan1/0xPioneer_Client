import { EventMouse, Node, UITransform, Vec3, _decorator } from "cc";
import ViewController from "../../BasicView/ViewController";
import { GameMain } from "../../GameMain";
import NotificationMgr from "../../Basic/NotificationMgr";
import { EventName } from "../../Const/ConstDefine";
import ConfigConfig from "../../Config/ConfigConfig";
import { ConfigType, MapScaleConfigData } from "../../Const/Config";

const { ccclass, property } = _decorator;

@ccclass('InnerActionController')
export default class InnerActionController extends ViewController {

    private _mouseDown: boolean = false;
    private _curCameraPos: Vec3 = Vec3.ZERO;
    private _curCameraZoom: number = 1;
    protected viewDidLoad(): void {
        super.viewDidLoad();
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        let halfCameraWidth = GameMain.inst.MainCamera.camera.width / 2;
        let halfCameraHeight = GameMain.inst.MainCamera.camera.height / 2;

        let uiTrans = this.node.getComponent(UITransform);
        let halfMapWidth = uiTrans.contentSize.width / 2;
        let halfMapHeight = uiTrans.contentSize.height / 2;

        let moveDistX = halfMapWidth - halfCameraWidth;
        let moveDistY = halfMapHeight - halfCameraHeight;

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
            let sc = this._curCameraZoom;
            let config = ConfigConfig.getMapScaleConfig();
            if (config == null) return;
            if (event.getScrollY() > 0) {
                sc -= 0.05;
            }
            else {
                sc += 0.05;
            }
            if (sc > config.para[1]) {
                sc = config.para[1];
            }
            else if (sc < config.para[0]) {
                sc = config.para[0];
            }
            GameMain.inst.MainCamera.orthoHeight = sc * GameMain.inst.outSceneMap.mapBG.cameraOriginalOrthoHeight;
            this._curCameraZoom = sc;
            NotificationMgr.triggerEvent(EventName.MAP_SCALED, sc);
        }, this);

        this.node.on(Node.EventType.MOUSE_MOVE, (event: EventMouse) => {
            if (this._mouseDown) {
                let pos = GameMain.inst.MainCamera.node.position.add(new Vec3(-event.movementX, event.movementY, 0));
                if (pos.x < -moveDistX) {
                    pos.x = -moveDistX;
                }
                else if (pos.x > moveDistX) {
                    pos.x = moveDistX;
                }
                if (pos.y < -moveDistY) {
                    pos.y = -moveDistY;
                }
                else if (pos.y > moveDistY) {
                    pos.y = moveDistY;
                }
                GameMain.inst.MainCamera.node.setPosition(pos);
            }
        }, this);
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();
    
        GameMain.inst.MainCamera.node.setPosition(this._curCameraPos.clone());
        GameMain.inst.MainCamera.camera.orthoHeight = this._curCameraZoom * GameMain.inst.outSceneMap.mapBG.cameraOriginalOrthoHeight;
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();

        this._curCameraPos = GameMain.inst.MainCamera.node.position.clone();
        this._curCameraZoom = GameMain.inst.MainCamera.camera.orthoHeight / GameMain.inst.outSceneMap.mapBG.cameraOriginalOrthoHeight;
    }
}