import { CCBoolean, Component, ImageAsset, _decorator } from "cc";
import { ItemMgr, UserInfoMgr } from "../Utils/Global";
import { UIName } from "../Const/ConstUIDefine";
import ViewController from "../BasicView/ViewController";
import { ECursorStyle, ECursorType } from "../Const/ConstDefine";
import { MouseCursor } from "./MouseCursor";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import { DialogueUI } from "./Outer/DialogueUI";
import TalkConfig from "../Config/TalkConfig";
import UIPanelManger from "../Basic/UIPanelMgr";

const { ccclass, property } = _decorator;


@ccclass('UIMainRootController')
export class UIMainRootController extends ViewController {
    public async checkShowRookieGuide() {
        if (this.canShowRookieGuide && !UserInfoMgr.isFinishRookie) {
            await UIPanelManger.inst.pushPanel(UIName.RookieGuide);
        }
    }

    @property([ImageAsset])
    cursorImages: ImageAsset[] = [];

    @property(CCBoolean)
    private canShowRookieGuide: boolean = true;

    protected async viewDidLoad(): Promise<void> {
        super.viewDidLoad();

        MouseCursor.SetCursorStyle(ECursorStyle.url, this.cursorImages[ECursorType.Common].nativeUrl);
    }

    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();

        NotificationMgr.addListener(NotificationName.CHANGE_CURSOR, this._onCursorChanged, this);
        NotificationMgr.addListener(NotificationName.DIALOG_SHOW, this._onDialogShow, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.CHANGE_CURSOR, this._onCursorChanged, this);
        NotificationMgr.removeListener(NotificationName.DIALOG_SHOW, this._onDialogShow, this);
    }

    //------------------------------------------ notification
    private _onCursorChanged(type: ECursorType) {
        if (type >= this.cursorImages.length) {
            type = 0;
        }
        MouseCursor.SetCursorStyle(ECursorStyle.url, this.cursorImages[type].nativeUrl);
    }
    private async _onDialogShow(talkId: string) {
        const talkData = TalkConfig.getById(talkId);
        if (talkData == null) {
            return;
        }
        const result = await UIPanelManger.inst.pushPanel(UIName.DialogueUI);
        if (result.success) {
            result.node.getComponent(DialogueUI).dialogShow(talkData, null);
        }
    }
}