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
import { ArtifactItem } from './ArtifactItem';
import ArtifactMgr from '../Manger/ArtifactMgr';
import ArtifactData from '../Model/ArtifactData';


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

        const drop = DropMgr.Instance.getDropById(box.drop);
        if (drop.length > 0) {
            const useDrop = drop[0];
            if (useDrop.type == 2) {
                // 1/3 select
                this.scheduleOnce(()=> {
                    GameMain.inst.UI.itemSelectFromThreeUI.showItem(useDrop.id, ()=> {
                        UserInfoMgr.Instance.getExplorationReward(box.id);
                        if (gettedCallback) {
                            gettedCallback();
                        }
                    });
                    this.show(false);
                }, (5.5 + 1.1));
            } else {
                // weight get
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
                let resultReward = CommonTools.weightedRandomValue(items, weights);
                if (resultReward != null) {
                    let iconspr = itemShowNode.getChildByPath("icon").getComponent(Sprite);
                    let framespr = itemShowNode.getChildByPath("Item_frame").getComponent(Sprite);
                    framespr.color = Color.WHITE;
                    if (resultReward.type == ItemConfigType.Item) {
                        //item
                        iconspr.spriteFrame = await ItemMgr.Instance.getItemIcon(resultReward.itemConfigId);
                        let itemConf = ItemMgr.Instance.getItemConf(resultReward.itemConfigId);
                        if (itemConf) {
                            framespr.color = this.frameGradeColors[itemConf.grade - 1];
                        }

                    } else if (resultReward.type == ItemConfigType.Artifact) {
                        // artifact
                        iconspr.spriteFrame = await ArtifactMgr.Instance.getItemIcon(resultReward.itemConfigId);

                        const artifactConf = ArtifactMgr.Instance.getArtifactConf(resultReward.itemConfigId);
                        if (artifactConf) {
                            framespr.color = this.frameGradeColors[artifactConf.rank - 1];
                        }
                    }
                    tween(itemShowNode)
                        .delay(5.5)
                        .set({ active: true })
                        .to(0.3, { scale: v3(0.1, 0.1, 0.1) })
                        .to(0.1, { scale: v3(0.8, 0.8, 0.8) })
                        .to(0.2, { scale: v3(0.7, 0.7, 0.7) })
                        .delay(0.5)
                        .call(() => {
                            if (resultReward) {
                                if (resultReward.type == ItemConfigType.Item) {
                                    ItemMgr.Instance.addItem([new ItemData(resultReward.itemConfigId, resultReward.num)]);

                                } else if (resultReward.type == ItemConfigType.Artifact) {
                                    ArtifactMgr.Instance.addArtifact([new ArtifactData(resultReward.itemConfigId, resultReward.num)])
                                }
                            }
                            UserInfoMgr.Instance.getExplorationReward(box.id);
                            this.show(false);
                            if (gettedCallback) {
                                gettedCallback();
                            }
                        })
                        .start();
                }
            }
        }

        tween(itemShowAnim)
            .delay(5.5)
            .set({ active: true })
            .call(() => {
                itemShowAnim.getChildByName("Treasure_box_open_a").getComponent(ParticleSystem2D).resetSystem();
                itemShowAnim.getChildByName("Treasure_box_open_b").getComponent(ParticleSystem2D).resetSystem();
            })
            .start();
    }

    start() {

    }

    update(deltaTime: number) {

    }



}


