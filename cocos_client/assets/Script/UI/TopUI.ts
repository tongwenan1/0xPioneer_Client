import { Component, Label, ProgressBar, Node, Sprite, _decorator, Tween, v3, warn, EventHandler, Button, randomRangeInt, UIOpacity, instantiate, tween } from 'cc';
import { ResourceCorrespondingItem } from '../Const/ConstDefine';
import { ItemMgr, UserInfoMgr } from '../Utils/Global';
import { UIName } from '../Const/ConstUIDefine';
import { CivilizationLevelUpUI } from './CivilizationLevelUpUI';
import NotificationMgr from '../Basic/NotificationMgr';
import { UserInfoEvent } from '../Const/UserInfoDefine';
import LvlupConfig from '../Config/LvlupConfig';
import { NotificationName } from '../Const/Notification';
import UIPanelManger from '../Basic/UIPanelMgr';
import { DataMgr } from '../Data/DataMgr';
const { ccclass, property } = _decorator;


@ccclass('TopUI')
export default class TopUI extends Component implements UserInfoEvent {


    @property(Label)
    txtPlayerName: Label = null;

    @property(Label)
    txtPlayerLV: Label = null;

    @property(Label)
    txtLvProgress: Label = null;

    @property(Label)
    txtMoney: Label = null;

    @property(Label)
    txtEnergy: Label = null;

    @property(ProgressBar)
    lvProgress: ProgressBar = null;

    @property(Sprite)
    sprPlayerHead: Sprite = null;

    private _expAnimLabel: Label = null;
    protected onLoad(): void {

        this._expAnimLabel = this.node.getChildByPath("progressLv/AnimLabel").getComponent(Label);
        this._expAnimLabel.node.active = false;

        UserInfoMgr.addObserver(this);


        NotificationMgr.addListener(NotificationName.ITEM_CHANGE, this.refreshTopUI, this);
    }

    start() {
        this.refreshTopUI();
    }

    protected onDestroy(): void {
        UserInfoMgr.removeObserver(this);

        NotificationMgr.removeListener(NotificationName.ITEM_CHANGE, this.refreshTopUI, this);
    }

    refreshTopUI() {
        const info = UserInfoMgr;
        this.txtPlayerName.string = info.playerName;
        this.txtPlayerLV.string = "C.LV" + info.level;
        this.txtLvProgress.string = `${info.exp}/${1000}`;
        this.txtMoney.string = DataMgr.s.item.getObj_item_count(ResourceCorrespondingItem.Gold).toString();
        this.txtEnergy.string = DataMgr.s.item.getObj_item_count(ResourceCorrespondingItem.Energy).toString();

        const lvlupConfig = LvlupConfig.getById(info.level.toString());
        const maxExp = lvlupConfig.exp;
        this.lvProgress.progress = Math.min(1, info.exp / maxExp);
        this.node.getChildByPath("progressLv/txtLvProgress").getComponent(Label).string = info.exp + "/" + maxExp;

        const resourceView = this.node.getChildByName("Resource");
        resourceView.getChildByPath("Food/Label").getComponent(Label).string = DataMgr.s.item.getObj_item_count(ResourceCorrespondingItem.Food).toString();
        resourceView.getChildByPath("Wood/Label").getComponent(Label).string = DataMgr.s.item.getObj_item_count(ResourceCorrespondingItem.Wood).toString();
        resourceView.getChildByPath("Stone/Label").getComponent(Label).string = DataMgr.s.item.getObj_item_count(ResourceCorrespondingItem.Stone).toString();
        resourceView.getChildByPath("Troops/Label").getComponent(Label).string = DataMgr.s.item.getObj_item_count(ResourceCorrespondingItem.Troop).toString();
    }

    private _playExpGettedAnim(getExpValue: number, playOver: () => void = null) {
        if (getExpValue <= 0) {
            return;
        }
        const animNode: Node = instantiate(this._expAnimLabel.node);
        animNode.setParent(this._expAnimLabel.node.parent);
        animNode.active = true;
        animNode.getComponent(Label).string = "+" + getExpValue;
        animNode.position = v3(
            animNode.position.x,
            animNode.position.y - 30,
            animNode.position.z
        );
        tween(animNode)
            .to(0.4, { position: v3(animNode.position.x, animNode.position.y + 30, animNode.position.z) })
            .call(() => {
                animNode.destroy();
                if (playOver != null) {
                    playOver();
                }
            })
            .start();
    }

    //------------------------------------------------ action
    private async onTapPlayerInfo() {
        await UIPanelManger.inst.pushPanel(UIName.PlayerInfoUI);
    }
    //-----------------------------------------------
    // userinfoevent
    playerNameChanged(value: string): void {
        this.refreshTopUI();
    }
    playerExpChanged(value: number): void {
        this._playExpGettedAnim(value, () => {
            this.refreshTopUI();
        });
    }
    async playerLvlupChanged(value: number): Promise<void> {
        const levelConfig = LvlupConfig.getById(value.toString());
        if (levelConfig != null) {
            const result = await UIPanelManger.inst.pushPanel(UIName.CivilizationLevelUpUI);
            if (result.success) {
                result.node.getComponent(CivilizationLevelUpUI).refreshUI(levelConfig);
            }
        }
    }
    getProp(propId: string, num: number): void {

    }
}