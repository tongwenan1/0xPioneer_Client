import { _decorator, Button, Component, Label, log, Node, UITransform, v3, Vec3 } from 'cc';
import { OutMapItemMonsterData, ResPointData } from '../../Datas/DataDefine';
import { PopUpUI } from '../TemplateUI/PopUpUI';
import { OprateType, ResPointType } from '../../Datas/ConstDefine';
import { GameMain } from '../../GameMain';
const { ccclass, property } = _decorator;

@ccclass('ResOprUI')
export class ResOprUI extends PopUpUI {
    
    public override get typeName() {
        return "ResOprUI";
    }

    @property(Button)
    btnAttack:Button = null;

    @property(Button)
    btnGetRes: Button = null;

    @property(Button)
    // defendButton
    btnStay: Button = null;

    @property(Button)
    btnInfo: Button = null;
    
    @property(Button)
    btnSearch: Button = null;
    
    @property(Button)
    btnCamp: Button = null;

    @property(Label)
    txtItemName: Label = null;

    private _data:ResPointData | OutMapItemMonsterData;

    private _type:String;

    private _targetNode:Node = null;

    // convert to local pos
    private _resNodePos:Vec3;

    public refresh(type: String | ResPointType, resNodePos:Vec3, data:ResPointData | OutMapItemMonsterData) {
        this._data = data;
        this._type = type;
        this._resNodePos = resNodePos;

        this.btnAttack.node.active = type == ResPointType.RES_MONSTER;
        this.btnGetRes.node.active = type == ResPointType.RES_MINE;
        this.btnSearch.node.active = type == ResPointType.RES_TREASURE;
        this.btnCamp.node.active = type == ResPointType.RES_CAMP;

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
        GameMain.inst.UI.pioneerInfoUI.refresh( this.node.position, this._targetNode, this._resNodePos, this._data);
        GameMain.inst.UI.pioneerInfoUI.show(true);
        
        this.show(false);
    }

    onGetResClick(){
        GameMain.inst.UI.pioneerInfoUI.refresh(this.node.position, this._targetNode, this._resNodePos, this._data);
        GameMain.inst.UI.pioneerInfoUI.show(true);
        
        this.show(false);
    }

    onAtkClick(){
        GameMain.inst.UI.pioneerInfoUI.refresh(this.node.position, this._targetNode, this._resNodePos, this._data);
        GameMain.inst.UI.pioneerInfoUI.show(true);
        
        this.show(false);
    }

    onStayClick(){
        GameMain.inst.UI.pioneerInfoUI.refresh(this.node.position, this._targetNode, this._resNodePos, this._data);
        GameMain.inst.UI.pioneerInfoUI.show(true);
        
        this.show(false);
    }

    onCampClick(){
        GameMain.inst.UI.pioneerInfoUI.refresh(this.node.position, this._targetNode, this._resNodePos, this._data);
        GameMain.inst.UI.pioneerInfoUI.show(true);
        
        this.show(false);
    }

    onInfoClick(){
        GameMain.inst.UI.resInfoUI.refresh(this._data,this._type,this.node.position);
        GameMain.inst.UI.resInfoUI.show(true);
    }

    onCloseClick(){
        this.show(false);
    }
}


