import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, RichText, randomRangeInt, Layout, Color } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import LanMgr from '../Manger/LanMgr';
import ArtifactMgr from '../Manger/ArtifactMgr';
import ArtifactData, { ArtifactEffectRankColor } from '../Model/ArtifactData';
import DropMgr from '../Manger/DropMgr';
import { ItemConfigType } from '../Const/ConstDefine';
import { GameMain } from '../GameMain';
import { ArtifactItem } from './ArtifactItem';
const { ccclass, property } = _decorator;

@ccclass('ItemSelectFromThreeUI')
export class ItemSelectFromThreeUI extends PopUpUI {

    public async showItem(dropId: string, selectedCallback: () => void) {

        this._selectedCallback = selectedCallback;
        const drops: any[] = DropMgr.Instance.getDropById(dropId);
        // useLanMgr
        // this.node.getChildByName("Content/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        if (drops.length > 0) {
            const drop = drops[0];
            if (drop.type == 2) {
                // only support artifact
                const items: ArtifactData[] = [];
                for (const dropItemData of drop.drop_group) {
                    if (dropItemData.length == 4) {
                        const type = dropItemData[0];
                        const num = dropItemData[1];
                        const id = dropItemData[3];
                        if (type == ItemConfigType.Artifact) {
                            items.push(new ArtifactData(id, num));
                        }
                    }
                }
                this._items = items;

                for (const item of this._showItemViews) {
                    item.destroy();
                }
                this._showItemViews = [];

                const content = this.node.getChildByName("Content/ImgTextBg/SelectContent").getComponent(Layout);
                for (let i = 0; i < this._items.length; i++) {
                    const config = ArtifactMgr.Instance.getArtifactConf(this._items[i].artifactConfigId);
                    if (config == null) {
                        continue;
                    }
                    let useColor: Color = null;
                    if (config.rank == 1) {
                        useColor = new Color().fromHEX(ArtifactEffectRankColor.RANK1);
                    } else if (config.rank == 2) {
                        useColor = new Color().fromHEX(ArtifactEffectRankColor.RANK2);
                    } else if (config.rank == 3) {
                        useColor = new Color().fromHEX(ArtifactEffectRankColor.RANK3);
                    } else if (config.rank == 4) {
                        useColor = new Color().fromHEX(ArtifactEffectRankColor.RANK4);
                    } else if (config.rank == 5) {
                        useColor = new Color().fromHEX(ArtifactEffectRankColor.RANK5);
                    }
                    const tempView = instantiate(this._itemView);
                    tempView.active = true;

                    // bg 
                    for (let i = 2; i <= 4; i++) {
                        tempView.getChildByPath("Bg/Rank_" + i).active = config.rank == i;
                    }

                    // name 
                    tempView.getChildByName("Name").getComponent(Label).string = LanMgr.Instance.getLanById(config.name);
                    tempView.getChildByName("Name").getComponent(Label).color = useColor;

                    // item
                    tempView.getChildByName("ArtifactItem").getComponent(ArtifactItem).refreshUI(items[i]);

                    // title 
                    // useLanMgr
                    // tempView.getChildByName("Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
                    tempView.getChildByName("Title").getComponent(Label).color = useColor;

                    // effect
                    if (config.effect.length > 0) {
                        const firstEffectConfig = ArtifactMgr.Instance.getArtifactEffectConf(config.effect[0]);
                        if (firstEffectConfig != null) {
                            tempView.getChildByPath("StableEffect/Title").getComponent(Label).string = LanMgr.Instance.getLanById(firstEffectConfig.des);
                        }
                    }
                    // button
                    tempView.getChildByName("GetBtn").getComponent(Button).clickEvents[0].customEventData = i.toString();
                    // useLanMgr
                    // tempView.getChildByPath("GetBtn/name").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

                    content.node.addChild(tempView);
                    this._showItemViews.push(tempView);
                }
                content.updateLayout();

                // show
                this.show(true);
            }
        }
    }

    private _items: ArtifactData[];
    private _selectedCallback: () => void;

    private _itemView: Node = null;
    private _showItemViews: Node[] = null;
    onLoad(): void {
        this._itemView = this.node.getChildByPath("Content/ImgTextBg/SelectContent/Item");
        this._itemView.active = false;

        this._showItemViews = [];
    }

    start() {


    }

    //---------------------------------------------------- action
    private onTapClose() {
        this.show(false);
    }

    private onTapGet(event: Event, customEventData: any) {
        const index: number = parseInt(customEventData);
        const item = this._items[index];
        ArtifactMgr.Instance.addArtifact([item]);
        GameMain.inst.UI.artifactInfoUI.showItem([item]);

        if (this._selectedCallback != null) {
            this._selectedCallback();
        }
        this.show(false);
    }
}