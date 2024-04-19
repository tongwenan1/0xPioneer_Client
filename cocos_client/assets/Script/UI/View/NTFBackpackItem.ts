import { _decorator, Component, Label } from "cc";
import { NFTPioneerObject } from "../../Const/NFTPioneerDefine";
const { ccclass, property } = _decorator;

@ccclass("NTFBackpackItem")
export class NTFBackpackItem extends Component {
    public async refreshUI(model: NFTPioneerObject = null) {
        const propView = this.node.getChildByName("Prop");
        if (model == null) {
            propView.active = false;
        } else {
            propView.active = true;
            // levelBg
            for (let i = 1; i <= 5; i++) {
                propView.getChildByName("Level" + i).active = i == model.rarity;
            }
            // name
            propView.getChildByName("Name").getComponent(Label).string = model.name;
        }
    }
}
