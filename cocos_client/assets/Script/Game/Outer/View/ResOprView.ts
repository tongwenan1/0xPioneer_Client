import { _decorator, Button, Component, Label, log, Node, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResOprView')
export class ResOprView extends Component {

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
    public show(worldPos: Vec3, actionType: number, confirmCallback: () => void, closeCallback: ()=> void) {
        this.node.active = true;
        this.node.worldPosition = worldPos;

        this.btnStay.node.active = false;
        this.btnInfo.node.active = actionType == 0;
        this.btnSearch.node.active = actionType == 1 || actionType == 5;
        this.btnGetRes.node.active = actionType == 2;
        this.btnAttack.node.active = actionType == 3;
        this.btnCamp.node.active = actionType == 4;
        this._confirmCallback = confirmCallback;
        this._closeCallback = closeCallback;
    }
    public hide() {
        this.node.active = false;
    }
    public get isShow() {
        return this.node.active;
    }

    private _confirmCallback: () => void = null;
    private _closeCallback: ()=> void = null;

    start() {
    }

    update(deltaTime: number) {

    }

    onSearchClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.hide();
    }

    onGetResClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.hide();
    }

    onAtkClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.hide();
    }

    onStayClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.hide();
    }

    onCampClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
        }
        this.hide();
    }

    onInfoClick() {
        if (this._confirmCallback) {
            this._confirmCallback();
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


