import { _decorator, Button, Component, EventHandler, instantiate, Label, Layout, Node } from 'cc';
import { GameMain } from '../../GameMain';
import PioneerMgr from '../../Manger/PioneerMgr';
import UserInfo from '../../Manger/UserInfoMgr';
import { PopUpUI } from '../../BasicView/PopUpUI';
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

    }

    start() {

    }

    update(deltaTime: number) {

    }


    private _refreshUI() {
        if (this._talk == null ||
            this._dialogStep > this._talk.messsages.length - 1) {
            return;
        }
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
            dialogView.getChildByPath("dialog_bg/Label").getComponent(Label).string = currentMesssage.text;
            for (const roleName of this._roleNames) {
                dialogView.getChildByName(roleName).active = roleName == currentMesssage.name;
            }
        } else if (currentMesssage.type == "action") {
            if ( currentMesssage.text != undefined) {
                dialogView.active = true;
                dialogView.getChildByName("name_bg").active = false;
                dialogView.getChildByName("player_name").active = false;
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
                    button.getChildByName("Label").getComponent(Label).string = currentMesssage.select[i];
                    button.getComponent(Button).clickEvents[0].customEventData = currentMesssage.select[i];
                } else {
                    button.active = false;
                }
            }
        }
    }

    //------------------------------------------------ action
    private onTapNext() {
        this._dialogStep += 1;
        if (this._dialogStep > this._talk.messsages.length - 1) {
            GameMain.inst.UI.dialogueUI.show(false);
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
            GameMain.inst.UI.ShowTip("Obtain new tasks, which can be viewed in the battle report");

        } else if (this._task.exitpoint != null &&
            this._task.exitpoint.result.includes(customEventData)) {
            // reject task action
            for (const temp of this._task.exitpoint.action) {
                PioneerMgr.instance.dealWithTaskAction(temp.type, 0);
            }
        }
        this._dialogStep += 1;
        if (this._dialogStep > this._talk.messsages.length - 1) {
            GameMain.inst.UI.dialogueUI.show(false);
        } else {
            this._refreshUI();
        }
    }
}


