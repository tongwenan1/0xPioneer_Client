import { Component, Label, ProgressBar, Node, Sprite, _decorator, Tween, v3, warn } from 'cc';
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

    async onEmergencyUpdate(value: number) {
        const info = UserInfo.Instance;
        // upward +1 anim
        let node = new Node();
        node.addComponent(Label);
        node.getComponent(Label).string = "" + value;
        node.parent = this.node;
        node.position = v3(this.txtEnergy.node.position.x, this.txtEnergy.node.position.y - 50);

        let energy: number = await info.getEnergy();
        energy += value;
        info.changeEnergy(energy);

        let seq = new Tween(node);
        seq.to(0.5, { position: v3(node.position.x, node.position.y + 50) }, null);
        seq.call(() => {
            node.destroy();
            this.txtEnergy.string = energy.toString();
        });
        seq.start();
    }

    async onCoinUpdate(value: number) {
        const info = UserInfo.Instance;
        // upward +1 anim
        let node = new Node();
        let lbl = node.addComponent(Label);
        lbl.string = (value > 0) ? "+" + value : "" + value;
        node.parent = this.node;
        node.position = v3(this.txtMoney.node.position.x, this.txtMoney.node.position.y - 50);

        let money: number = await info.getMoney();
        money += value;
        info.changeMoney(money);

        let seq = new Tween(node);
        seq.to(0.5, { position: v3(node.position.x, node.position.y + 50) }, null);
        seq.call(() => {
            node.destroy();
            this.txtMoney.string = money.toString();
        });
        seq.start();
    }

    async refreshTopUI() {
        const info = UserInfo.Instance;
        const name = await info.getPlayerName();
        const level = await info.getLevel();
        const exp = await info.getExp();
        const money = await info.getMoney();
        const energy = await info.getEnergy();

        this.txtPlayerName.string = name;
        this.txtPlayerLV.string = "LV" + level;
        this.txtLvProgress.string = `${exp}/${1000}`;
        this.txtMoney.string = "" + money;
        this.txtEnergy.string = "" + energy;
        this.lvProgress.progress = 0;
    }
}