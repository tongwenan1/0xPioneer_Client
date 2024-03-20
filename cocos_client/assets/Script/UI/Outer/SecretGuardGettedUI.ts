import { _decorator, Component, Label, Node, tween } from 'cc';
import { GameMain } from '../../GameMain';
import { PopUpUI } from '../../BasicView/PopUpUI';
import { LanMgr, UserInfoMgr } from '../../Utils/Global';
const { ccclass, property } = _decorator;

@ccclass('SecretGuardGettedUI')
export class SecretGuardGettedUI extends PopUpUI {

    public dialogShow(pioneerAnimType: string) {

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
            this.node.getChildByPath("bgc/" + name).active = name == pioneerAnimType;
        }
        let index = names.indexOf(pioneerAnimType);
        this.node.getChildByPath("lable/Label keen").getComponent(Label).string = keen[index];
        this.node.getChildByPath("lable/Label wind").getComponent(Label).string = wind[index];

        tween(this.node)
            .delay(2)
            .call(() => {
                GameMain.inst.UI.serectGuardGettedUI.show(false);
                if (UserInfoMgr.afterCivilizationClosedShowItemDatas.length > 0) {
                    GameMain.inst.UI.itemInfoUI.showItem(UserInfoMgr.afterCivilizationClosedShowItemDatas, true);
                    UserInfoMgr.afterCivilizationClosedShowItemDatas = [];
                }
                if (UserInfoMgr.afterCivilizationClosedShowArtifactDatas.length > 0) {
                    GameMain.inst.UI.artifactInfoUI.showItem(UserInfoMgr.afterCivilizationClosedShowArtifactDatas);
                    UserInfoMgr.afterCivilizationClosedShowArtifactDatas = [];
                }
            })
            .start();
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


