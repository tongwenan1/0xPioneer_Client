import { _decorator, Component, Label, Node, tween } from 'cc';
import { GameMain } from '../../GameMain';
import { PopUpUI } from '../../BasicView/PopUpUI';
const { ccclass, property } = _decorator;

@ccclass('SecretGuardGettedUI')
export class SecretGuardGettedUI extends PopUpUI {

    public dialogShow(pioneerName: string) {

        const names = [
            "secretGuard",
            "doomsdayGangSpy",
            "rebels",
        ];
        const keen = [
            "Dual Guns Jack",
            "Dual Blades Keen",
            "Rebels Camus"
        ];
        const wind = [
            "Gunman as Graceful as a Gazelle",
            "Warrior as Wild as the Wind",
            "Berserker as Fearless as a Beast"
        ]
        for (const name of names) {
            this.node.getChildByPath("bgc/" + name).active = name == pioneerName;
        }
        let index = names.indexOf(pioneerName);
        this.node.getChildByPath("lable/Label keen").getComponent(Label).string = keen[index];
        this.node.getChildByPath("lable/Label wind").getComponent(Label).string = wind[index];
        
        tween(this.node)
        .delay(2)
        .call(()=> {
            GameMain.inst.UI.serectGuardGettedUI.show(false);
        })
        .start();
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


