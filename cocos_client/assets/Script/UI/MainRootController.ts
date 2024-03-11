import { Component, _decorator } from "cc";
import UserInfoMgr from "../Manger/UserInfoMgr";

const {ccclass, property} = _decorator;


@ccclass('MainRootController')
export class MainRootController extends Component {
    protected onLoad(): void {
        this.node.getChildByName("RookieGuide").active = !UserInfoMgr.Instance.isFinishRookie;
    }
}