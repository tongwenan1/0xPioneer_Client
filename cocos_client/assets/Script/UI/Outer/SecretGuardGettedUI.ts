import { _decorator, Component, Label, Node, tween } from 'cc';
import { GameMain } from '../../GameMain';
import { PopUpUI } from '../../BasicView/PopUpUI';
import { LanMgr } from '../../Utils/Global';
const { ccclass, property } = _decorator;

@ccclass('SecretGuardGettedUI')
export class SecretGuardGettedUI extends PopUpUI {

    public dialogShow(pioneerName: string) {

        const names = [
            "secretGuard",
            "doomsdayGangSpy",
            "rebels",
        ];


        // useLanMgr
        const keen = [
            // "Dual Guns Jack",
            LanMgr.getLanById("206001"),
            // "Dual Blades Keen",
            LanMgr.getLanById("206002"),
            // "Rebels Camus"
            LanMgr.getLanById("206003")
        ];
        const wind = [
            // "Gunman as Graceful as a Gazelle"
            LanMgr.getLanById("206004"),
            // "Warrior as Wild as the Wind",
            LanMgr.getLanById("206005"),
            // "Berserker as Fearless as a Beast"
            LanMgr.getLanById("206006")
        ]
        for (const name of names) {
            this.node.getChildByPath("bgc/" + name).active = name == pioneerName;
        }
        let index = names.indexOf(pioneerName);
        this.node.getChildByPath("lable/Label keen").getComponent(Label).string = keen[index];
        this.node.getChildByPath("lable/Label wind").getComponent(Label).string = wind[index];

        tween(this.node)
            .delay(2)
            .call(() => {
                GameMain.inst.UI.serectGuardGettedUI.show(false);
            })
            .start();
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


