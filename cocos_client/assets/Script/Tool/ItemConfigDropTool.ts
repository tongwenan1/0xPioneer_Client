import UIPanelManger from "../Basic/UIPanelMgr";
import DropConfig from "../Config/DropConfig";
import { GetPropData } from "../Const/ConstDefine";
import { UIName } from "../Const/ConstUIDefine";
import ItemData, { ItemConfigType } from "../Const/Item";
import { DataMgr } from "../Data/DataMgr";
import ArtifactData from "../Model/ArtifactData";
import { ArtifactInfoUI } from "../UI/ArtifactInfoUI";
import { ItemGettedUI } from "../UI/ItemGettedUI";
import { ArtifactMgr, ItemMgr, UserInfoMgr } from "../Utils/Global";
import CommonTools from "./CommonTools";

export default class ItemConfigDropTool {
    /**
     * get item and artifact by config
     * @param datas config
     * @param showDialog showGettedUI
     */
    public static getItemByConfig(datas: GetPropData[], showDialog: boolean = true) {
        const items: ItemData[] = [];
        const artifacts: ArtifactData[] = [];
        for (const data of datas) {
            let tempItem: ItemData = null;
            let tempArtifact: ArtifactData = null;

            if (data.type == ItemConfigType.Item) {
                tempItem = new ItemData(data.propId, data.num);

            } else if (data.type == ItemConfigType.Artifact) {
                tempArtifact = new ArtifactData(data.propId, data.num);

            } else if (data.type == ItemConfigType.Drop) {
                const resultReward = ItemConfigDropTool.getItemByDropConfig(data.propId);
                if (resultReward != null) {
                    if (resultReward.type == ItemConfigType.Item) {
                        tempItem = new ItemData(resultReward.propId, resultReward.num);
                    } else if (resultReward.type == ItemConfigType.Artifact) {
                        tempArtifact = new ArtifactData(resultReward.propId, resultReward.num);
                    }
                }
            }
            if (tempItem != null) {
                items.push(tempItem);
            }
            if (tempArtifact != null) {
                artifacts.push(tempArtifact);
            }
        }
        if (items.length > 0) {
            ItemMgr.addItem(items);
            if (showDialog) {
                setTimeout(async () => {
                    if (UIPanelManger.inst.panelIsShow(UIName.CivilizationLevelUpUI) ||
                        UIPanelManger.inst.panelIsShow(UIName.SecretGuardGettedUI)) {
                        UserInfoMgr.afterCivilizationClosedShowItemDatas.push(...items);
                    } else {
                        const result = await UIPanelManger.inst.pushPanel(UIName.ItemGettedUI);
                        if (result.success) {
                            result.node.getComponent(ItemGettedUI).showItem(items);
                        }
                    }
                });
            }
        }
        if (artifacts.length > 0) {
            DataMgr.s.artifact.addObj_artifact(artifacts);
            if (showDialog) {
                setTimeout(async () => {
                    if (UIPanelManger.inst.panelIsShow(UIName.CivilizationLevelUpUI) ||
                        UIPanelManger.inst.panelIsShow(UIName.SecretGuardGettedUI)) {
                        UserInfoMgr.afterCivilizationClosedShowArtifactDatas.push(...artifacts);
                    } else {
                        const result = await UIPanelManger.inst.pushPanel(UIName.ArtifactInfoUI);
                        if (result.success) {
                            result.node.getComponent(ArtifactInfoUI).showItem(artifacts);
                        }
                    }
                });
            }
        }
    }

    public static getItemByDropConfig(dropId: string): GetPropData {
        let resultReward: GetPropData = null;
        const drop = DropConfig.getById(dropId);
        if (drop != null) {
            const useDrop = drop;
            const items: GetPropData[] = [];
            const weights = [];
            // drop type index 0
            // drop num index 1
            // drop weight index 2
            // drop itemConfigId index 3
            for (const temple of useDrop.drop_group) {
                if (temple.length == 4) {
                    items.push({
                        type: temple[0],
                        num: temple[1],
                        propId: temple[3]
                    });
                    weights.push(temple[2]);
                }
            }
            resultReward = CommonTools.weightedRandomValue(items, weights);
        }
        return resultReward;
    }
}