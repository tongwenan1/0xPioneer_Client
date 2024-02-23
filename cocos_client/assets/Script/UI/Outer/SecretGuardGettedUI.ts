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
        for (const name of names) {
            this.node.getChildByPath("bgc/" + name).active = name == pioneerName;
        }
        this.node.getChildByPath("lable/Label keen").getComponent(Label).string = pioneerName;
        
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


