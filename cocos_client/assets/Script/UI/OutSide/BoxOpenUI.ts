import { _decorator, Component, Animation, Node, Button, tween, ParticleSystem2D } from 'cc';
import { GameMain } from '../../GameMain';
import { PopUpUI } from '../TemplateUI/PopUpUI';
const { ccclass, property } = _decorator;

@ccclass('BoxOpenUI')
export class BoxOpenUI extends Component {

    @property(Node)
    openButton:Node;
    
    @property(Node)
    cancelButton:Node;
    
    @property(Node)
    TreasureBoxNode:Node;
    @property(Node)
    TreasureBoxEff1Node:Node;
    @property(Node)
    TreasureBoxEff2Node:Node;
    @property(Node)
    backSprNode:Node;

    TreasureBoxAni:Animation;
    TreasureBoxEff1:ParticleSystem2D;
    TreasureBoxEff2:ParticleSystem2D;

    start() {
        
        this.openButton.on(Node.EventType.MOUSE_DOWN, this.onOpenBtnClick, this);
        this.cancelButton.on(Node.EventType.MOUSE_DOWN, this.onCancelBtnClick, this);
        
        this.TreasureBoxEff1 = this.TreasureBoxEff1Node.getComponent(ParticleSystem2D);
        this.TreasureBoxEff2 = this.TreasureBoxEff2Node.getComponent(ParticleSystem2D);
        this.TreasureBoxAni = this.TreasureBoxNode.getComponent(Animation);
        this.TreasureBoxAni.on(Animation.EventType.FINISHED, ()=>{
            
            this.TreasureBoxEff1.resetSystem();
            this.TreasureBoxEff2.resetSystem();
            this.TreasureBoxEff1Node.active = true;
            this.TreasureBoxEff2Node.active = true;
            
            tween(this.TreasureBoxNode)
                .to(1.0,{})
                .to(1.0, {active:false})
                .call(()=>{
                    GameMain.inst.UI.treasureBoxInfoUI.node.active = true;
                    this.backSprNode.active = false;
                }).start();

        });
    }

    update(deltaTime: number) {
        
    }

    onCancelBtnClick() {
        this.node.active = false;
    }

    onOpenBtnClick() {
        console.log('ArtifactInfoUI.onUseBtnClick');

        this.backSprNode.active = true;
        this.TreasureBoxNode.active = true;
        this.TreasureBoxAni.play();

        this.node.active = false;

        GameMain.inst.UI.treasureBoxBtn.node.active = false;
    }
}


