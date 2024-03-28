import { _decorator, Component, Details, instantiate, Label, Layout, Node, tween, UIOpacity, v3 } from "cc";
import ViewController from "../../BasicView/ViewController";
import ItemData from "../../Model/ItemData";
import { ResourceCorrespondingItem } from "../../Const/ConstDefine";
import { ItemMgr, LanMgr, UIPanelMgr } from "../../Utils/Global";

const { ccclass, property } = _decorator;

@ccclass('ResourceGettedView')
export class ResourceGettedView extends ViewController {
    public showTip(items: ItemData[]) {
        const gapTime: number = 0.3;
        let delayTime: number = 0;
        if (this._allShowItems.length > 0) {
            delayTime = gapTime;
        }
        for (const item of items) {
            const config = ItemMgr.getItemConf(item.itemConfigId);
            if (config == null) {
                continue;
            }
            const itemView = instantiate(this._showItem);
            itemView.getChildByPath("Icon/8001").active = item.itemConfigId == ResourceCorrespondingItem.Food;
            itemView.getChildByPath("Icon/8002").active = item.itemConfigId == ResourceCorrespondingItem.Wood;
            itemView.getChildByPath("Icon/8003").active = item.itemConfigId == ResourceCorrespondingItem.Stone;
            itemView.getChildByPath("Icon/8004").active = item.itemConfigId == ResourceCorrespondingItem.Troop;
            itemView.getChildByPath("Icon/8005").active = item.itemConfigId == ResourceCorrespondingItem.Energy;
            itemView.getChildByPath("Tip").getComponent(Label).string = LanMgr.replaceLanById("106003", [LanMgr.getLanById(config.itemName), item.count]);
            itemView.setParent(this._showItem.parent);
            tween()
            .target(itemView)
            .delay(delayTime)
            .set({ active: true })
            .call(()=> {
                this._playShowAnim();
                this._showItem.parent.getComponent(Layout).updateLayout();
            })
            .start();
            this._allShowItems.push(itemView);
            delayTime += gapTime;
        }
    }

    private _showItem: Node = null;
    private _allShowItems: Node[] = [];

    private _isAniming: boolean = false;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._showItem = this.node.getChildByPath("Content/Item");
        this._showItem.active = false;
    }

    private _playShowAnim() {   
        if (this._isAniming) {
            return;
        }
        if (this._allShowItems.length > 0 && this._allShowItems[0].active) {
            this._isAniming = true;
            const item = this._allShowItems.shift();
            tween()
            .target(item.getComponent(UIOpacity))
            .delay(3)
            .to(0.3, { opacity: 0 })
            .call(()=> {
                this._isAniming = false;
                this._playShowAnim();
            })
            .start();
        } else {
            if (this._allShowItems.length <= 0) {
                UIPanelMgr.removePanelByNode(this.node);
            }
        }
    }
}