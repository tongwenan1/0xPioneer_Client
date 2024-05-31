import { _decorator, Component, Label, Node } from "cc";
import CommonTools from "../../../Tool/CommonTools";
const { ccclass, property } = _decorator;

@ccclass("OuterRebonView")
export class OuterRebonView extends Component {
    private _rebonTime: number = 0;

    public refreshUI(rebonTime: number) {
        this._rebonTime = rebonTime;
    }

    protected onLoad(): void {
        this.node.getChildByPath("Rebon").active = false;
    }

    start() {
        
    }

    update(deltaTime: number) {
        const currentTime: number = new Date().getTime();
        if (currentTime < this._rebonTime && ((this._rebonTime - currentTime) / 1000) <= 15) {
            this.node.getChildByPath("Rebon").active = true;
            this.node.getChildByPath("Rebon").getComponent(Label).string = "Rebon: " + CommonTools.formatSeconds((this._rebonTime - currentTime) / 1000);
        } else {
            this.node.getChildByPath("Rebon").active = false;
        }
    }
}
