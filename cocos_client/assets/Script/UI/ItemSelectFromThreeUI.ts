import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate, RichText, randomRangeInt, Layout } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import LanMgr from '../Manger/LanMgr';
import { ArtifactInfoShowModel, ArtifactInfoUI } from './ArtifactInfoUI';
import ArtifactMgr from '../Manger/ArtifactMgr';
import ArtifactData from '../Model/ArtifactData';
import DropMgr from '../Manger/DropMgr';
import { ItemConfigType } from '../Const/ConstDefine';
import { GameMain } from '../GameMain';
const { ccclass, property } = _decorator;

@ccclass('ItemSelectFromThreeUI')
export class ItemSelectFromThreeUI extends PopUpUI {

    public async showItem(dropId: string, selectedCallback: ()=> void) {

        this._selectedCallback = selectedCallback;
        const drops: any[] = DropMgr.Instance.getDropById(dropId);
        if (drops.length > 0) {
            const drop = drops[0];
            if (drop.type == 2) {
                // only support artifact
                const items: ArtifactInfoShowModel[] = [];
                for (const dropItemData of drop.drop_group) {
                    if (dropItemData.length == 4) {
                        const type = dropItemData[0];
                        const num = dropItemData[1];
                        const id = dropItemData[3];
                        if (type == ItemConfigType.Artifact) {
                            const artifactConfig = ArtifactMgr.Instance.getArtifactConf(id);
                            if (artifactConfig == null) {
                                continue;
                            }
                            items.push({
                                artifactConfig: artifactConfig,
                                count: num
                            });
                        }
                    }
                }
                this._items = items;

                for (const item of this._showItemViews) {
                    item.destroy();
                }
                this._showItemViews = [];

                const content = this.node.getChildByName("Content").getComponent(Layout);
                for (let i = 0; i < this._items.length; i++) {
                    const tempView = instantiate(this._itemView);
                    tempView.active = true;
                    // useLanMgr
                    tempView.getChildByName("Name").getComponent(Label).string = LanMgr.Instance.getLanById(this._items[i].artifactConfig.name);
                    tempView.getChildByName("DescTxt").getComponent(RichText).string = LanMgr.Instance.getLanById(this._items[i].artifactConfig.des);
                    tempView.getChildByName("GetBtn").getComponent(Button).clickEvents[0].customEventData = i.toString();
                    content.node.addChild(tempView);
                    this._showItemViews.push(tempView);
                }
                content.updateLayout();

                // show
                this.show(true);
            }
        }
    }

    private _items: ArtifactInfoShowModel[];
    private _selectedCallback: () => void;

    private _itemView: Node = null;
    private _showItemViews: Node[] = null;
    onLoad(): void {
        this._itemView = this.node.getChildByPath("Content/Item");
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
        ArtifactMgr.Instance.addArtifact([new ArtifactData(item.artifactConfig.configId, item.count)]);
        
        const config = ArtifactMgr.Instance.getArtifactConf(item.artifactConfig.configId);
        if (config != null) {
            GameMain.inst.UI.artifactInfoUI.showItem([{
                artifactConfig: config,
                count: item.count
            }]);
        }
        if (this._selectedCallback != null) {
            this._selectedCallback();
        }
        this.show(false);
    }
}