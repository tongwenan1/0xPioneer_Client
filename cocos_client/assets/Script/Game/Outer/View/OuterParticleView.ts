import { _decorator, Component, Node, ParticleSystem2D } from 'cc';
import EventMgr from '../../../Manger/EventMgr';
import { EventName } from '../../../Basic/ConstDefine';
const { ccclass, property } = _decorator;

@ccclass('OuterParticleView')
export class OuterParticleView extends Component {

    protected onLoad(): void {
    }

    start() {
        EventMgr.on(EventName.MAP_SCALED, this.mapScaled, this);
    }

    update(deltaTime: number) {
        
    }
    
    private mapScaled() {
        if (this.node.getComponent(ParticleSystem2D) != null) {
            this.node.getComponent(ParticleSystem2D).resetSystem();
        }
    }
}

