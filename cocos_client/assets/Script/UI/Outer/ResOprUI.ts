import { _decorator, Button, Component, Label, log, Node, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { PopUpUI } from '../../BasicView/PopUpUI';
const { ccclass, property } = _decorator;

@ccclass('ResOprUI')
export class ResOprUI extends PopUpUI {

    public override get typeName() {
        return "ResOprUI";
    }

    @property(Button)
    btnAttack: Button = null;

    @property(Button)
    btnGetRes: Button = null;

    @property(Button)
    // defendButton
    btnStay: Button = null;

    @property(Button)
    btnInfo: Button = null;

    @property(Button)
    btnSearch: Button = null;

    @property(Button)
    btnCamp: Button = null;

    @property(Label)
    txtItemName: Label = null;

    /**
     * 
     * @param actionType 0-talk 1-explore 2-collect 3-fight 4-camp 
     */
    public showDialog(actionType: number, confirmCallback: () => void, closeCallback: ()=> void) {
        this.btnInfo.node.active = actionType == 0;
        this.btnSearch.node.active = actionType == 1 || actionType == 5;
        this.btnGetRes.node.active = actionType == 2;
        this.btnAttack.node.active = actionType == 3;
        this.btnCamp.node.active = actionType == 4;
        this._confirmCallback = confirmCallback;
        this._closeCallback = closeCallback;
    }

    private _confirmCallback: () => void = null;
    private _closeCallback: () => void = null;

    start() {
    }

    update(deltaTime: number) {

    }

    onSearchClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.show(false);
    }

    onGetResClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.show(false);
    }

    onAtkClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.show(false);
    }

    onStayClick() {
        this.show(false);
    }

    onCampClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.show(false);
    }

    onInfoClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.show(false);
    }

    onCloseClick() {
        if (this._closeCallback) {
            this._closeCallback();
        }
        this.show(false);
    }
}


