import { Component, _decorator } from "cc";
import UserInfoMgr from "../Manger/UserInfoMgr";

const { ccclass, property } = _decorator;


@ccclass('MainRootController')
export class MainRootController extends Component {
    protected onLoad(): void {
        const rookieGuideView = this.node.getChildByName("RookieGuide");
        rookieGuideView.active = !UserInfoMgr.Instance.isFinishRookie;
    }
}