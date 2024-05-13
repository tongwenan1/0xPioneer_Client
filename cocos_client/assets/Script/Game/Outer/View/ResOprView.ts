import { _decorator, Button, Component, Label, log, Node, UITransform, v2, v3, Vec2, Vec3 } from "cc";
import ConfigConfig from "../../../Config/ConfigConfig";
import { ConfigType, OneStepCostEnergyParam } from "../../../Const/Config";
const { ccclass, property } = _decorator;

@ccclass("ResOprView")
export class ResOprView extends Component {
    @property(Button)
    btnAttack: Button = null;

    @property(Button)
    btnGetRes: Button = null;

    @property(Button)
    btnInfo: Button = null;

    @property(Button)
    btnSearch: Button = null;

    @property(Button)
    btnCamp: Button = null;

    @property(Button)
    btnMove: Button = null;

    /**
     *
     * @param actionType -1-move 0-talk 1-explore 2-collect 3-fight 4-camp 5-event 6-campcancel
     */
    public show(
        worldPos: Vec3,
        actionType: number,
        moveStep: number,
        confirmCallback: (actionType: number, useEnergy: number) => void,
        closeCallback: () => void
    ) {
        this.node.active = true;
        this.node.worldPosition = worldPos;
        this._actionType = actionType;
        this.btnInfo.node.active = actionType == 0;
        this.btnSearch.node.active = actionType == 1 || actionType == 5;
        this.btnGetRes.node.active = actionType == 2;
        this.btnAttack.node.active = actionType == 3;
        this.btnCamp.node.active = actionType == 4;
        this.btnMove.node.active = actionType == 6 || actionType == -1;
        this.node.getChildByPath("btnRemove").active = true;

        // action cost
        const oneStepCostEnergy = (ConfigConfig.getConfig(ConfigType.OneStepCostEnergy) as OneStepCostEnergyParam).cost;
        this._cost = oneStepCostEnergy * moveStep;
        if (this._cost > 0) {
            this.node.getChildByPath("CostView").active = true;
            this.node.getChildByPath("CostView/CostLabel").getComponent(Label).string = "-" + this._cost;
        } else {
            this.node.getChildByPath("CostView").active = false;
        }
        this._confirmCallback = confirmCallback;
        this._closeCallback = closeCallback;
    }
    public hide() {
        this.node.active = false;
    }
    public get isShow() {
        return this.node.active;
    }

    private _actionType: number = -1;
    private _cost: number = 0;
    private _confirmCallback: (actionType: number, useEnergy: number) => void = null;
    private _closeCallback: () => void = null;

    start() {}

    update(deltaTime: number) {}

    onSearchClick() {
        if (this._confirmCallback) {
            this._confirmCallback(this._actionType, this._cost);
        }
        this.hide();
    }

    onGetResClick() {
        if (this._confirmCallback) {
            this._confirmCallback(this._actionType, this._cost);
        }
        this.hide();
    }

    onAtkClick() {
        if (this._confirmCallback) {
            this._confirmCallback(this._actionType, this._cost);
        }
        this.hide();
    }

    onStayClick() {
        if (this._confirmCallback) {
            this._confirmCallback(this._actionType, this._cost);
        }
        this.hide();
    }

    onCampClick() {
        if (this._confirmCallback) {
            this._confirmCallback(this._actionType, this._cost);
        }
        this.hide();
    }

    onInfoClick() {
        if (this._confirmCallback) {
            this._confirmCallback(this._actionType, this._cost);
        }
        this.hide();
    }

    onMoveClick() {
        if (this._confirmCallback) {
            this._confirmCallback(this._actionType, this._cost);
        }
        this.hide();
    }

    onCloseClick() {
        if (this._closeCallback) {
            this._closeCallback();
        }
        this.hide();
    }
}
