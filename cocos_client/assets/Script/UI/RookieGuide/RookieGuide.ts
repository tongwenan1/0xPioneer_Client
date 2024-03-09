import { _decorator, Animation, Button, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RookieGuide')
export class RookieGuide extends Component {

    private _videoView: Node = null;
    private _guideView: Node = null;

    private _wakeUpTimes: number = 0;
    protected onLoad(): void {
        this._videoView = this.node.getChildByName("VideoContent");
        this._guideView = this.node.getChildByName("GuideContent");

        this._videoView.active = true;
        this._guideView.active = false;
        // useLanMgr 
        // this._videoView.getChildByPath("SkipButton/Label").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
    }
    start() {

    }

    update(deltaTime: number) {

    }

    //---------------------------------------
    // action
    private onTapSkipVideo() {
        this._videoView.active = false;
        this._guideView.active = true;
    }

    private onTapWakeUpRole() {
        if (this._wakeUpTimes >= 3) {
            return;
        }
        this._wakeUpTimes += 1;
        const wakeUpTipView = this._guideView.getChildByPath("Dialog/dialog_bg/WakeUpTip");
        wakeUpTipView.getChildByName("Exclamation_" + this._wakeUpTimes).active = true;
        if (this._wakeUpTimes >= 3) {
            this._guideView.getChildByName("WakeUpGroup").active = true;
            this.scheduleOnce(() => {
                const openEyesView = this._guideView.getChildByName("OpenEyes");
                openEyesView.active = true;
                openEyesView.getComponent(Animation).play();
                openEyesView.getComponent(Animation).on(Animation.EventType.FINISHED, ()=> {
                    this.node.active = false;
                });
                this._guideView.getChildByName("Bg").active = false;
                this._guideView.getChildByName("Dialog").active = false;
                this._guideView.getChildByName("WakeUpGroup").active = false;
            }, 0.8);
        }
    }
}


