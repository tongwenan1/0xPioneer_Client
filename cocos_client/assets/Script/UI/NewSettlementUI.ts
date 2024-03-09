import { _decorator, Button, Color, Component, EditBox, instantiate, Label, Layout, Node, Prefab, ScrollView, Slider, Sprite, UITransform, v2, Vec3 } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import UserInfoMgr from '../Manger/UserInfoMgr';
import LvlupMgr from '../Manger/LvlupMgr';
import { GameMain } from '../GameMain';
import { BackpackItem } from './BackpackItem';
import ItemMgr from '../Manger/ItemMgr';
import { AudioMgr } from '../Basic/AudioMgr';
import LanMgr from '../Manger/LanMgr';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Const/ConstDefine';
import SettlementMgr from '../Manger/SettlementMgr';
import { SettlementView } from './View/SettlementView';
const { ccclass, property } = _decorator;

@ccclass('NewSettlementUI')
export class NewSettlementUI extends PopUpUI {
    
    public refreshUI(beginLevel: number, endLevel: number) {
        this._beginLevel = beginLevel;
        this._endLevel = endLevel;
        // useLanMgr 
        // this.node.getChildByPath("SummaryContent/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("SummaryContent/BottomTitle").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        this.node.getChildByPath("SummaryContent/PeriodicSettlement/SettlementView").getComponent(SettlementView).refreshUI(beginLevel, endLevel);
    }

    private _beginLevel: number;
    private _endLevel: number;
    onLoad(): void {
        EventMgr.on(EventName.CHANGE_LANG, this._onLangChanged, this);
    }

    start() {
        
    }

    update(deltaTime: number) {

    }

    onDestroy() {
        EventMgr.off(EventName.CHANGE_LANG, this._onLangChanged, this);
    }

    private _onLangChanged() {
        if (this._beginLevel != null && this._endLevel != null) {
            this.refreshUI(this._beginLevel, this._endLevel);
        }
    }

    //----------------------------------------------------------------------
    // action
    private onTapClose() {
        this.show(false);
    }
}


