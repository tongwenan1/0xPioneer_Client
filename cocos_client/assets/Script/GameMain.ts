import { _decorator, Component, Node, Camera } from 'cc';
import { LocalDatas } from './Datas/LocalDatas';
import { MainUI } from './UI/MainUI';
import EventMgr from './Manger/EventMgr';
import { EventName } from './Datas/ConstDefine';
import { MapOutScene } from './Scene/MapOutScene';
import { MapInnerScene } from './Scene/MapInnerScene';
import UserInfoMgr from './v2/DataMgr/user_Info';
const { ccclass, property } = _decorator;

@ccclass('GameMain')
export class GameMain extends Component {

    @property(Camera)
    MainCamera:Camera;

    @property(Camera)
    UICamera:Camera;

    @property(Node)
    InnerScene:Node;

    @property(Node)
    OutScene:Node;

    @property(MainUI)
    UI:MainUI;

    public static inst:GameMain;
    public static localDatas:LocalDatas;

    public outSceneMap:MapOutScene;
    public innerSceneMap:MapInnerScene;
    
    protected _currentScene:Node;

    constructor() {
        super();

        GameMain.localDatas = new LocalDatas();
        GameMain.localDatas.InitData();
        
        GameMain.inst = this;

        UserInfoMgr.Instance;
    }



    public changeScene() {
        if(this._currentScene == this.InnerScene) {
            this.InnerScene.active = false;
            this.OutScene.active = true;

            this._currentScene = this.OutScene;
        }
        else {
            this.InnerScene.active = true;
            this.OutScene.active = false;

            this._currentScene = this.InnerScene;
        }

        EventMgr.emit(EventName.SCENE_CHANGE);
    }

    public getCurrentScene():Node {
        return this._currentScene;
    }
    /**
     * is inner-city
     * @returns 
     */
    public isInnerScene():boolean {
        return this._currentScene == this.InnerScene;
    }

    onLoad() {

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


