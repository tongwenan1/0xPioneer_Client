import { _decorator, Component, Label } from "cc";
import { NFTPioneerObject } from "../../Const/NFTPioneerDefine";
const { ccclass, property } = _decorator;

@ccclass("NTFBackpackItem")
export class NTFBackpackItem extends Component {
    public async refreshUI(model: NFTPioneerObject = null) {
        if (model == null) {
            return;
        }
        console.log("exce mo:", model);
        this.node.getChildByPath("Level").getComponent(Label).string = "Lv." + model.level;
        this.node.getChildByPath("RankBg/Label").getComponent(Label).string = "R" + model.rarity;
        this.node.getChildByPath("Name").getComponent(Label).string = model.name;
    }
}
