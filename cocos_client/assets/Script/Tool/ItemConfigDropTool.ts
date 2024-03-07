import { ItemConfigType } from "../Const/ConstDefine";
import { GameMain } from "../GameMain";
import DropMgr from "../Manger/DropMgr";
import ItemMgr from "../Manger/ItemMgr";
import ItemData, { ItemType } from "../Model/ItemData";
import { ItemInfoShowModel } from "../UI/ItemInfoUI";
import CommonTools from "./CommonTools";

export default class ItemConfigDropTool {
    /**
     * get item and artifact by config
     * @param datas config
     * @param showDialog showGettedUI
     */
    public static getItemByConfig(datas: any[], showDialog: boolean = true) {
        const items: ItemData[] = [];
        const showItemDialogDatas: ItemInfoShowModel[] = [];

        const artifact: any[] = [];
        for (const data of datas) {
            if (data.length == 3) {
                const type: ItemConfigType = parseInt(data[0] + "");
                const id: number = parseInt(data[1] + "");
                const num: number = parseInt(data[2] + "");
                let tempItem: ItemData = null;
                let tempArtifact: any = null;

                if (type == ItemConfigType.Item) {
                    tempItem = new ItemData(id, num);

                } else if (type == ItemConfigType.Artifact) {
                    // reserve

                } else if (type == ItemConfigType.Drop) {
                    let resultReward: { type: number, num: number, itemConfigId: number } = null;
                    const drop = DropMgr.Instance.getDropById(id.toString());
                    if (drop.length > 0) {
                        const useDrop = drop[0];
                        const items: { type: number, num: number, itemConfigId: number }[] = [];
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
                            // reserve
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
            }
        }
        if (items.length > 0) {
            ItemMgr.Instance.addItem(items);
        }
        if (showItemDialogDatas.length > 0) {
            GameMain.inst.UI.itemInfoUI.showItem(showItemDialogDatas, true);
        }
    }
}