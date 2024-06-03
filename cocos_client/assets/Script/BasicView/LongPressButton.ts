import { _decorator, Component, Button, CCInteger, NodeEventType, EventHandler, CCBoolean, CCFloat } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class LongPressButton extends Component {
    @property(CCFloat)
    private longPressDuration: number = 0.5;

    @property(EventHandler)
    public shortClick: EventHandler[] = [];
    @property(CCBoolean)
    public shortClickInteractable: boolean = true;

    
    @property(EventHandler)
    public longPress: EventHandler[] = [];
    @property(CCBoolean)
    public longPressInteractable: boolean = true;


    private isLongPress: boolean = false;
    private longPressTimer: number = 0;
    onLoad() {
        this.node.on(NodeEventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(NodeEventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(NodeEventType.TOUCH_CANCEL, this._onTouchCancel, this);
    }

    private _checkLongPress(event: Event) {
        this.longPressTimer += 0.1;
        if (this.longPressTimer >= this.longPressDuration) {
            this.isLongPress = true;
            this.unschedule(this._checkLongPress);
            this._onLongPress(event);
        }
    }
    private _onShortClick(event: Event) {
        if (!this.shortClickInteractable) {
            return;
        }
        for (const handler of this.shortClick) {
            handler.emit([event]);
        }
    }
    private _onLongPress(event: Event) {
        if (!this.longPressInteractable) {
            return;
        }
        for (const handler of this.longPress) {
            handler.emit([event]);
        }
    }
    private _onLongPressEnd() {}
    private _onLongPressCancel() {}
    //----------------------------------------------- event
    private _onTouchStart(event: Event) {
        this.isLongPress = false;
        this.longPressTimer = 0;
        this.schedule(this._checkLongPress, 0.1);
    }
    private _onTouchEnd(event: Event) {
        this.unschedule(this._checkLongPress);
        if (this.isLongPress) {
            this._onLongPressEnd();
        } else {
            this._onShortClick(event);
        }
    }
    private _onTouchCancel(event: Event) {
        this.unschedule(this._checkLongPress);
        if (this.isLongPress) {
            this._onLongPressCancel();
        }
    }
}
