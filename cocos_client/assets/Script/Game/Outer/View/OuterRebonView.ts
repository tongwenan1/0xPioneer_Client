import { _decorator, Component, Label, Node } from "cc";
import CommonTools from "../../../Tool/CommonTools";
const { ccclass, property } = _decorator;

@ccclass("OuterRebonView")
export class OuterRebonView extends Component {
    private _rebonTime: number = 0;

    public refreshUI(rebonTime: number) {
        this._rebonTime = rebonTime;
    }

    start() {}

    update(deltaTime: number) {
        const currentTime: number = 0;
        if (currentTime < this._rebonTime) {
            this.node.active = true;
            this.node.getChildByPath("Rebon").getComponent(Label).string = "Rebon: " + CommonTools.formatSeconds((this._rebonTime - currentTime) / 1000);
        } else {
            this.node.active = false;
        }
    }
}
