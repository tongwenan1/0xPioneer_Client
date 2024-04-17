import {
    _decorator,
    Component,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    Vec3,
    Button,
    EventHandler,
    v2,
    Vec2,
    Prefab,
    Slider,
    instantiate,
    RichText,
    randomRangeInt,
} from "cc";
import { LanMgr } from "../Utils/Global";
import ViewController from "../BasicView/ViewController";
import ItemData, { ItemType } from "../Const/Item";
import UIPanelManger from "../Basic/UIPanelMgr";
import { NFTPioneerModel } from "../Const/PioneerDevelopDefine";
import NFTSkillConfig from "../Config/NFTSkillConfig";
const { ccclass, property } = _decorator;

@ccclass("NFTSkillDetailUI")
export class NFTSkillDetailUI extends ViewController {
    public async showItem(data: NFTPioneerModel, skillIndex: number) {
        const skillConfig = NFTSkillConfig.getById(data.skills[skillIndex]);
        if (skillConfig != null) {
            this.node.getChildByPath("__ViewContent/Name").getComponent(Label).string = LanMgr.getLanById(skillConfig.name);
            
        }
    }

    private _items: ItemData[] = [];
    private _isGet: boolean;
    private _canGetItem: ItemData = null;
    private _closeCallback: () => void;
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByName("__ViewContent");
    }

    //---------------------------------------------------- action
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }

}
