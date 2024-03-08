import { _decorator, Button, Node } from 'cc';
import { PopUpUI } from '../../BasicView/PopUpUI';
import { GameMain } from '../../GameMain';
const { ccclass } = _decorator;

@ccclass('BuildingUpgradeUI')
export class BuildingUpgradeUI extends PopUpUI {

    public mainCityBtn: Button = null;
    public barracksBtn: Button = null;
    public housesBtn: Button = null;

    private _levelInfoView: Node = null;

    onLoad(): void {
        this._levelInfoView = this.node.getChildByPath("LevelInfoView");
        this._levelInfoView.active = false;
    }

    start() {

    }

    showPage() {
        this._levelInfoView.active = true;
    }

    update(deltaTime: number) {

    }

    onDestroy() {

    }

    closeClick(){
        GameMain.inst.UI.buildingUpgradeUI.show(false);
    }
}


