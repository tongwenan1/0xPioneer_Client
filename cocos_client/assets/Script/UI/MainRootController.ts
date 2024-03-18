import { CCBoolean, Component, _decorator } from "cc";
import UserInfoMgr from "../Manger/UserInfoMgr";

const { ccclass, property } = _decorator;


@ccclass('MainRootController')
export class MainRootController extends Component {
    @property(CCBoolean)
    private canShowRookieGuide: boolean = true;

    protected onLoad(): void {
        const rookieGuideView = this.node.getChildByName("RookieGuide");
        if (this.canShowRookieGuide) {
            rookieGuideView.active = !UserInfoMgr.Instance.isFinishRookie;
        } else {
            rookieGuideView.active = false;
        }
    }
}