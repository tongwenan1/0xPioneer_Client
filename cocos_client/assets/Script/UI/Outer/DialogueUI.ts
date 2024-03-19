import { _decorator, Button, Component, EventHandler, instantiate, Label, Layout, Node } from 'cc';
import { GameMain } from '../../GameMain';
import PioneerMgr from '../../Manger/PioneerMgr';
import UserInfo from '../../Manger/UserInfoMgr';
import { PopUpUI } from '../../BasicView/PopUpUI';
import CountMgr, { CountType } from '../../Manger/CountMgr';
import LanMgr from '../../Manger/LanMgr';
import EventMgr from '../../Manger/EventMgr';
import { EventName, NPCNameLangType } from '../../Const/ConstDefine';
import UserInfoMgr from '../../Manger/UserInfoMgr';
const { ccclass, property } = _decorator;

@ccclass('DialogueUI')
export class DialogueUI extends PopUpUI {
    public dialogShow(talk: any, task: any, talkOverCallback: ()=> void = null) {
        this._talk = talk;
        this._task = task;
        this._talkOverCallback = talkOverCallback;
        this._dialogStep = 0;
        this._refreshUI();
    }

    public override get typeName() {
        return "DialogueUI";
    }

    private _talk: any = null;
    private _task: any = null;
    private _talkOverCallback: ()=> void;
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
    private _roleViewNameMap: Map<NPCNameLangType, string> = new Map();
    onLoad(): void {
        EventMgr.on(EventName.CHANGE_LANG, this._refreshUI, this);

        this._roleViewNameMap.set(NPCNameLangType.Artisan, "artisan");
        this._roleViewNameMap.set(NPCNameLangType.DoomsdayGangBigTeam, "doomsdayGangBigTeam");
        this._roleViewNameMap.set(NPCNameLangType.DoomsdayGangSpy, "doomsdayGangSpy");
        this._roleViewNameMap.set(NPCNameLangType.Hunter, "hunter");
        this._roleViewNameMap.set(NPCNameLangType.Prophetess, "prophetess");
        this._roleViewNameMap.set(NPCNameLangType.SecretGuard, "secretGuard");
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
        dialogView.getChildByName("dialog_bg").getComponent(Button).interactable = true;

        const currentMesssage = this._talk.messsages[this._dialogStep];
        if (currentMesssage.type == null || currentMesssage.type == 0) {
            dialogView.active = true;
            selectView.active = false;
            dialogView.getChildByName("name_bg").active = false;
            dialogView.getChildByName("player_name").active = false;
            if (this._roleViewNameMap.has(currentMesssage.name)) {
                dialogView.getChildByName("name_bg").active = true;
                dialogView.getChildByPath("name_bg/Label").getComponent(Label).string = LanMgr.Instance.getLanById(currentMesssage.name);

            } else if (currentMesssage.name == NPCNameLangType.DefaultPlayer) {

                dialogView.getChildByName("player_name").active = true;
                dialogView.getChildByPath("player_name/Label").getComponent(Label).string = UserInfo.Instance.playerName;
            }

            dialogView.getChildByPath("dialog_bg/Label").getComponent(Label).string = LanMgr.Instance.getLanById(currentMesssage.text);

            for (const roleName of this._roleNames) {
                if (this._roleViewNameMap)
                dialogView.getChildByName(roleName).active = roleName == this._roleViewNameMap.get(currentMesssage.name);
            }
        } else if (currentMesssage.type == 1) {
            if ( currentMesssage.text != undefined) {
                dialogView.active = true;
                dialogView.getChildByName("name_bg").active = false;
                dialogView.getChildByName("player_name").active = false;

                dialogView.getChildByPath("dialog_bg/Label").getComponent(Label).string = LanMgr.Instance.getLanById(currentMesssage.text);

                for (const roleName of this._roleNames) {
                    dialogView.getChildByName(roleName).active = false;
                }
            }
            else {
                dialogView.active = false;
            }
            selectView.active = true;
            dialogView.getChildByName("NextButton").active = false;
            dialogView.getChildByName("dialog_bg").getComponent(Button).interactable = false;
            
            for (let i = 0; i < 3; i++) {
                const button = selectView.getChildByName("Button_" + i);
                if (i < currentMesssage.select.length) {
                    button.active = true;

                    button.getChildByName("Label").getComponent(Label).string = LanMgr.Instance.getLanById(currentMesssage.select[i]);

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
            setTimeout(()=> {
                if (GameMain.inst.UI.civilizationLevelUpUI.node.active) {
                    UserInfoMgr.Instance.afterCivilizationClosedShowItemDatas.push(...UserInfo.Instance.afterTalkItemGetData.get(this._talk.id));
                } else {
                    GameMain.inst.UI.itemInfoUI.showItem(UserInfo.Instance.afterTalkItemGetData.get(this._talk.id), true);

                }
            });
            UserInfo.Instance.afterTalkItemGetData.delete(this._talk.id);
        }
        if (this._talkOverCallback != null) {
            this._talkOverCallback();
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
        if (this._task != null) {
            if (this._task.entrypoint.result.includes(customEventData)) {
                // get task
                UserInfo.Instance.getNewTask(this._task);
    
                // useLanMgr
                GameMain.inst.UI.NewTaskTip(LanMgr.Instance.getLanById("202004"));
                // GameMain.inst.UI.NewTaskTip("New Task Taken");
    
            } else if (this._task.exitpoint != null &&
                this._task.exitpoint.result.includes(customEventData)) {
                // reject task action
                for (const temp of this._task.exitpoint.action) {
                    PioneerMgr.instance.dealWithTaskAction(temp.type, 0);
                }
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


