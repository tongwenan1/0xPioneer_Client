import { _decorator, Component, Node, ParticleSystem2D, v3 } from 'cc';
import NotificationMgr from '../../../Basic/NotificationMgr';
import { NotificationName } from '../../../Const/Notification';
const { ccclass, property } = _decorator;

@ccclass('OuterParticleView')
export class OuterParticleView extends Component {

    protected onLoad(): void {
    }

    start() {
        NotificationMgr.addListener(NotificationName.MAP_SCALED, this.mapScaled, this);
    }

    update(deltaTime: number) {
        
    }
    
    private mapScaled(scale: number) {
        this.node.setScale(v3(scale, scale, scale));
        if (this.node.getComponent(ParticleSystem2D) != null) {
            this.node.getComponent(ParticleSystem2D).resetSystem();
        }
    }
}

