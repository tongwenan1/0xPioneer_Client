import { ItemConfigType } from "../Const/ConstDefine";
import { GameMain } from "../GameMain";
import ArtifactMgr from "../Manger/ArtifactMgr";
import DropMgr from "../Manger/DropMgr";
import ItemMgr from "../Manger/ItemMgr";
import ArtifactData from "../Model/ArtifactData";
import ItemData, { ItemType } from "../Model/ItemData";
import { ArtifactInfoShowModel } from "../UI/ArtifactInfoUI";
import { ItemInfoShowModel } from "../UI/ItemInfoUI";
import CommonTools from "./CommonTools";

export default class ItemConfigDropTool {
    /**
     * get item and artifact by config
     * @param datas config
     * @param showDialog showGettedUI
     */
    public static getItemByConfig(datas: [number, string, number][], showDialog: boolean = true) {
        const items: ItemData[] = [];
        const showItemDialogDatas: ItemInfoShowModel[] = [];

        const artifacts: ArtifactData[] = [];
        const showArtifactDialogDatas: ArtifactInfoShowModel[] = [];
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
                    const drop = DropMgr.Instance.getDropById(id);
                    if (drop.length > 0) {
                        const useDrop = drop[0];
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
                    if (showDialog) {
                        const tempItemConfig = ItemMgr.Instance.getItemConf(tempItem.itemConfigId);
                        if (tempItemConfig != null && tempItemConfig.itemType != ItemType.Resource) {
                            showItemDialogDatas.push({
                                itemConfig: tempItemConfig,
                                count: tempItem.count
                            });
                        }
                    }
                }
                if (tempArtifact != null) {
                    artifacts.push(tempArtifact);
                    const artifactConfig = ArtifactMgr.Instance.getArtifactConf(tempArtifact.artifactConfigId);
                    showArtifactDialogDatas.push({
                        artifactConfig: artifactConfig,
                        count: tempArtifact.count
                    });
                }  
            }
        }
        if (items.length > 0) {
            ItemMgr.Instance.addItem(items);
        }
        if (showItemDialogDatas.length > 0) {
            GameMain.inst.UI.itemInfoUI.showItem(showItemDialogDatas, true);
        }

        if (artifacts.length > 0) {
            ArtifactMgr.Instance.addArtifact(artifacts);

        }
        if (showDialog && showArtifactDialogDatas.length > 0) {
            GameMain.inst.UI.artifactInfoUI.showItem(showArtifactDialogDatas)
        }
    }
}