import { _decorator, Color, Component, Label, Node, Sprite, tween, v3, Animation, ParticleSystem2D } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import ItemData, { ItemType } from '../Model/ItemData';
import { GameMain } from '../GameMain';
import DropMgr from '../Manger/DropMgr';
import ItemMgr from '../Manger/ItemMgr';
import UserInfoMgr from '../Manger/UserInfoMgr';
import { BackpackItem } from './BackpackItem';
import CommonTools from '../Tool/CommonTools';
import ItemConfigDropTool from '../Tool/ItemConfigDropTool';
import { ItemConfigType } from '../Const/ConstDefine';


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
        let itemShowAnim = this.node.getChildByPath("Content/Treasure_box_" + box.icon + "/OpenAnim");
        itemShowAnim.active = false;
        let itemShowNode = this.node.getChildByPath("Content/Treasure_box_" + box.icon + "/itemShow");
        itemShowNode.scale = v3(0.01, 0.01, 0.01);
        itemShowNode.active = false;

        let resultReward = null;
        const drop = DropMgr.Instance.getDropById(box.drop);
        if (drop.length > 0) {
            const useDrop = drop[0];
            const items = [];
            const weights = [];
            // drop type index 0
            // drop num index 1
            // drop weight index 2
            // drop id index 3
            for (const temple of useDrop.drop_group) {
                items.push({
                    type: temple[0],
                    num: temple[1],
                    itemConfigId: temple.length > 3 ? temple[3] : 0
                });
                weights.push(temple[2]);
            }
            resultReward = CommonTools.weightedRandomValue(items, weights);

            if (resultReward) {
                let iconspr = itemShowNode.getChildByPath("icon").getComponent(Sprite);
                let framespr = itemShowNode.getChildByPath("Item_frame").getComponent(Sprite);
                framespr.color = Color.WHITE;
                if (resultReward.type == ItemConfigType.Item) {
                    iconspr.spriteFrame = await BackpackItem.getItemIcon(resultReward.itemConfigId);
                    let itemConf = ItemMgr.Instance.getItemConf(resultReward.itemConfigId);
                    if (itemConf) {
                        framespr.color = this.frameGradeColors[itemConf.grade - 1];
                    }
                    else {
                        // error
                    }
                } else if (resultReward.type == ItemConfigType.Artifact) {
                    // wait artifact
                }
            }
        }

        let thisptr = this;
        tween(itemShowAnim)
            .delay(5.5)
            .set({ active: true })
            .call(() => {
                itemShowAnim.getChildByName("Treasure_box_open_a").getComponent(ParticleSystem2D).resetSystem();
                itemShowAnim.getChildByName("Treasure_box_open_b").getComponent(ParticleSystem2D).resetSystem();
            })
            .start();

        tween(itemShowNode)
            .delay(5.5)
            .set({ active: true })
            .to(0.3, { scale: v3(0.1, 0.1, 0.1) })
            .to(0.1, { scale: v3(0.8, 0.8, 0.8) })
            .to(0.2, { scale: v3(0.7, 0.7, 0.7) })
            .delay(0.5)
            .call(() => {
                if (resultReward) {
                    const configItemDatas = [
                        [
                            resultReward.type,
                            resultReward.itemConfigId,
                            resultReward.num
                        ]
                    ];
                    ItemConfigDropTool.getItemByConfig(configItemDatas);
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

    

}


