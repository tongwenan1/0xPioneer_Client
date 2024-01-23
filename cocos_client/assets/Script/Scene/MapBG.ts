import { _decorator, Component, Node, Vec2, Vec3, Camera, UITransform, Input, input, Prefab } from 'cc';
import { GameMain } from '../GameMain';
import { PopUpUI } from '../UI/TemplateUI/PopUpUI';
import * as cc from "cc";
import { TileMapHelper } from '../v2/Tiledmap/tiletool';
const { ccclass, property } = _decorator;

@ccclass('MapBG')
export class MapBG extends Component {

    @property(Prefab)
    tiledmap: Prefab

    _mouseDown: boolean = false;

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

        this.node.on(Node.EventType.MOUSE_DOWN, (event) => {
            thisptr._mouseDown = true;

            console.log("MapBG MOUSE_DOWN");
            PopUpUI.hideAllShowingPopUpUI();
        }, this);

        this.node.on(Node.EventType.MOUSE_UP, (event) => {
            thisptr._mouseDown = false;
        }, this);

        this.node.on(Node.EventType.MOUSE_MOVE, (event: MouseEvent) => {
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

                //console.log(`pos:${pos}, ${moveDistX}, ${moveDistY}, ${thisptr.MainCamera.node.position}`);
            }
        }, this)

        this.InitTileMap();
    }

    private _tiledhelper: TileMapHelper;
    InitTileMap(): void {
        if (this.tiledmap == null)
            return;
        var node = cc.instantiate(this.tiledmap);
        this.node.addChild(node);
        var _tilemap = node.getComponent(cc.TiledMap);
        let c = new cc.Color(255, 255, 255, 200);
        _tilemap.getLayer("shadow").color = c;


        //init tiledmap by a helper class
        this._tiledhelper = new TileMapHelper(_tilemap);
        this._tiledhelper.Shadow_Init(0, 33);


    }
    private UpdateTiledmap() {

        if (this._tiledhelper == null)
            return;
        //clear the fog around my town.
        
        if (!this._clearmaintown) {
            var maintownpos = GameMain?.inst?.outSceneMap?.SelfTown?.node?.getWorldPosition();
            if (maintownpos != undefined) {
                var tiledpos = this._tiledhelper.getPosByWorldPos(maintownpos);
                this._tiledhelper.Shadow_Earse(tiledpos, 3);
                this._clearmaintown = true;
            }
        }

        //clean pioneer view
        let pioneer_data = Array.from(GameMain.localDatas.outMapData.pioneers.values());

        for (let i = 0; i < pioneer_data.length; i++) {
            if (pioneer_data[i].playerID != GameMain.inst.outSceneMap.SelfTown.playerID) {
                continue;
            }

            let pioneer = GameMain.inst.outSceneMap.SelfTown.getPioneer(pioneer_data[i].id);
            let ppos = pioneer?.node?.getWorldPosition();
            if (ppos == undefined) {
                continue;
            }
            var tiledpos = this._tiledhelper.getPosByWorldPos(ppos);
            this._tiledhelper.Shadow_Earse(tiledpos, 1);
        }

    }
    private _clearmaintown = false;
    update(deltaTime: number) {
        this.UpdateTiledmap();
    }
}


