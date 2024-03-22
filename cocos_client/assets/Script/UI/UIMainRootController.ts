import { CCBoolean, Component, ImageAsset, _decorator } from "cc";
import { EventMgr, UIPanelMgr, UserInfoMgr } from "../Utils/Global";
import { UIName } from "../Const/ConstUIDefine";
import ViewController from "../BasicView/ViewController";
import { ECursorStyle, EventName } from "../Const/ConstDefine";
import { MouseCursor } from "./MouseCursor";

const { ccclass, property } = _decorator;


@ccclass('UIMainRootController')
export class UIMainRootController extends ViewController {

    @property([ImageAsset])
    cursorImages: ImageAsset[] = [];

    @property(CCBoolean)
    private canShowRookieGuide: boolean = true;

    protected async viewDidLoad(): Promise<void> {
        super.viewDidLoad();

        MouseCursor.SetCursorStyle(ECursorStyle.url, this.cursorImages[0].nativeUrl);

        UIPanelMgr.setUIRootView(this.node);

        await UIPanelMgr.openPanel(UIName.MainUI);

        if (this.canShowRookieGuide && !UserInfoMgr.isFinishRookie) {
            await UIPanelMgr.openPanel(UIName.RookieGuide);
        }
    }

    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();

        EventMgr.on(EventName.CHANGE_CURSOR, this.cursorChanged, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        EventMgr.off(EventName.CHANGE_CURSOR, this.cursorChanged, this);
    }

    private cursorChanged(data: { index: number }) {
        if (data.index >= this.cursorImages.length) {
            data.index = 0;
        }
        MouseCursor.SetCursorStyle(ECursorStyle.url, this.cursorImages[data.index].nativeUrl);
    }
}