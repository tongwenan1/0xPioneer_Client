import DropConfig from "../Config/DropConfig";
import { ItemConfigType } from "../Const/ConstDefine";
import { UIName } from "../Const/ConstUIDefine";
import { GameMain } from "../GameMain";
import ArtifactData from "../Model/ArtifactData";
import ItemData from "../Model/ItemData";
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
    public static getItemByConfig(datas: [number, string, number][], showDialog: boolean = true) {
        const items: ItemData[] = [];
        const artifacts: ArtifactData[] = [];

        for (const data of datas) {
            if (data.length == 3) {
                const type: ItemConfigType = parseInt(data[0] + "");
                const id: string = data[1];
                const num: number = parseInt(data[2] + "");
                let tempItem: ItemData = null;
                let tempArtifact: ArtifactData = null;

                if (type == ItemConfigType.Item) {
                    tempItem = new ItemData(id, num);

                } else if (type == ItemConfigType.Artifact) {
                    tempArtifact = new ArtifactData(id, num);

                } else if (type == ItemConfigType.Drop) {
                    let resultReward: { type: number, num: number, itemConfigId: string } = null;
                    const drop = DropConfig.getById(id);
                    if (drop != null) {
                        const useDrop = drop;
                        const items: { type: number, num: number, itemConfigId: string }[] = [];
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
                                    itemConfigId: temple[3]
                                });
                                weights.push(temple[2]);
                            }
                        }
                        resultReward = CommonTools.weightedRandomValue(items, weights);
                    }
                    if (resultReward != null) {
                        if (resultReward.type == ItemConfigType.Item) {
                            tempItem = new ItemData(resultReward.itemConfigId, resultReward.num);
                        } else if (resultReward.type == ItemConfigType.Artifact) {
                            tempArtifact = new ArtifactData(resultReward.itemConfigId, resultReward.num);
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
        }
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
}