import { _decorator, Component, Sprite, SpriteFrame, Node } from 'cc';
import * as cc from "cc";
import ArtifactData from '../Model/ArtifactData';
import { ArtifactMgr } from '../Utils/Global';
const { ccclass, property } = _decorator;

@ccclass('ArtifactItem')
export class ArtifactItem extends Component {
    public async refreshUI(item: ArtifactData = null) {
        const propView = this.node.getChildByName("Prop");
        if (item == null) {
            propView.active = false;
        } else {
            propView.active = true;
            const config = ArtifactMgr.getArtifactConf(item.artifactConfigId);
            // levelBg
            for (let i = 1; i <= 5; i++) {
                propView.getChildByName("Level" + i).active = i == config.rank;
            }
            // icon
            propView.getChildByName("Icon").getComponent(Sprite).spriteFrame = await ArtifactMgr.getItemIcon(config.icon);

            // num
            propView.getChildByName("Count").getComponent(cc.Label).string = "x" + item.count;
        }
    }
}