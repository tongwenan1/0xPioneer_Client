import { _decorator, Component, Node, Button, SpriteFrame, Sprite, resources, Label } from 'cc';
import { EventName } from '../Const/ConstDefine';
import { GameMain } from '../GameMain';
import EventMgr from '../Manger/EventMgr';
import LanMgr from '../Manger/LanMgr';
const { ccclass, property } = _decorator;

@ccclass('InnerOutChangeBtn')
export class InnerOutChangeBtn extends Component {

    @property(SpriteFrame)
    InnerIcon: SpriteFrame;

    @property(SpriteFrame)
    OutIcon: SpriteFrame;


    async refreshUI(): Promise<void> {
        this.onSceneChange();
    }

    private _sprite: Sprite;
    private _label: Label;
    onLoad(): void {
        this._sprite = this.node.getChildByName("Icon").getComponent(Sprite);
        this._label = this.node.getChildByPath("BgWord/Label").getComponent(Label);

        EventMgr.on(EventName.SCENE_CHANGE, this.onSceneChange, this);
        EventMgr.on(EventName.LOADING_FINISH, this.refreshUI, this);
        EventMgr.on(EventName.CHANGE_LANG, this.refreshUI, this);
    }

    start() {
        


        this.node.on(Node.EventType.MOUSE_DOWN, (event) => {
            GameMain.inst.changeScene();
        }, this)
    }

    onDestroy(): void {
        EventMgr.off(EventName.CHANGE_LANG, this.refreshUI, this);
        EventMgr.off(EventName.LOADING_FINISH, this.refreshUI, this);
    }

    onSceneChange() {
        if (GameMain.inst.isInnerScene()) {
            this._sprite.spriteFrame = this.OutIcon;
            // useLanMgr
            // this._label.string = LanMgr.Instance.getLanById("107549");
            this._label.string = "WORLD";
        } else {
            this._sprite.spriteFrame = this.InnerIcon;
            // useLanMgr
            // this._label.string = LanMgr.Instance.getLanById("107549");
            this._label.string = "BASE";
        }
    }

    update(deltaTime: number) {

    }


}


