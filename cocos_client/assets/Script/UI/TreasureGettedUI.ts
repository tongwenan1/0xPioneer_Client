import { _decorator, Color, Component, Label, Node, Sprite, tween, v3, Animation } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import ItemData from '../Model/ItemData';
import { GameMain } from '../GameMain';
import DropMgr from '../Manger/DropMgr';
import ItemMgr from '../Manger/ItemMgr';
import UserInfoMgr from '../Manger/UserInfoMgr';
import { BackpackItem } from './BackpackItem';


const { ccclass, property } = _decorator;

@ccclass('TreasureGettedUI')
export class TreasureGettedUI extends PopUpUI {

    @property([Color])
    frameGradeColors: Color[] = [];

    public async dialogShow(box: any, gettedCallback: () => void) {
        for (let i = 0; i < 3; i++) {
            this.node.getChildByPath("Content/Treasure_box_" + i).active = i == box.icon;
        }

        // prepare treasure box node
        let treasureBoxCameraNode = this.node.getChildByPath("Content/Treasure_box_" + box.icon + "/Treasure_box_camera");
        let treasureBoxNode = this.node.getChildByPath("Content/Treasure_box_" + box.icon + "/Treasure_box");

        let tbcAni = treasureBoxCameraNode.getComponent(Animation);
        let tbAni = treasureBoxNode.getComponent(Animation);

        let tbcAniState = tbcAni.getState(tbcAni.defaultClip.name);
        let tbAniState = tbAni.getState(tbAni.defaultClip.name);
        tbcAniState.time = 0;
        tbAniState.time = 0;
        tbcAniState.play();
        tbAniState.play();

        // prepare item show node
        let itemShowNode = this.node.getChildByPath("Content/Treasure_box_" + box.icon + "/itemShow");
        itemShowNode.scale = v3(0.01, 0.01, 0.01);
        itemShowNode.active = false;

        let resultReward = null;
        const drop = DropMgr.Instance.getDropById(box.drop);
        if (drop.length > 0) {
            const useDrop = drop[0];
            const items = [];
            const weights = [];
            for (const temple of useDrop.drop_group) {
                items.push({
                    type: temple[0],
                    num: temple[1],
                    itemConfigId: temple.length > 3 ? temple[3] : 0
                });
                weights.push(temple[2]);
            }
            resultReward = this._weightedRandomValue(items, weights);

            if (resultReward) {
                let iconspr = itemShowNode.getChildByPath("icon").getComponent(Sprite);
                let framespr = itemShowNode.getChildByPath("Item_frame").getComponent(Sprite);
                framespr.color = Color.WHITE;

                if (resultReward.type == "resource_01") {
                    iconspr.spriteFrame = GameMain.inst.UI.ResourceIconSpriteFrame[0];
                } else if (resultReward.type == "resource_02") {
                    iconspr.spriteFrame = GameMain.inst.UI.ResourceIconSpriteFrame[1];
                } else if (resultReward.type == "resource_03") {
                    iconspr.spriteFrame = GameMain.inst.UI.ResourceIconSpriteFrame[2];
                } else if (resultReward.type == "resource_04") {
                    iconspr.spriteFrame = GameMain.inst.UI.ResourceIconSpriteFrame[3];
                } else if (resultReward.type == "backpack_item") {
                    iconspr.spriteFrame = await BackpackItem.getItemIcon(resultReward.itemConfigId);
                    let itemConf = ItemMgr.Instance.getItemConf(resultReward.itemConfigId);
                    if (itemConf) {
                        framespr.color = this.frameGradeColors[itemConf.grade - 1];
                    }
                    else {
                        // error
                    }
                }
            }
        }

        let thisptr = this;
        tween(itemShowNode)
            .delay(5.5)
            .set({ active: true })
            .to(0.3, { scale: v3(0.1, 0.1, 0.1) })
            .to(0.1, { scale: v3(0.8, 0.8, 0.8) })
            .to(0.2, { scale: v3(0.7, 0.7, 0.7) })
            .delay(0.5)
            .call(() => {
                if (resultReward) {
                    if (resultReward.type == "resource_01") {
                        UserInfoMgr.Instance.wood += resultReward.num;
                    } else if (resultReward.type == "resource_02") {
                        UserInfoMgr.Instance.stone += resultReward.num;
                    } else if (resultReward.type == "resource_03") {
                        UserInfoMgr.Instance.food += resultReward.num;
                    } else if (resultReward.type == "resource_04") {
                        UserInfoMgr.Instance.troop += resultReward.num;
                    } else if (resultReward.type == "backpack_item") {
                        let itemConf = ItemMgr.Instance.getItemConf(resultReward.itemConfigId);
                        if (itemConf) {
                            GameMain.inst.UI.itemInfoUI.showItem([{
                                itemConfig: itemConf,
                                count: resultReward.num,
                            }], true);
                        }  else {
                            // TO DO : config error
                        }
                    }
                }
                UserInfoMgr.Instance.getExplorationReward(box.id);
                thisptr.show(false);
                if (gettedCallback) {
                    gettedCallback();
                }
            })
            .start();
    }

    start() {

    }

    update(deltaTime: number) {

    }

    private _weightedRandomValue<T>(values: T[], weights: number[]): T {

        const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
        const random = Math.random() * totalWeight;

        let cumulativeWeight = 0;
        for (let i = 0; i < values.length; i++) {
            cumulativeWeight += weights[i];
            if (random < cumulativeWeight) {
                return values[i];
            }
        }

        return values[values.length - 1];
    }

}


