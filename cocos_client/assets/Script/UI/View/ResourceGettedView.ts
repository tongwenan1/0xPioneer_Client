import { _decorator, Component, Details, instantiate, Label, Layout, Node, Tween, tween, UIOpacity, v3 } from "cc";
import ViewController from "../../BasicView/ViewController";
import { ResourceCorrespondingItem } from "../../Const/ConstDefine";
import { ItemMgr, LanMgr } from "../../Utils/Global";
import ItemConfig from "../../Config/ItemConfig";
import ItemData from "../../Const/Item";
import { UserInnerBuildInfo } from "../../Const/BuildingDefine";
import InnerBuildingConfig from "../../Config/InnerBuildingConfig";

const { ccclass, property } = _decorator;

@ccclass('ResourceGettedView')
export class ResourceGettedView extends ViewController {
    //--------------------------------- public
    public showTip(items: (ItemData | UserInnerBuildInfo)[]) {
        this._itemDatas = this._itemDatas.concat(items);
        this._addItemToContent();
    }

    //--------------------------------- lifeCycle
    private _showItem: Node = null;
    private _allShowItems: Node[] = [];

    private _itemDatas: (ItemData | UserInnerBuildInfo)[] = [];
    private _isAddingItem: boolean = false;
    private _playingNode: Node = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._showItem = this.node.getChildByPath("Content/Item");
        this._showItem.active = false;
    }

    //--------------------------------- function
    private _addItemToContent() {
        if (this._isAddingItem) {
            return;
        }
        if (this._itemDatas.length > 0) {
            this._isAddingItem = true;
            const item = this._itemDatas.shift();
            const itemView = instantiate(this._showItem);
            if (item instanceof ItemData) {
                itemView.getChildByPath("IconTip").active = true;
                itemView.getChildByPath("TextTip").active = false;
                const config = ItemConfig.getById(item.itemConfigId);
                if (config == null) {
                    return;
                }
                itemView.getChildByPath("IconTip/Icon/8001").active = item.itemConfigId == ResourceCorrespondingItem.Food;
                itemView.getChildByPath("IconTip/Icon/8002").active = item.itemConfigId == ResourceCorrespondingItem.Wood;
                itemView.getChildByPath("IconTip/Icon/8003").active = item.itemConfigId == ResourceCorrespondingItem.Stone;
                itemView.getChildByPath("IconTip/Icon/8004").active = item.itemConfigId == ResourceCorrespondingItem.Troop;
                itemView.getChildByPath("IconTip/Icon/8005").active = item.itemConfigId == ResourceCorrespondingItem.Energy;
                itemView.getChildByPath("IconTip/Name").getComponent(Label).string = LanMgr.getLanById(config.itemName);
                itemView.getChildByPath("IconTip/Num").getComponent(Label).string = "+" + item.count;

            } else if (!!(item as UserInnerBuildInfo)) {
                itemView.getChildByPath("IconTip").active = false;
                itemView.getChildByPath("TextTip").active = true;
                const config = InnerBuildingConfig.getByBuildingType(item.buildType);
                if (config == null) {
                    return;
                }
                itemView.getChildByPath("TextTip/Tip").getComponent(Label).string = LanMgr.replaceLanById("106004", [LanMgr.getLanById(config.name), item.buildLevel]);
            }

            itemView.setParent(this._showItem.parent);
            tween()
                .target(itemView)
                .delay(0.3)
                .set({ active: true })
                .call(() => {
                    this._playShowAnim();
                    this._isAddingItem = false;
                    this._addItemToContent();
                    this._showItem.parent.getComponent(Layout).updateLayout();
                })
                .start();
            this._allShowItems.push(itemView);
        }
    }

    private _playShowAnim() {
        if (this._playingNode != null) {
            return;
        }
        if (this._allShowItems.length > 0 && this._allShowItems[0].active) {
            this._playingNode = this._allShowItems.shift();
            tween()
                .target(this._playingNode.getComponent(UIOpacity))
                .delay(1.5)
                .to(0.3, { opacity: 0 })
                .call(() => {
                    this._playingNode.destroy();
                    this._playingNode = null;
                    this._showItem.parent.getComponent(Layout).updateLayout();
                    this._playShowAnim();
                })
                .start();
        }
    }

    //--------------------------------- action
    private onTapShowContent() {
        if (this._playingNode != null) {
            Tween.stopAllByTarget(this._playingNode.getComponent(UIOpacity));
            tween()
                .target(this._playingNode.getComponent(UIOpacity))
                .to(0.3, { opacity: 0 })
                .call(() => {
                    this._playingNode.destroy();
                    this._playingNode = null;
                    this._showItem.parent.getComponent(Layout).updateLayout();
                    this._playShowAnim();
                })
                .start();
        }
    }
}