import { _decorator, Component, Sprite, SpriteFrame, Node } from 'cc';
import * as cc from "cc";
import { ItemMgr } from '../Utils/Global';
import ItemConfig from '../Config/ItemConfig';
import ItemData from '../Const/Item';
const { ccclass, property } = _decorator;

@ccclass('BackpackItem')
export class BackpackItem extends Component {
    public async refreshUI(item: ItemData = null) {
        const propView = this.node.getChildByName("Prop");
        if (item == null) {
            propView.active = false;
        } else {
            propView.active = true;
            const config = ItemConfig.getById(item.itemConfigId);
            // levelBg
            for (let i = 1; i <= 5; i++) {
                propView.getChildByName("Level" + i).active = i == config.grade;
            }
            // icon
            propView.getChildByName("Icon").getComponent(Sprite).spriteFrame = await ItemMgr.getItemIcon(config.icon);
            // num
            propView.getChildByName("Count").getComponent(cc.Label).string = "x" + item.count;
        }
    }
}