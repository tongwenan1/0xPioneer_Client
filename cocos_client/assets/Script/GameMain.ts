import { _decorator, Component, Node, Camera, EventHandler, Vec3, tween } from 'cc';
import { EventName } from './Const/ConstDefine';
import { MapOutScene } from './Scene/MapOutScene';
import { MapInnerScene } from './Scene/MapInnerScene';
import { EventMgr } from './Utils/Global';
import ViewController from './BasicView/ViewController';
const { ccclass, property } = _decorator;

@ccclass('GameMain')
export class GameMain extends ViewController {

    @property(Camera)
    MainCamera: Camera;

    @property(Node)
    InnerScene: Node;

    @property(Node)
    OutScene: Node;

    public static inst: GameMain;

    public outSceneMap: MapOutScene;
    public innerSceneMap: MapInnerScene;

    protected _currentScene: Node;

    public changeScene() {
        // inner and outer need hide first, then show
        if (this._currentScene == this.InnerScene) {
            this.InnerScene.active = false;
            this.OutScene.active = true;

            this._currentScene = this.OutScene;
        }
        else {
            this.OutScene.active = false;
            this.InnerScene.active = true;

            this._currentScene = this.InnerScene;

            EventMgr.emit(EventName.CHANGE_CURSOR, { index: 0 });
        }

        EventMgr.emit(EventName.SCENE_CHANGE);
    }

    public getCurrentScene(): Node {
        return this._currentScene;
    }
    /**
     * is inner-city
     * @returns 
     */
    public isInnerScene(): boolean {
        return this._currentScene == this.InnerScene;
    }

    private _gameCamera: Camera = null;
    private _originalGameCameraOrthoHeight: number = 0;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        GameMain.inst = this;
        this.outSceneMap = this.OutScene.getComponent(MapOutScene);

        this._gameCamera = this.node.getChildByPath("GameCamera").getComponent(Camera);
        this._originalGameCameraOrthoHeight = this._gameCamera.camera.orthoHeight;
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        this.InnerScene.active = false;
        this.OutScene.active = true;
        this.innerSceneMap = this.InnerScene.getComponent(MapInnerScene);

        EventMgr.on(EventName.CHANGE_GAMECAMERA_POSITION, this._changeGameCameraPosition, this);
        EventMgr.on(EventName.CHANGE_GAMECAMERA_ZOOM, this._changeGameCameraZoom, this);
    }
    
    //-------------------------------------- event
    private _changeGameCameraPosition(data: { isWorldPos: boolean, pos: Vec3, isAnim: boolean }) { 
        if (data.isAnim) {
            
        } else {
            if (data.isWorldPos) {
                this._gameCamera.node.worldPosition = data.pos;
            } else {
                this._gameCamera.node.position = data.pos;
            }
        }
    }

    private _changeGameCameraZoom(data: { isAnim: boolean, zoom: number }) {
        if (data.isAnim) {
            tween()
            .target(this._gameCamera)
            .to(0.5, { orthoHeight: this._originalGameCameraOrthoHeight * data.zoom })
            .call(()=> {
                
            })
            .start();
        } else {
            this._gameCamera.orthoHeight = this._originalGameCameraOrthoHeight * data.zoom;
        }
    }
}


