import {_decorator, Button, Component, Label} from 'cc';
import {BattleReportsEvent} from '../Const/Manager/BattleReportsMgrDefine';
import {BattleReportsMgr, UIPanelMgr} from '../Utils/Global';
import {UIName} from '../Const/ConstUIDefine';

const {ccclass} = _decorator;


@ccclass('BattleReportEntryButton')
export class BattleReportEntryButton extends Component implements BattleReportsEvent {
    protected onEnable() {
        BattleReportsMgr.addObserver(this);
        this.node.on(Button.EventType.CLICK, this.onClickButton, this);
        this.updateBattleReportsUnreadCount();
    }

    protected onDisable() {
        this.node.off(Button.EventType.CLICK, this.onClickButton, this);
        BattleReportsMgr.removeObserver(this);
    }

    private async onClickButton() {
        await UIPanelMgr.openPanel(UIName.BattleReportUI);
    }

    private updateBattleReportsUnreadCount() {
        const icon_WarReport_1 = this.node.getChildByName('icon_WarReport_1');
        const icon_WarReport_2 = this.node.getChildByName('icon_WarReport_2');
        const icon_WarReport_3 = this.node.getChildByName('icon_WarReport_3');
        const emergencyCountLabel = this.node.getChildByName('emergencyCountLabel').getComponent(Label);

        const label = this.node.getChildByName('unreadCountLabel').getComponent(Label);
        const count = BattleReportsMgr.unreadCount;
        if (count != 0) {
            label.string = Math.min(count, 99).toString();
            label.node.active = true;
            icon_WarReport_1.active = false;
            icon_WarReport_2.active = true;
        } else {
            label.node.active = false;
            icon_WarReport_1.active = true;
            icon_WarReport_2.active = false;
        }

        const emergencyReportCount = BattleReportsMgr.emergencyCount;
        if (emergencyReportCount != 0) {
            icon_WarReport_3.active = true;
            emergencyCountLabel.string = Math.min(emergencyReportCount, 99).toString();
            emergencyCountLabel.node.active = true;
        } else {
            icon_WarReport_3.active = false;
            emergencyCountLabel.node.active = false;
        }
    }

    onBattleReportListChanged() {
        this.updateBattleReportsUnreadCount();
    }
}