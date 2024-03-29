import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, RichText, randomRangeInt, Layout, Color } from 'cc';
import { GetPropRankColor, ResourceCorrespondingItem } from '../Const/ConstDefine';
import { ArtifactItem } from './ArtifactItem';
import { ArtifactMgr, ItemMgr, LanMgr, UIPanelMgr } from '../Utils/Global';
import ArtifactData from '../Model/ArtifactData';
import ViewController from '../BasicView/ViewController';
import { UIName } from '../Const/ConstUIDefine';
import { ArtifactInfoUI } from './ArtifactInfoUI';
import { UIHUDController } from './UIHUDController';
import ArtifactConfig from '../Config/ArtifactConfig';
import ArtifactEffectConfig from '../Config/ArtifactEffectConfig';
import DropConfig from '../Config/DropConfig';
import { DropConfigData } from '../Const/Drop';
import { ItemConfigType } from '../Const/Item';
const { ccclass, property } = _decorator;

@ccclass('ItemSelectFromThreeUI')
export class ItemSelectFromThreeUI extends ViewController {

    public async showItem(dropId: string, selectedCallback: () => void) {
        this._selectedCallback = selectedCallback;
        const drop = DropConfig.getById(dropId);
        this.node.getChildByPath("__ViewContent/Title").getComponent(Label).string = LanMgr.getLanById("200004");
        // useLanMgr
        // this.node.getChildByPath("__ViewContent/GetAllBtn/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        if (drop != null) {
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

                const content = this.node.getChildByPath("__ViewContent/ImgTextBg/SelectContent").getComponent(Layout);
                for (let i = 0; i < this._items.length; i++) {
                    const config = ArtifactConfig.getById(this._items[i].artifactConfigId);
                    if (config == null) {
                        continue;
                    }
                    let useColor: Color = null;
                    let useTitle: string = null;
                    if (config.rank == 1) {
                        useColor = new Color().fromHEX(GetPropRankColor.RANK1);
                        useTitle = LanMgr.getLanById("105001");
                    } else if (config.rank == 2) {
                        useColor = new Color().fromHEX(GetPropRankColor.RANK2);
                        useTitle = LanMgr.getLanById("105002");
                    } else if (config.rank == 3) {
                        useColor = new Color().fromHEX(GetPropRankColor.RANK3);
                        useTitle = LanMgr.getLanById("105003");
                    } else if (config.rank == 4) {
                        useColor = new Color().fromHEX(GetPropRankColor.RANK4);
                        useTitle = LanMgr.getLanById("105004");
                    } else if (config.rank == 5) {
                        useColor = new Color().fromHEX(GetPropRankColor.RANK5);
                        useTitle = LanMgr.getLanById("105005");
                    }
                    const tempView = instantiate(this._itemView);
                    tempView.active = true;

                    // bg 
                    for (let i = 2; i <= 5; i++) {
                        tempView.getChildByPath("Bg/Rank_" + i).active = config.rank == i;
                    }

                    // name 
                    tempView.getChildByName("Name").getComponent(Label).string = LanMgr.getLanById(config.name);
                    tempView.getChildByName("Name").getComponent(Label).color = useColor;

                    // item
                    tempView.getChildByName("ArtifactItem").getComponent(ArtifactItem).refreshUI(items[i]);

                    // title 
                    tempView.getChildByName("Title").getComponent(Label).string = useTitle;
                    tempView.getChildByName("Title").getComponent(Label).color = useColor;

                    // effect
                    if (config.effect.length > 0) {
                        const firstEffectConfig = ArtifactEffectConfig.getById(config.effect[0]);
                        if (firstEffectConfig != null) {
                            tempView.getChildByPath("StableEffect/Title").getComponent(Label).string = LanMgr.getLanById(firstEffectConfig.des);
                        }
                    }
                    // button
                    tempView.getChildByName("GetBtn").getComponent(Button).clickEvents[0].customEventData = i.toString();
                    // useLanMgr
                    // tempView.getChildByPath("GetBtn/name").getComponent(Label).string = LanMgr.getLanById("107549");

                    content.node.addChild(tempView);
                    this._showItemViews.push(tempView);
                }
                content.updateLayout();
            }
        }
    }

    private _items: ArtifactData[];
    private _selectedCallback: () => void;

    private _itemView: Node = null;
    private _showItemViews: Node[] = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._itemView = this.node.getChildByPath("__ViewContent/ImgTextBg/SelectContent/Item");
        this._itemView.active = false;

        this._showItemViews = [];
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByPath("__ViewContent");
    }

    //---------------------------------------------------- action
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelMgr.removePanelByNode(this.node);
    }

    private async onTapGet(event: Event, customEventData: any) {
        const index: number = parseInt(customEventData);
        const item = this._items[index];
        ArtifactMgr.addArtifact([item]);
        const view = await UIPanelMgr.openPanel(UIName.ArtifactInfoUI);
        if (view != null) {
            view.getComponent(ArtifactInfoUI).showItem([item]);
        }
        if (this._selectedCallback != null) {
            this._selectedCallback();
        }
        await this.playExitAnimation();
        UIPanelMgr.removePanelByNode(this.node);
    }

    private async onTapGetAll() {
        const energyNum: number = ItemMgr.getOwnItemCount(ResourceCorrespondingItem.Energy);
        const needNum: number = 200;
        if (energyNum >= needNum) {
            ArtifactMgr.addArtifact(this._items);
            ItemMgr.subItem(ResourceCorrespondingItem.Energy, needNum);

            const view = await UIPanelMgr.openPanel(UIName.ArtifactInfoUI);
            if (view != null) {
                view.getComponent(ArtifactInfoUI).showItem(this._items);
            }
            if (this._selectedCallback != null) {
                this._selectedCallback();
            }
            await this.playExitAnimation();
            UIPanelMgr.removePanelByNode(this.node);
        } else {
            // useLanMgr
            // UIHUDController.showCenterTip(LanMgr.getLanById("201004"));
            UIHUDController.showCenterTip("Insufficient resources for get all");
        }
    }
}