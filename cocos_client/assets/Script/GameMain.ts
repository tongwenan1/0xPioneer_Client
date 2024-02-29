import { _decorator, Component, Node, Camera, EventHandler } from 'cc';
import { MainUI } from './UI/MainUI';
import EventMgr from './Manger/EventMgr';
import { EventName } from './Const/ConstDefine';
import { MapOutScene } from './Scene/MapOutScene';
import { MapInnerScene } from './Scene/MapInnerScene';
import UserInfoMgr from './Manger/UserInfoMgr';
import { AudioMgr } from './Basic/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('GameMain')
export class GameMain extends Component {

    @property(Camera)
    MainCamera: Camera;

    @property(Camera)
    UICamera: Camera;

    @property(Node)
    InnerScene: Node;

    @property(Node)
    OutScene: Node;

    @property(MainUI)
    UI: MainUI;


    public static inst: GameMain;

    public outSceneMap: MapOutScene;
    public innerSceneMap: MapInnerScene;

    protected _currentScene: Node;

    public changeScene() {
        if (this._currentScene == this.InnerScene) {
            this.InnerScene.active = false;
            this.OutScene.active = true;

            this._currentScene = this.OutScene;
        }
        else {
            this.InnerScene.active = true;
            this.OutScene.active = false;

            this._currentScene = this.InnerScene;

            GameMain.inst.UI.ChangeCursor(0);
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

    async onLoad() {
        GameMain.inst = this;
        UserInfoMgr.Instance;
        this.outSceneMap = this.OutScene.getComponent(MapOutScene);
    }
    
    start() {
        this.InnerScene.active = false;
        this.OutScene.active = true;
        this.innerSceneMap = this.InnerScene.getComponent(MapInnerScene);
    }

    update(deltaTime: number) {

    }
}


