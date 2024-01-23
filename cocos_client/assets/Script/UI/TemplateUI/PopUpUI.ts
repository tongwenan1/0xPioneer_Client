import { _decorator, Component, UITransform } from 'cc';
import { BaseUI } from '../BaseUI';
import { GameMain } from '../../GameMain';
const { ccclass, property } = _decorator;

@ccclass('PopUpUI')
export class PopUpUI extends BaseUI {

    private static _sPopUpUIs = {};
    private static addShowingPopUpUI(ui:PopUpUI) {
        PopUpUI._sPopUpUIs[ui.uniqueUIID] = ui;
    }
    private static removeShowingPopUpUI(ui:PopUpUI) {
        delete PopUpUI._sPopUpUIs[ui.uniqueUIID];
    }

    public static hideAllShowingPopUpUI() {
        for(let uiid in PopUpUI._sPopUpUIs){
            let ui:PopUpUI = PopUpUI._sPopUpUIs[uiid];
            ui.node.active = false;
        }

        PopUpUI._sPopUpUIs = {};
    }
    
    public override get typeName() {
        return "PopUpUI";
    }

    public show(bShow:boolean) {
        if(bShow) {
            this.node.active = true;
            PopUpUI.addShowingPopUpUI(this);
        }
        else {
            this.node.active = false;
            PopUpUI.removeShowingPopUpUI(this);
        }
    }

    /**
     * set node pos
     * @param pos world pos
     */
    public setNodePos(pos){
        pos.subtract(GameMain.inst.MainCamera.node.position);
        pos.z = 0;
        this.node.setWorldPosition(pos);
    }


    onLoad() {
        super.onLoad();
        this.node.active = false;
    }

    onDestroy() {
        if(this.node.active){
            PopUpUI.removeShowingPopUpUI(this);
        }
    }

    start() {
        
    }

    update(deltaTime: number) {

    }
}


