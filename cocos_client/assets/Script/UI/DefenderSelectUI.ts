import { _decorator, Button, instantiate, Label, Layout, Node, RichText } from "cc";
import { ItemMgr, LanMgr } from "../Utils/Global";
import ViewController from "../BasicView/ViewController";
import UIPanelManger, { UIPanelLayerType } from "../Basic/UIPanelMgr";
import { NFTPioneerObject, NFTPioneerSkillConfigData } from "../Const/NFTPioneerDefine";
import { HUDName, UIName } from "../Const/ConstUIDefine";
import { AlterView } from "./View/AlterView";
import ItemData from "../Const/Item";
import { BackpackItem } from "./BackpackItem";
import ItemConfig from "../Config/ItemConfig";
import { ItemInfoUI } from "./ItemInfoUI";
import { DataMgr } from "../Data/DataMgr";
import { MapPioneerObject } from "../Const/PioneerDefine";
const { ccclass, property } = _decorator;

@ccclass("DefenderSelectUI")
export class DefenderSelectUI extends ViewController {
    //----------------------------------------- data
    private _selectCallback: (selectPioneerId: string) => void = null;

    private _pioneerDatas: MapPioneerObject[] = null;
    //----------------------------------------- view
    private _pioneerItem: Node = null;
    private _pioneerContent: Node = null;
    //----------------------------------------- public
    public configuration(selectCallback: (selectPioneerId: string) => void) {
        this._selectCallback = selectCallback;
    }
    //----------------------------------------- lifecycle
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._pioneerDatas = DataMgr.s.pioneer.getAllPlayers(true);
        for (let i = 0; i < this._pioneerDatas.length; i++) {
            if (DataMgr.s.userInfo.data.wormholeDefenderIds.indexOf(this._pioneerDatas[i].id) != -1) {
                this._pioneerDatas.splice(i, 1);
                i--;
            }
        }

        this._pioneerContent = this.node.getChildByPath("__ViewContent/BgTaskListWord/ScrollView/View/Content");
        this._pioneerItem = this._pioneerContent.getChildByPath("Item");
        // useLanMgr
        // this._pioneerItem.getChildByPath("SelectButton/Label").getComponent(Label).string = LanMgr.getLanById("107549")
        this._pioneerItem.removeFromParent();
    }
    protected viewDidStart(): void {
        super.viewDidStart();
        this._refreshUI();
    }
    protected viewDidDestroy(): void {
        super.viewDidDestroy();
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByName("__ViewContent");
    }

    private _refreshUI() {
        if (this._pioneerDatas.length <= 0) {
            this.node.getChildByPath("__ViewContent/Empty").active = true;
        } else {
            this.node.getChildByPath("__ViewContent/Empty").active = false;

            for (let i = 0; i < this._pioneerDatas.length; i++) {
                const pioneer = this._pioneerDatas[i];
                const item = instantiate(this._pioneerItem);
                item.setParent(this._pioneerContent);
                item.getChildByPath("Defender/Icon/self").active = pioneer.animType == "self";
                item.getChildByPath("Defender/Icon/doomsdayGangSpy").active = pioneer.animType == "doomsdayGangSpy";
                item.getChildByPath("Defender/Icon/rebels").active = pioneer.animType == "rebels";
                item.getChildByPath("Defender/Icon/secretGuard").active = pioneer.animType == "secretGuard";
                item.getChildByPath("Name").getComponent(Label).string = LanMgr.getLanById(pioneer.name);
                item.getChildByPath("SelectButton").getComponent(Button).clickEvents[0].customEventData = i.toString();
            }
            this._pioneerContent.getComponent(Layout).updateLayout();
        }
    }
    //---------------------------------------------------- action
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }
    private async onTapSelect(event: Event, customEventData: string) {
        const index: number = parseInt(customEventData);
        if (this._selectCallback != null) {
            this._selectCallback(this._pioneerDatas[index].id);
        }
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }
}
