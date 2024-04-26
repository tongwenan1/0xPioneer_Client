import { _decorator, Color, Component, Label, Node, Sprite, tween, v3, Animation, ParticleSystem2D } from 'cc';
import { GetPropRankColor } from '../Const/ConstDefine';
import ArtifactData from '../Model/ArtifactData';
import { ArtifactMgr, ItemMgr, UserInfoMgr } from '../Utils/Global';
import ViewController from '../BasicView/ViewController';
import { UIName } from '../Const/ConstUIDefine';
import { ItemSelectFromThreeUI } from './ItemSelectFromThreeUI';
import ArtifactConfig from '../Config/ArtifactConfig';
import DropConfig from '../Config/DropConfig';
import ItemConfigDropTool from '../Tool/ItemConfigDropTool';
import ItemConfig from '../Config/ItemConfig';
import ItemData, { ItemConfigType } from '../Const/Item';
import { BoxInfoConfigData } from '../Const/BoxInfo';
import UIPanelManger from '../Basic/UIPanelMgr';
import { DataMgr } from '../Data/DataMgr';
import { s2c_user } from '../Net/msg/WebsocketMsg';
import { NetworkMgr } from '../Net/NetworkMgr';
const { ccclass, property } = _decorator;

@ccclass('TreasureGettedUI')
export class TreasureGettedUI extends ViewController {
    public async dialogShow(box: BoxInfoConfigData, gettedCallback: (gettedData: { boxId: string, items: ItemData[], artifacts: ArtifactData[], subItems?: ItemData[] }) => void) {
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

        const drop = DropConfig.getById(box.drop);
        if (drop != null) {
            if (drop.type == 2) {
                // 1/3 select
                this.scheduleOnce(async () => {
                    UIPanelManger.inst.popPanel();
                    const result = await UIPanelManger.inst.pushPanel(UIName.ItemSelectFromThreeUI);
                    if (result.success) {
                        result.node.getComponent(ItemSelectFromThreeUI).showItem(box.id, drop.id, (gettedData: { boxId: string, items: ItemData[], artifacts: ArtifactData[], subItems?: ItemData[] }) => {
                            if (gettedCallback) {
                                gettedCallback(gettedData);
                            }
                        });
                    }
                }, (5.5 + 1.1));
            } else {
                const dropResultProp = ItemConfigDropTool.getItemByDropConfig(drop.id);
                if (dropResultProp != null) {
                    let iconspr = itemShowNode.getChildByPath("icon").getComponent(Sprite);
                    let framespr = itemShowNode.getChildByPath("Item_frame").getComponent(Sprite);

                    let rank: number = 0;
                    if (dropResultProp.type == ItemConfigType.Item) {
                        //item
                        let itemConf = ItemConfig.getById(dropResultProp.propId);
                        if (itemConf) {
                            iconspr.spriteFrame = await ItemMgr.getItemIcon(itemConf.icon);
                            rank = itemConf.grade;
                        }

                    } else if (dropResultProp.type == ItemConfigType.Artifact) {
                        // artifact
                        const artifactConf = ArtifactConfig.getById(dropResultProp.propId);
                        if (artifactConf) {
                            iconspr.spriteFrame = await ArtifactMgr.getItemIcon(artifactConf.icon);
                            rank = artifactConf.rank;
                        }
                    }
                    let useColor: Color = null;
                    if (rank == 1) {
                        useColor = new Color().fromHEX(GetPropRankColor.RANK1);
                    } else if (rank == 2) {
                        useColor = new Color().fromHEX(GetPropRankColor.RANK2);
                    } else if (rank == 3) {
                        useColor = new Color().fromHEX(GetPropRankColor.RANK3);
                    } else if (rank == 4) {
                        useColor = new Color().fromHEX(GetPropRankColor.RANK4);
                    } else if (rank == 5) {
                        useColor = new Color().fromHEX(GetPropRankColor.RANK5);
                    }
                    if (useColor != null) {
                        framespr.color = useColor;
                    } else {
                        framespr.color = Color.WHITE;
                    }
                    tween(itemShowNode)
                        .delay(5.5)
                        .set({ active: true })
                        .to(0.3, { scale: v3(0.1, 0.1, 0.1) })
                        .to(0.1, { scale: v3(0.8, 0.8, 0.8) })
                        .to(0.2, { scale: v3(0.7, 0.7, 0.7) })
                        .delay(0.5)
                        .call(() => {
                            const gettedData: { boxId: string, items: ItemData[], artifacts: ArtifactData[] } = {
                                boxId: box.id,
                                items: [],
                                artifacts: [],
                            };
                            if (dropResultProp.type == ItemConfigType.Item) {
                                gettedData.items.push(new ItemData(dropResultProp.propId, dropResultProp.num));

                            } else if (dropResultProp.type == ItemConfigType.Artifact) {
                                gettedData.artifacts.push(new ArtifactData(dropResultProp.propId, dropResultProp.num));
                            }
                            UIPanelManger.inst.popPanel();
                            if (gettedCallback) {
                                gettedCallback(gettedData);
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
}


