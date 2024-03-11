import { _decorator, Animation, Button, Component, Label, Node } from 'cc';
import EventMgr from '../../Manger/EventMgr';
import { EventName } from '../../Const/ConstDefine';
import UserInfoMgr from '../../Manger/UserInfoMgr';
const { ccclass, property } = _decorator;

@ccclass('RookieGuide')
export class RookieGuide extends Component {

    private _videoView: Node = null;
    private _guideView: Node = null;

    private _wakeUpTimes: number = 0;
    protected onLoad(): void {
        this._videoView = this.node.getChildByName("VideoContent");
        this._guideView = this.node.getChildByName("GuideContent");

        this._videoView.active = false;
        this._guideView.active = true;
        // useLanMgr 
        // this._videoView.getChildByPath("SkipButton/Label").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
    }
    start() {
        
    }

    update(deltaTime: number) {

    }
    
    protected onDestroy(): void {
        
    }

    //---------------------------------------
    // action
    private onTapSkipVideo() {
        this._videoView.active = false;
        this._guideView.active = true;
    }

    private _animing: boolean = false;
    private onTapWakeUpRole() {
        if (this._wakeUpTimes >= 3) {
            return;
        }
        if (this._animing) {
            return;
        }
        this._wakeUpTimes += 1;
        const wakeUpTipView = this._guideView.getChildByPath("WakeupButton/WakeUpTip");
        wakeUpTipView.getChildByName("Exclamation_" + this._wakeUpTimes).active = true;
        if (this._wakeUpTimes == 1) {
            this._guideView.getChildByName("Wake_Up_01_Group").active = true;
            this._animing = true;
            this.scheduleOnce(()=> {
                this._animing = false;
                this._guideView.getChildByName("Wake_Up_01_Group").active = false;
            }, 1);
        } else if (this._wakeUpTimes == 2) {
            this._guideView.getChildByName("Wake_Up_02_Group").active = true;
            this._animing = true;
            this.scheduleOnce(()=> {
                this._animing = false;
                this._guideView.getChildByName("Wake_Up_02_Group").active = false;
            }, 1);
        } else if (this._wakeUpTimes == 3) {
            this._guideView.getChildByName("Wake_Up_Text_Group").active = true;
            this.scheduleOnce(() => {
                this._guideView.getChildByName("Wake_Up_Text_Group").active = false;
                const openEyesView = this._guideView.getChildByName("OpenEyes");
                openEyesView.active = true;
                openEyesView.getComponent(Animation).play();
                EventMgr.emit(EventName.ROOKIE_GUIDE_BEGIN_EYES, { node: this.node });
                this.scheduleOnce(()=> {
                    EventMgr.emit(EventName.ROOKIE_GUIDE_THIRD_EYES);
                }, 3);
                openEyesView.getComponent(Animation).on(Animation.EventType.FINISHED, ()=> {
                });
                this._guideView.getChildByName("Bg").active = false;
                this._guideView.getChildByName("WakeupButton").active = false;
            }, 3);
        }
    }
}


