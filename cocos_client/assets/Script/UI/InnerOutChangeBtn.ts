import { _decorator, Component, Node, Button, SpriteFrame, Sprite, resources } from 'cc';
import { EventName } from '../Const/ConstDefine';
import { GameMain } from '../GameMain';
import EventMgr from '../Manger/EventMgr';
import LanMgr from '../Manger/LanMgr';
const { ccclass, property } = _decorator;

@ccclass('InnerOutChangeBtn')
export class InnerOutChangeBtn extends Component {
    
    @property(SpriteFrame)
    InnerIcon:SpriteFrame;

    @property(SpriteFrame)
    OutIcon:SpriteFrame;

    _sprite:Sprite;

    async refreshUI(): Promise<void> {
        // useLanMgr
        let innerIcon = LanMgr.Instance.getLanById("107549");
        let outIcon = LanMgr.Instance.getLanById("107549");

        const innerIconFrame = await new Promise((resolve) => {
            resources.load(innerIcon+"/spriteFrame", SpriteFrame, (err: Error, icon) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(icon);
            });
        });
        if (innerIconFrame != null) {
            this.InnerIcon = innerIconFrame as SpriteFrame;
        }

        const outIconFrame = await new Promise((resolve) => {
            resources.load(outIcon+"/spriteFrame", SpriteFrame, (err: Error, icon) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(icon);
            });
        });
        if (outIconFrame != null) {
            this.OutIcon = outIconFrame as SpriteFrame;
        }

        this.onSceneChange();
    }

    onLoad(): void {
        EventMgr.on(EventName.LOADING_FINISH, this.refreshUI, this);
        EventMgr.on(EventName.CHANGE_LANG, this.refreshUI, this);
    }

    start() {

        this._sprite = this.node.getComponent(Sprite);
        
        EventMgr.on(EventName.SCENE_CHANGE, this.onSceneChange,this);

        this.node.on(Node.EventType.MOUSE_DOWN, (event) => {
            GameMain.inst.changeScene();
        }, this)
        
    }

    onDestroy(): void {
        EventMgr.off(EventName.CHANGE_LANG, this.refreshUI, this);
        EventMgr.off(EventName.LOADING_FINISH, this.refreshUI, this);
    }
    
    onSceneChange() {
        if(GameMain.inst.isInnerScene()){
            this._sprite.spriteFrame = this.OutIcon;
        }
        else {
            this._sprite.spriteFrame = this.InnerIcon;
        }
    }

    update(deltaTime: number) {
        
    }


}


