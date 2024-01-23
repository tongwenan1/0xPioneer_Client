import { Component, Label, ProgressBar, Node, Sprite, _decorator, Tween, v3 } from 'cc';
import { GameMain } from '../GameMain';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Datas/ConstDefine';
import UserInfo from '../v2/DataMgr/user_Info';
const { ccclass, property } = _decorator;


@ccclass('TopUI')
export default class TopUI extends Component {
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

    start() {
        this.refreshTopUI();

        EventMgr.on(EventName.ENERGY_CHANGE, this.onEmergencyUpdate, this);
        EventMgr.on(EventName.COIN_CHANGE, this.onCoinUpdate, this);
    }

    onEmergencyUpdate(value: number) {
        const info = UserInfo.Instance;
        // upward +1 anim
        let node = new Node();
        node.addComponent(Label);
        node.getComponent(Label).string = "" + value;
        node.parent = this.node;
        node.position = v3(this.txtEnergy.node.position.x, this.txtEnergy.node.position.y - 50);

        info.energy += value;

        let seq = new Tween(node);
        seq.to(0.5, { position: v3(node.position.x, node.position.y + 50) }, null);
        seq.call(() => {
            node.destroy();
            this.txtEnergy.string = info.energy.toString();
        });
        seq.start();
    }

    onCoinUpdate(value: number) {
        const info = UserInfo.Instance;
        // upward +1 anim
        let node = new Node();
        let lbl = node.addComponent(Label);
        lbl.string = (value > 0) ? "+" + value : "" + value;
        node.parent = this.node;
        node.position = v3(this.txtMoney.node.position.x, this.txtMoney.node.position.y - 50);

        info.money += value;

        let seq = new Tween(node);
        seq.to(0.5, { position: v3(node.position.x, node.position.y + 50) }, null);
        seq.call(() => {
            node.destroy();
            this.txtMoney.string = info.money.toString();
        });
        seq.start();
    }

    refreshTopUI() {
        const info = UserInfo.Instance;
        this.txtPlayerName.string = info.playerName;
        this.txtPlayerLV.string = "LV" + info.level;
        this.txtLvProgress.string = `${info.exp}/${1000}`;
        this.txtMoney.string = "" + info.money;
        this.txtEnergy.string = "" + info.energy;
        this.lvProgress.progress = 0;
    }
}