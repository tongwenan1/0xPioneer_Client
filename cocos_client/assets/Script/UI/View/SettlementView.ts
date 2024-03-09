import { _decorator, Component, instantiate, Label, Layout, Node, UITransform, Widget } from 'cc';
import SettlementMgr, { SettlementModel } from '../../Manger/SettlementMgr';
import EventMgr from '../../Manger/EventMgr';
import { EventName } from '../../Const/ConstDefine';
const { ccclass, property } = _decorator;

@ccclass('SettlementView')
export class SettlementView extends Component {

    public refreshUI(beginLevel: number, endLevel: number) {




        const model = SettlementMgr.instance.getSettlement(beginLevel, endLevel);

        this.node.getChildByPath("Content/LevelTitle").getComponent(Label).string = "C.Lv " + beginLevel + "  >  C.Lv " + endLevel;

        const content = this.node.getChildByPath("Content/SettlementContent");

        if (model.newPioneerIds.length > 0) {
            // useLanMgr
            // content.getChildByPath("NewPioneer/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
            content.getChildByName("NewPioneer").active = true;
            for (const pioneerId of model.newPioneerIds) {
                const item = instantiate(this._pioneerItem);
                item.active = true;
                item.setParent(this._pioneerItem.parent);
                item.getChildByName("Secret").active = pioneerId == "pioneer_1";
                item.getChildByName("Rebel").active = pioneerId == "pioneer_3";
                item.getChildByName("Spy").active = pioneerId == "pioneer_2";
            }
            this._pioneerItem.parent.getComponent(Layout).updateLayout();
        } else {
            content.getChildByName("NewPioneer").active = false;
        }

        if (model.killEnemies > 0) {
            // useLanMgr
            // content.getChildByPath("KilledEnemies/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
            content.getChildByName("KilledEnemies").active = true;
            content.getChildByPath("KilledEnemies/Value").getComponent(Label).string = model.killEnemies.toString();
        } else {
            content.getChildByName("KilledEnemies").active = false;
        }

        if (model.gainResources > 0) {
            // useLanMgr
            // content.getChildByPath("GainedResources/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
            content.getChildByName("GainedResources").active = true;
            content.getChildByPath("GainedResources/Value").getComponent(Label).string = model.gainResources.toString();
        } else {
            content.getChildByName("GainedResources").active = false;
        }

        if (model.exploredEvents > 0) {
            // useLanMgr
            // content.getChildByPath("ExploredEvents/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
            content.getChildByName("ExploredEvents").active = true;
            content.getChildByPath("ExploredEvents/Value").getComponent(Label).string = model.exploredEvents.toString();
        } else {
            content.getChildByName("ExploredEvents").active = false;
        }
        content.getComponent(Layout).updateLayout();

        this.node.getComponent(UITransform).height = content.getComponent(UITransform).height + content.getComponent(Widget).top + 20;
    }

    private _pioneerItem: Node = null;
    protected onLoad(): void {
        this._pioneerItem = this.node.getChildByPath("Content/SettlementContent/NewPioneer/Content/Item");
        this._pioneerItem.active = false;
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


