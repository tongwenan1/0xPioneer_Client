import { _decorator, Component, Label, Node, ProgressBar, tween, v3 } from 'cc';
import { LanMgr } from '../../../Utils/Global';
const { ccclass, property } = _decorator;

@ccclass('OuterFightResultView')
export class OuterFightResultView extends Component {

    public showResult(isWin: boolean, callback: ()=> void = null) {
        const winView = this.node.getChildByName("FightWin");
        const failView = this.node.getChildByName("FightFail");

        const animView = isWin ? winView : failView;
        animView.active = true;
        animView.setPosition(v3(0, 100, 0));
        tween()
            .target(animView)
            .delay(0.1)
            .to(0.4, { position: v3(0, 160, 0) })
            .delay(0.2)
            .call(() => {
                if (callback != null) {
                    callback();
                }
            })
            .start();
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


