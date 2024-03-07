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


        // useLanMgr
        const keen = [
            "Dual Guns Jack",//LanMgr.Instance.getLanById("107549");
            "Dual Blades Keen",//LanMgr.Instance.getLanById("107549");
            "Rebels Camus"//LanMgr.Instance.getLanById("107549");
        ];
        const wind = [
            "Gunman as Graceful as a Gazelle",//LanMgr.Instance.getLanById("107549");
            "Warrior as Wild as the Wind",//LanMgr.Instance.getLanById("107549");
            "Berserker as Fearless as a Beast"//LanMgr.Instance.getLanById("107549");
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


