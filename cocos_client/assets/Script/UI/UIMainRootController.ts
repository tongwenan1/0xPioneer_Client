import { CCBoolean, Component, ImageAsset, _decorator } from "cc";
import { ItemMgr, UIPanelMgr, UserInfoMgr } from "../Utils/Global";
import { UIName } from "../Const/ConstUIDefine";
import ViewController from "../BasicView/ViewController";
import { ECursorStyle, ECursorType } from "../Const/ConstDefine";
import { MouseCursor } from "./MouseCursor";
import NotificationMgr from "../Basic/NotificationMgr";
import ItemData from "../Model/ItemData";
import { NotificationName } from "../Const/Notification";
import { DialogueUI } from "./Outer/DialogueUI";
import TaskConfig from "../Config/TaskConfig";
import TalkConfig from "../Config/TalkConfig";

const { ccclass, property } = _decorator;


@ccclass('UIMainRootController')
export class UIMainRootController extends ViewController {
    public async showMain() {
        const view = await UIPanelMgr.openPanel(UIName.MainUI);
        view?.setSiblingIndex(0);
        if (this.canShowRookieGuide && !UserInfoMgr.isFinishRookie) {
            const rookieView = await UIPanelMgr.openPanel(UIName.RookieGuide);
            rookieView?.setSiblingIndex(1);
        }
    }

    @property([ImageAsset])
    cursorImages: ImageAsset[] = [];

    @property(CCBoolean)
    private canShowRookieGuide: boolean = true;

    protected async viewDidLoad(): Promise<void> {
        super.viewDidLoad();

        MouseCursor.SetCursorStyle(ECursorStyle.url, this.cursorImages[ECursorType.Common].nativeUrl);

        UIPanelMgr.setUIRootView(this.node);
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
        const dialog = await UIPanelMgr.openPanel(UIName.DialogueUI);
        if (dialog != null) {
            dialog.getComponent(DialogueUI).dialogShow(talkData, null);
        }
    }
}