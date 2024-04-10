import { Event, Node, ScrollView, _decorator } from "cc";

const { ccclass, property } = _decorator;

@ccclass('ManualNestedScrollView')
export default class ManualNestedScrollView extends ScrollView {
    public set forceNested(value: boolean) {
        this._forceNested = value;
    }

    private _forceNested: boolean = false;

    protected _hasNestedViewGroup(event: Event, captureListeners ?: Node []) {
        if (this._forceNested) {
            return true;
        }
        return super._hasNestedViewGroup(event, captureListeners);
    }
}