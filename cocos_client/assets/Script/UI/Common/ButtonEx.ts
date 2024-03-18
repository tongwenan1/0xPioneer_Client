import {_decorator, Button, EventTarget} from 'cc';

const {ccclass, property} = _decorator;

export enum ButtonExEventType {
    APPLY_TRANSITION = "apply-transition",
}

@ccclass('ButtonEx')
export class ButtonEx extends Button {
    readonly eventTarget = new EventTarget();

    protected _applyTransition(state: string) {
        super._applyTransition(state);
        this.eventTarget.emit(ButtonExEventType.APPLY_TRANSITION, this, state);
    }
}
