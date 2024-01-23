import { _decorator, Component, Animation, Node, Button, tween, ParticleSystem2D } from 'cc';
import { GameMain } from '../../GameMain';
const { ccclass, property } = _decorator;

@ccclass('ArtifactInfoUI')
export class ArtifactInfoUI extends Component {

    @property(Button)
    useButton:Button;
    
    @property(Button)
    closeButton:Button;
    

    start() {
        
        this.useButton.node.on(Button.EventType.CLICK, this.onUseBtnClick, this);
        this.closeButton.node.on(Button.EventType.CLICK, ()=>{
            this.node.active = false;
        }, this);
    }

    update(deltaTime: number) {
        
    }

    onUseBtnClick() {
        console.log('ArtifactInfoUI.onUseBtnClick');

        GameMain.inst.outSceneMap.SelfTown.showArtifact(true);

        this.node.active = false;
    }
}


