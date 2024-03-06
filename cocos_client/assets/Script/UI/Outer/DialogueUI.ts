import { _decorator, Button, Component, EventHandler, instantiate, Label, Layout, Node } from 'cc';
import { GameMain } from '../../GameMain';
import PioneerMgr from '../../Manger/PioneerMgr';
import UserInfo from '../../Manger/UserInfoMgr';
import { PopUpUI } from '../../BasicView/PopUpUI';
import CountMgr, { CountType } from '../../Manger/CountMgr';
import LanMgr from '../../Manger/LanMgr';
import EventMgr from '../../Manger/EventMgr';
import { EventName } from '../../Const/ConstDefine';
const { ccclass, property } = _decorator;

@ccclass('DialogueUI')
export class DialogueUI extends PopUpUI {
    public dialogShow(talk: any, task: any) {
        this._talk = talk;
        this._task = task;
        this._dialogStep = 0;
        this._refreshUI();
    }

    public override get typeName() {
        return "DialogueUI";
    }

    private _talk: any = null;
    private _task: any = null;
    private _dialogStep: number = 0;
    private _roleNames: string[] = [
        "artisan",
        "doomsdayGangBigTeam",
        "doomsdayGangSpy",
        "doomsdayGangTeam",
        "hunter",
        "prophetess",
        "rebels",
        "secretGuard"
    ];
    onLoad(): void {
        EventMgr.on(EventName.CHANGE_LANG, this._refreshUI, this);
    }
    start() {

    }
    update(deltaTime: number) {

    }
    onDestroy(): void {
        EventMgr.off(EventName.CHANGE_LANG, this._refreshUI, this);
    }


    private _refreshUI() {
        if (this._talk == null ||
            this._dialogStep > this._talk.messsages.length - 1) {
            return;
        }
        
        // useLanMgr
        // this.node.getChildByPath("Dialog/NextButton/Label").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        const dialogView = this.node.getChildByName("Dialog");
        const selectView = this.node.getChildByName("SelectView");

        dialogView.getChildByName("NextButton").active = true;

        const currentMesssage = this._talk.messsages[this._dialogStep];
        if (currentMesssage.type == null || currentMesssage.type == "chat") {
            dialogView.active = true;
            selectView.active = false;
            if (this._roleNames.indexOf(currentMesssage.name) != -1) {
                dialogView.getChildByName("name_bg").active = true;
                dialogView.getChildByPath("name_bg/Label").getComponent(Label).string = currentMesssage.name;

                dialogView.getChildByName("player_name").active = false;
            } else {
                dialogView.getChildByName("name_bg").active = false;

                dialogView.getChildByName("player_name").active = true;
                dialogView.getChildByPath("player_name/Label").getComponent(Label).string = UserInfo.Instance.playerName;
            }

            // useLanMgr
            // dialogView.getChildByPath("dialog_bg/Label").getComponent(Label).string = LanMgr.Instance.getLanById(currentMesssage.text);
            dialogView.getChildByPath("dialog_bg/Label").getComponent(Label).string = currentMesssage.text;

            for (const roleName of this._roleNames) {
                dialogView.getChildByName(roleName).active = roleName == currentMesssage.name;
            }
        } else if (currentMesssage.type == "action") {
            if ( currentMesssage.text != undefined) {
                dialogView.active = true;
                dialogView.getChildByName("name_bg").active = false;
                dialogView.getChildByName("player_name").active = false;

                // useLanMgr
                // dialogView.getChildByPath("dialog_bg/Label").getComponent(Label).string = LanMgr.Instance.getLanById(currentMesssage.text);
                dialogView.getChildByPath("dialog_bg/Label").getComponent(Label).string = currentMesssage.text;

                for (const roleName of this._roleNames) {
                    dialogView.getChildByName(roleName).active = false;
                }
            }
            else {
                dialogView.active = false;
            } 
            selectView.active = true;
            dialogView.getChildByName("NextButton").active = false;
            
            for (let i = 0; i < 2; i++) {
                const button = selectView.getChildByName("Button_" + i);
                if (i < currentMesssage.select.length) {
                    button.active = true;

                    // useLanMgr
                    button.getChildByName("Label").getComponent(Label).string = LanMgr.Instance.getLanById(currentMesssage.select[i]);
                    // button.getChildByName("Label").getComponent(Label).string = currentMesssage.select[i];

                    button.getComponent(Button).clickEvents[0].customEventData = currentMesssage.select[i];
                } else {
                    button.active = false;
                }
            }
        }
    }

    private _talkOver() {
        //talk over
        if (UserInfo.Instance.afterTalkItemGetData.has(this._talk.id)) {
            GameMain.inst.UI.itemInfoUI.showItem(UserInfo.Instance.afterTalkItemGetData.get(this._talk.id), true);
            UserInfo.Instance.afterTalkItemGetData.delete(this._talk.id);
        }
    }

    //------------------------------------------------ action
    private onTapNext() {
        this._dialogStep += 1;
        if (this._dialogStep > this._talk.messsages.length - 1) {
            GameMain.inst.UI.dialogueUI.show(false);
            this._talkOver();
        } else {
            this._refreshUI();
        }
    }

    private onTapAction(event: Event, customEventData: string) {
        if (this._talk == null) {
            return;
        }
        if (this._task.entrypoint.result.includes(customEventData)) {
            // get task
            UserInfo.Instance.getNewTask(this._task);

            // useLanMgr
            // GameMain.inst.UI.NewTaskTip(LanMgr.Instance.getLanById("107549"));
            GameMain.inst.UI.NewTaskTip("New Task Taken");

        } else if (this._task.exitpoint != null &&
            this._task.exitpoint.result.includes(customEventData)) {
            // reject task action
            for (const temp of this._task.exitpoint.action) {
                PioneerMgr.instance.dealWithTaskAction(temp.type, 0);
            }
        }

        CountMgr.instance.addNewCount({
            type: CountType.selectDialog,
            timeStamp: new Date().getTime(),
            data: {
                selectText: customEventData
            }
        });

        this._dialogStep += 1;
        if (this._dialogStep > this._talk.messsages.length - 1) {
            GameMain.inst.UI.dialogueUI.show(false);
            this._talkOver();
        } else {
            this._refreshUI();
        }
    }
}


