import { _decorator, Component, Node, Button, SpriteFrame, Sprite } from 'cc';
import { EventName } from '../Basic/ConstDefine';
import { GameMain } from '../GameMain';
import EventMgr from '../Manger/EventMgr';
const { ccclass, property } = _decorator;

@ccclass('InnerOutChangeBtn')
export class InnerOutChangeBtn extends Component {
    
    @property(SpriteFrame)
    InnerIcon:SpriteFrame;

    @property(SpriteFrame)
    OutIcon:SpriteFrame;

    _sprite:Sprite;

    start() {

        this._sprite = this.node.getComponent(Sprite);
        
        EventMgr.on(EventName.SCENE_CHANGE, this.onSceneChange,this);

        this.node.on(Node.EventType.MOUSE_DOWN, (event) => {
            GameMain.inst.changeScene();
        }, this)
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


