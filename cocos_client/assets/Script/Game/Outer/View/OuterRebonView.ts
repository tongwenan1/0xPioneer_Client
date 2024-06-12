import { _decorator, Component} from "cc";
const { ccclass, property } = _decorator;

@ccclass("OuterRebonView")
export class OuterRebonView extends Component {
    private _isBuilding: boolean = false;
    private _rebonTime: number = 0;

    public refreshUI(isBuilding: boolean, rebonTime: number) {
        this._isBuilding = isBuilding;
        this._rebonTime = rebonTime;
    }

    protected onLoad(): void {
        this.node.getChildByPath("Content").active = false;
    }

    start() {}

    update(deltaTime: number) {
        const currentTime: number = new Date().getTime();
        if (currentTime < this._rebonTime && (this._rebonTime - currentTime) / 1000 <= 15) {
            this.node.getChildByPath("Content").active = true;
            this.node.getChildByPath("Content/BuildingAnim").active = this._isBuilding;
            this.node.getChildByPath("Content/PioneerAnim").active = !this._isBuilding;
        } else {
            this.node.getChildByPath("Content").active = false;
        }
    }
}
