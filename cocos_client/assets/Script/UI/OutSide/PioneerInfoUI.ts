import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button } from 'cc';
import { PopUpUI } from '../TemplateUI/PopUpUI';
import { OprateType } from '../../Datas/ConstDefine';
import { ResPointData, OutMapItemMonsterData, OutMapItemTownData } from '../../Datas/DataDefine';
import { GameMain } from '../../GameMain';
const { ccclass, property } = _decorator;

@ccclass('PioneerInfoUI')
export class PioneerInfoUI extends PopUpUI {

    @property(Sprite)
    pioneerIcon:Sprite;

    @property(Label)
    txtTitle: Label = null;

    @property(Label)
    timeTxt: Label = null;

    @property(Button)
    buttonStart:Button;
    @property(Button)
    closeButton:Button;

    @property(Button)
    addPioneerBtn:Button;
    
    @property(Node)
    selectPioneerPanelNode:Node;

    
    
    private _data:ResPointData | OutMapItemMonsterData;

    private _targetNode:Node = null;

    // convert to local pos
    private _resNodePos:Vec3;

    start() {
        this.buttonStart.node.on(Button.EventType.CLICK, this.onStartClick, this);
        this.closeButton.node.on(Button.EventType.CLICK, ()=>{
            this.node.active = false;
        }, this);
    }

    update(deltaTime: number) {
        
    }

    refresh(pos:Vec3, targetNode:Node, resNodePos:Vec3, data:ResPointData | OutMapItemMonsterData | OutMapItemTownData) {
        this._data = data;
        this._targetNode = targetNode;
        this._resNodePos = resNodePos;

        this.node.setPosition(pos);

        this.selectPioneerPanelNode.active = false;
        this.addPioneerBtn.node.active = true;
        this.buttonStart.enabled = false;

        if(data instanceof ResPointData) {
            if(data.resType == "RES_CAMP"){
                this.txtTitle.string = "BUFF:+10 gold/H";
            }
            else if(data.resType == "RES_MINE"){
                this.txtTitle.string = "Total resources:500/500";
                this.timeTxt.string = "Acquisition time:1M";

            }
            else if(data.resType == "RES_TREASURE"){
                this.txtTitle.string = "Exploratory output:Chest";
                this.timeTxt.string = "Exploration time:5M";
            }
        }
        else if(data instanceof OutMapItemMonsterData) {
            this.txtTitle.string = "Combat output:Chest";
            this.timeTxt.string = "Combat time:3M";
        }
        else if(data instanceof OutMapItemTownData) {
            this.txtTitle.string = "March to target town";
            this.timeTxt.string = "time:1M";
        }

        this.show(true);
    }

    onStartClick(){

        let pos = GameMain.inst.outSceneMap.SelfTown.getNearPosDoor(this._resNodePos);
        let p = GameMain.inst.outSceneMap.SelfTown.getFreePioneer();
        if(!p){
            // no free pioneer
            GameMain.inst.UI.ShowTip("No free pioneer");
            return;
        }
        p.node.setWorldPosition(pos);
        p.moveTo(this._resNodePos, this._targetNode);

        this.show(false);
    }

    onAddPioneerBtnClick() {
        this.selectPioneerPanelNode.active = true;
    }

    onSelectPioneerClick() {
        this.selectPioneerPanelNode.active = false;
        this.addPioneerBtn.node.active = false;
        this.buttonStart.enabled = true;
    }
}


