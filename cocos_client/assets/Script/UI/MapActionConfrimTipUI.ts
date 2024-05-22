import { _decorator, Component, Label, Node, tween, v3, Vec2 } from "cc";
import ViewController from "../BasicView/ViewController";
import { LanMgr } from "../Utils/Global";
import UIPanelManger from "../Basic/UIPanelMgr";
import ConfigConfig from "../Config/ConfigConfig";
import { ConfigType, OneStepCostEnergyParam } from "../Const/Config";
import GameMainHelper from "../Game/Helper/GameMainHelper";
import CommonTools from "../Tool/CommonTools";
const { ccclass, property } = _decorator;

@ccclass("MapActionConfrimTipUI")
export class MapActionConfrimTipUI extends ViewController {
    private _targetPos: Vec2 = null;
    private _stepCount: number = null;
    private _moveSpeed: number = null;
    private _actionCallback: (confirmed: boolean, cost: number) => void = null;

    private _cost: number = null;

    public configuration(targetPos: Vec2, stepCount: number, moveSpeed: number, actionCallback: (confirmed: boolean, cost: number) => void) {
        this._targetPos = targetPos;
        this._stepCount = stepCount;
        this._moveSpeed = moveSpeed;
        this._actionCallback = actionCallback;
        if (this._stepCount == null || this._moveSpeed == null || actionCallback == null) {
            return;
        }
        this._refreshUI();
    }

    protected viewDidLoad(): void {
        super.viewDidLoad();

        // useLanMgr
        // this.node.getChildByPath("Content/Title").getComponent(Label).string = LanMgr.getLanById("106008");
    }

    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByPath("Content");
    }

    private _refreshUI() {
        this._cost = (ConfigConfig.getConfig(ConfigType.OneStepCostEnergy) as OneStepCostEnergyParam).cost * this._stepCount;

        if (this._targetPos != null) {
            this.node.getChildByPath("Content/locationView/Label").getComponent(Label).string = "(" + this._targetPos.x + "," + this._targetPos.y + ")";
        }
       
        this.node.getChildByPath("Content/CostView/Value").getComponent(Label).string = this._cost.toString();
        this.node.getChildByPath("Content/MoveCountView/Value").getComponent(Label).string = this._stepCount.toString();

        const perStepTime: number = ((GameMainHelper.instance.tiledMapTilewidth * 0.5) / this._moveSpeed) * (1 / 60) * 1000;
        this.node.getChildByPath("Content/CostTimeView/Value").getComponent(Label).string = CommonTools.formatSeconds(perStepTime * this._stepCount);
        this.node.getChildByPath("Content/ArriveTimeView/Value").getComponent(Label).string = CommonTools.formatDateTime(
            perStepTime * this._stepCount + new Date().getTime()
        );
    }
    private async onTapClose() {
        if (this._actionCallback != null && this._cost != null) {
            this._actionCallback(false, this._cost);
        }
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }
    private async onTapAction() {
        if (this._actionCallback != null && this._cost != null) {
            this._actionCallback(true, this._cost);
        }
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }
}
