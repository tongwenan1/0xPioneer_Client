import { _decorator, Camera, Component, Mask, Node, Size, UITransform, v3, Vec3 } from "cc";
import ViewController from "../../BasicView/ViewController";
import UIPanelManger from "../../Basic/UIPanelMgr";
import GameMainHelper from "../../Game/Helper/GameMainHelper";
const { ccclass, property } = _decorator;

@ccclass("RookieStepMaskUI")
export class RookieStepMaskUI extends ViewController {
    private _nextActionCallback: () => void = null;

    private _maskView: Node = null;
    private _bgView: Node = null;
    private _instructView: Node = null;
    private _actionButton: Node = null;

    public configuration(isFromGameView: boolean, worldPos: Vec3, size: Size, nextActionCallback: () => void) {
        const localPos = isFromGameView
            ? GameMainHelper.instance.getGameCameraWposToUI(worldPos, this.node)
            : this.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);

        this._maskView.position = localPos;
        this._maskView.getComponent(UITransform).setContentSize(size);

        this._bgView.position = v3(-this._maskView.position.x, -this._maskView.position.y, this._bgView.position.z);
        this._instructView.position = localPos;

        this._actionButton.position = localPos;
        this._actionButton.getComponent(UITransform).contentSize = size;

        this._nextActionCallback = nextActionCallback;
    }

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._maskView = this.node.getChildByPath("Mask");
        this._bgView = this._maskView.getChildByPath("Bg");
        this._instructView = this.node.getChildByPath("Click_A");
        this._actionButton = this.node.getChildByPath("ActionButton");
    }

    protected viewDidStart(): void {
        super.viewDidStart();
    }

    //---------------------------------------- action
    private onTapAction() {
        UIPanelManger.inst.popPanel(this.node);
        if (this._nextActionCallback != null) {
            this._nextActionCallback();
        }
    }
}
