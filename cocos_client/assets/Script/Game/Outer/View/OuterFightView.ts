import { _decorator, Component, Label, Node, ProgressBar, tween, v3 } from 'cc';
import { LanMgr } from '../../../Utils/Global';
const { ccclass, property } = _decorator;

@ccclass('OuterFightView')
export class OuterFightView extends Component {

    public refreshUI(attacker: { name: string, hp: number, hpMax: number }, defender: { name: string, hp: number, hpMax: number }, attackerIsSelf: boolean) {

        let selfInfo = null;
        let enemyInfo = null;
        if (attackerIsSelf) {
            selfInfo = attacker;
            enemyInfo = defender;
        } else {
            selfInfo = defender;
            enemyInfo = attacker;
        }

        const attakerView = this.node.getChildByName("Enemy");
        attakerView.getChildByName("name").getComponent(Label).string = LanMgr.getLanById(enemyInfo.name);
        attakerView.getChildByPath("Hp/progressBar").getComponent(ProgressBar).progress = enemyInfo.hp / enemyInfo.hpMax;
        attakerView.getChildByPath("Hp/Value").getComponent(Label).string = enemyInfo.hp.toString();

        const defenderView = this.node.getChildByName("Self");
        defenderView.getChildByName("name").getComponent(Label).string = LanMgr.getLanById(selfInfo.name);
        defenderView.getChildByPath("Hp/progressBar").getComponent(ProgressBar).progress = selfInfo.hp / selfInfo.hpMax;
        defenderView.getChildByPath("Hp/Value").getComponent(Label).string = selfInfo.hp.toString();
    }

    public showResult(isWin: boolean, callback: ()=> void = null) {
        const winView = this.node.getChildByName("FightWin");
        const failView = this.node.getChildByName("FightFail");

        const animView = isWin ? winView : failView;
        animView.active = true;
        animView.setPosition(v3(0, 100, 0));
        tween()
            .target(animView)
            .to(0.4, { position: v3(0, 160, 0) })
            .delay(0.1)
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


