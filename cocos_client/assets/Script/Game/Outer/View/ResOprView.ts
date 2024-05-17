import { _decorator, Button, Component, Label, Layout, log, Node, UITransform, v2, v3, Vec2, Vec3 } from "cc";
import ConfigConfig from "../../../Config/ConfigConfig";
import { ConfigType, OneStepCostEnergyParam } from "../../../Const/Config";
const { ccclass, property } = _decorator;

@ccclass("ResOprView")
export class ResOprView extends Component {
    private _wormholeButton: Node = null;

    private _infoButton: Node = null;
    private _searchButton: Node = null;
    private _getButton: Node = null;
    private _attackButton: Node = null;
    private _campButton: Node = null;
    private _moveButton: Node = null;

    private _cancelButton: Node = null;

    /**
     *
     * @param actionType -1-move 0-talk 1-explore 2-collect 3-fight 4-camp 5-event 6-campcancel 7-tavern 8-worm 9-wormcancel
     */
    public show(
        worldPos: Vec3,
        actionType: number,
        moveStep: number,
        confirmCallback: (actionType: number, useEnergy: number) => void,
        wormholeAttackCallback: (useEnergy: number) => void,
        closeCallback: () => void
    ) {
        this.node.active = true;
        this.node.worldPosition = worldPos;
        this._actionType = actionType;
        this._infoButton.active = actionType == 0;
        this._searchButton.active = actionType == 1 || actionType == 5;
        this._getButton.active = actionType == 2;
        this._attackButton.active = actionType == 3;
        this._campButton.active = actionType == 4 || actionType == 8;
        this._moveButton.active = actionType == 6 || actionType == 9 || actionType == -1;
        this._wormholeButton.active = actionType == 8 || actionType == 9;
        this._cancelButton.active = true;

        this.node.getChildByPath("ContentView/ButtonView_0").active = this._wormholeButton.active;
        this.node.getChildByPath("ContentView/ButtonView_1").active =
            this._infoButton.active ||
            this._searchButton.active ||
            this._getButton.active ||
            this._attackButton.active ||
            this._campButton.active ||
            this._moveButton.active;
        this.node.getChildByPath("ContentView/ButtonView_2").active = this._cancelButton.active;
        this.node.getChildByPath("ContentView").getComponent(Layout).updateLayout();

        // action cost
        const oneStepCostEnergy = (ConfigConfig.getConfig(ConfigType.OneStepCostEnergy) as OneStepCostEnergyParam).cost;
        this._cost = oneStepCostEnergy * moveStep;
        const costView = this.node.getChildByPath("ContentView/ButtonView_1/CostView");
        if (this._cost > 0) {
            costView.active = true;
            costView.getChildByPath("CostLabel").getComponent(Label).string = "-" + this._cost;
        } else {
            costView.active = false;
        }
        this._confirmCallback = confirmCallback;
        this._wormholeAttackCallback = wormholeAttackCallback;
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
    private _wormholeAttackCallback: (useEnergy: number) => void;
    private _closeCallback: () => void = null;

    protected onLoad(): void {
        this._wormholeButton = this.node.getChildByPath("ContentView/ButtonView_0/btnWormhole");

        this._infoButton = this.node.getChildByPath("ContentView/ButtonView_1/btnInfo");
        this._searchButton = this.node.getChildByPath("ContentView/ButtonView_1/btnSearch");
        this._getButton = this.node.getChildByPath("ContentView/ButtonView_1/btnGet");
        this._attackButton = this.node.getChildByPath("ContentView/ButtonView_1/btnAttack");
        this._campButton = this.node.getChildByPath("ContentView/ButtonView_1/btnCamp");
        this._moveButton = this.node.getChildByPath("ContentView/ButtonView_1/btnMove");

        this._cancelButton = this.node.getChildByPath("ContentView/ButtonView_2/btnRemove");
    }
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

    private onTapWormholeAttack() {
        if (this._wormholeAttackCallback != null) {
            this._wormholeAttackCallback(this._cost);
        }
    }

    onCloseClick() {
        if (this._closeCallback) {
            this._closeCallback();
        }
        this.hide();
    }
}
