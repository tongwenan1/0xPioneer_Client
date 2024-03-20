import { _decorator, Component, Node, Vec2, Vec3, Camera, UITransform, Input, input, Prefab, v2, v3 } from 'cc';
import { GameMain } from '../GameMain';
import * as cc from "cc";
import ConfigMgr from '../Manger/ConfigMgr';
import { PopUpUI } from '../BasicView/PopUpUI';
import { EventName } from '../Const/ConstDefine';
import EventMgr from '../Manger/EventMgr';
const { ccclass, property } = _decorator;

@ccclass('InnerMapBG')
export class InnerMapBG extends Component {

    private _mouseDown: boolean = false;
    private _curCameraPos: Vec3 = Vec3.ZERO;
    private _curCameraZoom: number = 1;
    start() {

        this._mouseDown = false;
        let thisptr = this;

        let halfCameraWidth = GameMain.inst.MainCamera.camera.width / 2;
        let halfCameraHeight = GameMain.inst.MainCamera.camera.height / 2;

        let uiTrans = this.node.getComponent(UITransform);
        let halfMapWidth = uiTrans.contentSize.width / 2;
        let halfMapHeight = uiTrans.contentSize.height / 2;

        let moveDistX = halfMapWidth - halfCameraWidth;
        let moveDistY = halfMapHeight - halfCameraHeight;

        let downx = 0;
        let downy = 0;
        this.node.on(Node.EventType.MOUSE_DOWN, (event: cc.EventMouse) => {
            thisptr._mouseDown = true;

            downx = event.getLocation().x;
            downy = event.getLocation().y;
            PopUpUI.hideAllShowingPopUpUI();
        }, this);

        this.node.on(Node.EventType.MOUSE_UP, (event: cc.EventMouse) => {
            thisptr._mouseDown = false;
            var pos = event.getLocation();

            if (downx == pos.x &&
                downy == pos.y) {

            
            };
        }, this);
        
        this.node.on(Node.EventType.MOUSE_WHEEL, (event:cc.EventMouse)=>{
            let sc = GameMain.inst.MainCamera.orthoHeight / GameMain.inst.outSceneMap.mapBG.cameraOriginalOrthoHeight;
            let config = ConfigMgr.Instance.getConfigById("10001");
            if (config.length <= 0) return;
            let useConf = config[0];

            if (event.getScrollY() > 0) {
                sc -= 0.05;
            }
            else {
                sc += 0.05;
            }
            if (sc > useConf.para[1]) {
                sc = useConf.para[1];
            }
            else if (sc < useConf.para[0]) {
                sc = useConf.para[0];
            }
            GameMain.inst.MainCamera.orthoHeight = sc * GameMain.inst.outSceneMap.mapBG.cameraOriginalOrthoHeight;
            EventMgr.emit(EventName.MAP_SCALED);
        }, this);

        this.node.on(Node.EventType.MOUSE_MOVE, (event: cc.EventMouse) => {
            if (thisptr._mouseDown) {

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

    protected onDisable(): void {
        this._curCameraPos = GameMain.inst.MainCamera.node.position.clone();
        this._curCameraZoom = GameMain.inst.MainCamera.camera.orthoHeight / GameMain.inst.outSceneMap.mapBG.cameraOriginalOrthoHeight;
    }

    protected onEnable(): void {
        GameMain.inst.MainCamera.node.setPosition(this._curCameraPos.clone());
        GameMain.inst.MainCamera.camera.orthoHeight = this._curCameraZoom * GameMain.inst.outSceneMap.mapBG.cameraOriginalOrthoHeight;
    }

    update(deltaTime: number) {

    }
}


