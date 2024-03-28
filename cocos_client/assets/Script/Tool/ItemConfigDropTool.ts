import DropConfig from "../Config/DropConfig";
import { GetPropData, ItemConfigType } from "../Const/ConstDefine";
import { UIName } from "../Const/ConstUIDefine";
import ItemData from "../Const/Item";
import ArtifactData from "../Model/ArtifactData";
import { ArtifactInfoUI } from "../UI/ArtifactInfoUI";
import { ItemInfoUI } from "../UI/ItemInfoUI";
import { ArtifactMgr, ItemMgr, UIPanelMgr, UserInfoMgr } from "../Utils/Global";
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
        console.log("exce datas: " + JSON.stringify(datas));
        console.log("exce items:" + JSON.stringify(items));
        console.log("exce artifacts:" + JSON.stringify(artifacts));
        if (items.length > 0) {
            ItemMgr.addItem(items);
            if (showDialog) {
                setTimeout(async () => {
                    if (UIPanelMgr.getPanelIsShow(UIName.CivilizationLevelUpUI) ||
                        UIPanelMgr.getPanelIsShow(UIName.SecretGuardGettedUI)) {
                        UserInfoMgr.afterCivilizationClosedShowItemDatas.push(...items);
                    } else {
                        const view = await UIPanelMgr.openPanel(UIName.ItemInfoUI);
                        if (view != null) {
                            view.getComponent(ItemInfoUI).showItem(items, true);
                        }
                    }
                });
            }
        }
        if (artifacts.length > 0) {
            ArtifactMgr.addArtifact(artifacts);
            if (showDialog) {
                setTimeout(async () => {
                    if (UIPanelMgr.getPanelIsShow(UIName.CivilizationLevelUpUI) ||
                        UIPanelMgr.getPanelIsShow(UIName.SecretGuardGettedUI)) {
                        UserInfoMgr.afterCivilizationClosedShowArtifactDatas.push(...artifacts);
                    } else {
                        const view = await UIPanelMgr.openPanel(UIName.ArtifactInfoUI);
                        if (view != null) {
                            view.getComponent(ArtifactInfoUI).showItem(artifacts);
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