import { _decorator, Component, Node, Button, Animation, SpriteFrame, Sprite, Tween, tween } from 'cc';
import { GameMain } from '../GameMain';
const { ccclass, property } = _decorator;

@ccclass('TreasureBoxBtn')
export class TreasureBoxBtn extends Component {
    
    @property(Node)
    TreasureBoxIconNode:Node;
    
    @property(Node)
    TreasureBoxIconAniNode:Node;

    TreasureBoxIconAni:Animation;
    btn:Button;

    onLoad(){
        GameMain.inst.UI.treasureBoxBtn = this;

        this.TreasureBoxIconAni = this.TreasureBoxIconAniNode.getComponent(Animation);
    }

    start() {

        //this.node.on(Button.EventType.CLICK, this.onTreasureBoxBtnClick, this);

        this.btn = this.node.getComponent(Button);
        this.btn.enabled = false;

        this.btn.node.on(Node.EventType.MOUSE_DOWN, this.onTreasureBoxBtnClick, this);
        
        this.TreasureBoxIconNode.active = true;
        this.TreasureBoxIconAniNode.active = false;

        this.node.active = false;
    }

    set enable(v) {
        this.btn.enabled = v;
        if(v){
            this.node.active = true;
            this.TreasureBoxIconNode.active = false;
            this.TreasureBoxIconAniNode.active = true;
            this.TreasureBoxIconAni.play();
        }
        else {
            this.TreasureBoxIconNode.active = true;
            this.TreasureBoxIconAniNode.active = false;
            this.TreasureBoxIconAni.stop();
        }
    }
    get enable() {
        return this.btn.enabled;
    }

    update(deltaTime: number) {
    }

    onTreasureBoxBtnClick() {
        console.log('onTreasureBoxBtnClick');

        this.enable = false;

        GameMain.inst.UI.boxOpenUI.node.active = true;
    }
}


