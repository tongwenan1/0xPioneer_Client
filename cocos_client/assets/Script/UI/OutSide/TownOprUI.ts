import { _decorator, Button, Component, Label, log, Node, UITransform, v3, Vec3 } from 'cc';
import { OutMapItemMonsterData, OutMapItemTownData, ResPointData } from '../../Datas/DataDefine';
import { PopUpUI } from '../TemplateUI/PopUpUI';
import { OprateType } from '../../Datas/ConstDefine';
import { GameMain } from '../../GameMain';
const { ccclass, property } = _decorator;

@ccclass('TownOprUI')
export class TownOprUI extends PopUpUI {
    
    public override get typeName() {
        return "TownOprUI";
    }


    @property(Button)
    // defendButton
    btnStay: Button = null;
    
    @property(Button)
    btnSearch: Button = null;

    @property(Label)
    txtItemName: Label = null;

    private _data:OutMapItemTownData;

    private _targetNode:Node = null;

    // convert to local pos
    private _resNodePos:Vec3;

    public refresh(resNodePos:Vec3, data:OutMapItemTownData) {
        this._data = data;
        this._resNodePos = resNodePos;

        this.txtItemName.string = `Lv.${data.level}\n${data.playerName}`;

    }

    start() {
    }


    setTargetNode(node:Node){
        this._targetNode = node;
    }

    update(deltaTime: number) {
        
    }

    onSearchClick(){
        GameMain.inst.UI.pioneerInfoUI.refresh(this.node.position, this._targetNode, this._resNodePos, this._data);
        GameMain.inst.UI.pioneerInfoUI.show(true);
        
        this.show(false);
    }

    onStayClick(){
        GameMain.inst.UI.pioneerInfoUI.refresh(this.node.position, this._targetNode, this._resNodePos, this._data);
        GameMain.inst.UI.pioneerInfoUI.show(true);
        
        this.show(false);
    }

    onCloseClick(){
        this.show(false);
    }
}


