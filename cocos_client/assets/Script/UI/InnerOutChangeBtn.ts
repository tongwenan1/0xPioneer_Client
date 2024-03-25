import { _decorator, Component, Node, Button, SpriteFrame, Sprite, resources, Label } from 'cc';
import { EventName } from '../Const/ConstDefine';
import { GameMain } from '../GameMain';
import { LanMgr, NotificationMgr } from '../Utils/Global';
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

        NotificationMgr.addListener(EventName.SCENE_CHANGE, this.onSceneChange, this);
        NotificationMgr.addListener(EventName.LOADING_FINISH, this.refreshUI, this);
        NotificationMgr.addListener(EventName.CHANGE_LANG, this.refreshUI, this);
    }

    start() {
    }

    onDestroy(): void {
        NotificationMgr.removeListener(EventName.CHANGE_LANG, this.refreshUI, this);
        NotificationMgr.removeListener(EventName.LOADING_FINISH, this.refreshUI, this);
    }

    onSceneChange() {
        if (GameMain.inst.isInnerScene()) {
            this._sprite.spriteFrame = this.OutIcon;
            // useLanMgr
            this._label.string = LanMgr.getLanById("107549");
            this._label.string = "WORLD";
        } else {
            this._sprite.spriteFrame = this.InnerIcon;
            // useLanMgr
            // this._label.string = LanMgr.getLanById("107549");
            this._label.string = "BASE";
        }
    }

    update(deltaTime: number) {

    }


    private onTapChange() {
        GameMain.inst.changeScene();
    }
}


