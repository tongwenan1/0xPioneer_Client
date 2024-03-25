import { _decorator, Button, Color, Component, EditBox, instantiate, Label, Layout, Node, Prefab, ScrollView, Slider, Sprite, UITransform, v2, Vec3 } from 'cc';
import { EventName } from '../Const/ConstDefine';
import { SettlementView } from './View/SettlementView';
import { LanMgr, NotificationMgr, UIPanelMgr } from '../Utils/Global';
import ViewController from '../BasicView/ViewController';
const { ccclass, property } = _decorator;

@ccclass('NewSettlementUI')
export class NewSettlementUI extends ViewController {

    public refreshUI(beginLevel: number, endLevel: number) {
        this._beginLevel = beginLevel;
        this._endLevel = endLevel;
        // useLanMgr 
        // this.node.getChildByPath("SummaryContent/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("SummaryContent/BottomTitle").getComponent(Label).string = LanMgr.getLanById("107549");
        this.node.getChildByPath("SummaryContent/Content").getComponent(SettlementView).refreshUI(beginLevel, endLevel);
    }

    private _beginLevel: number;
    private _endLevel: number;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        NotificationMgr.addListener(EventName.CHANGE_LANG, this._onLangChanged, this);
    }
    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(EventName.CHANGE_LANG, this._onLangChanged, this);
    }

    private _onLangChanged() {
        if (this._beginLevel != null && this._endLevel != null) {
            this.refreshUI(this._beginLevel, this._endLevel);
        }
    }

    //----------------------------------------------------------------------
    // action
    private onTapClose() {
        UIPanelMgr.removePanelByNode(this.node);
    }
}


