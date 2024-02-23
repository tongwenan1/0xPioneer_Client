import { _decorator, Component, Label, Node, ProgressBar } from 'cc';
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
        attakerView.getChildByName("name").getComponent(Label).string = enemyInfo.name;
        attakerView.getChildByPath("Hp/progressBar").getComponent(ProgressBar).progress = enemyInfo.hp / enemyInfo.hpMax;
        attakerView.getChildByPath("Hp/Value").getComponent(Label).string = enemyInfo.hp.toString();

        const defenderView = this.node.getChildByName("Self");
        defenderView.getChildByName("name").getComponent(Label).string = selfInfo.name;
        defenderView.getChildByPath("Hp/progressBar").getComponent(ProgressBar).progress = selfInfo.hp / selfInfo.hpMax;
        defenderView.getChildByPath("Hp/Value").getComponent(Label).string = selfInfo.hp.toString();
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


