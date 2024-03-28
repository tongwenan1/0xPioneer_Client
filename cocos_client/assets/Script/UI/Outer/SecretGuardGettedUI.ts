import { _decorator, Component, Label, Node, tween } from 'cc';
import { GameMain } from '../../GameMain';
import { LanMgr, UIPanelMgr, UserInfoMgr } from '../../Utils/Global';
import ViewController from '../../BasicView/ViewController';
import { UIName } from '../../Const/ConstUIDefine';
import { ItemInfoUI } from '../ItemInfoUI';
import { ArtifactInfoUI } from '../ArtifactInfoUI';
import ItemConfigDropTool from '../../Tool/ItemConfigDropTool';
const { ccclass, property } = _decorator;

@ccclass('SecretGuardGettedUI')
export class SecretGuardGettedUI extends ViewController {

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
            .call(async () => {
                UIPanelMgr.removePanelByNode(this.node);
                if (UserInfoMgr.afterCivilizationClosedShowItemDatas.length > 0) {
                    ItemConfigDropTool.showItemGetted(UserInfoMgr.afterCivilizationClosedShowItemDatas);
                    UserInfoMgr.afterCivilizationClosedShowItemDatas = [];
                }
                if (UserInfoMgr.afterCivilizationClosedShowArtifactDatas.length > 0) {
                    const view = await UIPanelMgr.openPanel(UIName.ArtifactInfoUI);
                    if (view != null) {
                        view.getComponent(ArtifactInfoUI).showItem(UserInfoMgr.afterCivilizationClosedShowArtifactDatas);
                    }
                    UserInfoMgr.afterCivilizationClosedShowArtifactDatas = [];
                }
            })
            .start();
    }
}


