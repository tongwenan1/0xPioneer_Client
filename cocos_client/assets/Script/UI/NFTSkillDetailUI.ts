import { _decorator, Label, Node, RichText } from "cc";
import { LanMgr } from "../Utils/Global";
import ViewController from "../BasicView/ViewController";
import UIPanelManger, { UIPanelLayerType } from "../Basic/UIPanelMgr";
import { NFTPioneerObject, NFTPioneerSkillConfigData } from "../Const/NFTPioneerDefine";

import NFTSkillConfig from "../Config/NFTSkillConfig";
import NFTSkillEffectConfig from "../Config/NFTSkillEffectConfig";
import { HUDName } from "../Const/ConstUIDefine";
import { AlterView } from "./View/AlterView";
import { DataMgr } from "../Data/DataMgr";
const { ccclass, property } = _decorator;

@ccclass("NFTSkillDetailUI")
export class NFTSkillDetailUI extends ViewController {
    public async showItem(data: NFTPioneerObject, skillIndex: number) {
        if (data == null || skillIndex < 0 || skillIndex >= data.skills.length) {
            return;
        }

        const skillConfig = NFTSkillConfig.getById(data.skills[skillIndex].id);
        if (skillConfig == null) {
            return;
        }
        this._data = data;
        this._skillIndex = skillIndex;
        this._skillConfig = skillConfig;

        this.node.getChildByPath("__ViewContent/Name").getComponent(Label).string = LanMgr.getLanById(skillConfig.name);

        const desIds: string[] = [];
        for (const effect of skillConfig.effect) {
            desIds.push(effect.toString());
        }
        this.node.getChildByPath("__ViewContent/DescTxt").getComponent(RichText).string = NFTSkillEffectConfig.getDesByIds(desIds);
        this.node.getChildByPath("__ViewContent/btnUse").active = !data.skills[skillIndex].isOriginal;
    }

    private _data: NFTPioneerObject = null;
    private _skillIndex: number = -1;
    private _skillConfig: NFTPioneerSkillConfigData = null;
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
    private async onTapForget() {
        const result = await UIPanelManger.inst.pushPanel(HUDName.Alter, UIPanelLayerType.HUD);
        if (!result.success) {
            return;
        }
        result.node.getComponent(AlterView).showTip(LanMgr.replaceLanById("106006", [this._data.name, LanMgr.getLanById(this._skillConfig.name)]), async () => {
            DataMgr.s.nftPioneer.NFTForgetSkill(this._data.uniqueId, this._skillIndex);
            await this.playExitAnimation();
            UIPanelManger.inst.popPanel();
        });
    }
}
