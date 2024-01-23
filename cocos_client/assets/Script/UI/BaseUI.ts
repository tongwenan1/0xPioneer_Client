import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BaseUI')
export class BaseUI extends Component {

    private static _sAllUIs = {};
    private static _sUIIDCounter = 1;
    private static _sOnLoadUI(ui:BaseUI):number {
        let uiid = BaseUI._sUIIDCounter;
        ++BaseUI._sUIIDCounter;
        BaseUI._sAllUIs[uiid] = ui;
        return uiid;
    }
    private static _sOnDestoryUI(ui:BaseUI) {
        delete BaseUI._sAllUIs[ui.uniqueUIID];
    }

    private _uniqueUIID:number;

    public get typeName() {
        return "BaseUI";
    }
    public get uniqueUIID() {
        return this._uniqueUIID;
    }

    public get isShow() {
        return this.node.active;
    }

    public show(bShow:boolean) {
        if(bShow) {
            this.node.active = true;
        }
        else {
            this.node.active = false;
        }
    }

    onLoad() {
        console.log("BaseUI.onLoad: " + this.typeName);
        this._uniqueUIID = BaseUI._sOnLoadUI(this);
    }

    onDestroy() {
        BaseUI._sOnDestoryUI(this);
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


