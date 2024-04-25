import {
    _decorator,
    Label,
    Node,
    Button,
    EventHandler,
    Prefab,
    instantiate,
    Layout,
    Event,
    NodeEventType,
    EventTouch,
    ScrollView,
    UITransform,
    v3,
    Vec3,
    rect,
    Rect,
} from "cc";
import ArtifactData from "../Model/ArtifactData";
import { LanMgr } from "../Utils/Global";
import ViewController from "../BasicView/ViewController";
import { UIName } from "../Const/ConstUIDefine";
import { ArtifactInfoUI } from "./ArtifactInfoUI";
import UIPanelManger from "../Basic/UIPanelMgr";
import { ArtifactItem } from "./ArtifactItem";
import ManualNestedScrollView from "../BasicView/ManualNestedScrollView";
import { InnerBuildingType } from "../Const/BuildingDefine";
import InnerBuildingLvlUpConfig from "../Config/InnerBuildingLvlUpConfig";
import { DataMgr } from "../Data/DataMgr";
import { WebsocketMsg } from "../Net/msg/WebsocketMsg";
import { NetworkMgr } from "../Net/NetworkMgr";
const { ccclass, property } = _decorator;

@ccclass("ArtifactStore")
export class ArtifactStore extends ViewController {
    private _itemDatas: ArtifactData[] = null;
    private _effectLimit: number = 9;

    private _effectItemContent: Node = null;
    private _effectScrollView: ManualNestedScrollView = null;
    private _effectEmptyItem: Node = null;
    private _allEffectItemViews: { itemData: ArtifactData; node: Node }[] = null;

    private _itemContent: Node = null;
    private _itemView: Node = null;
    private _itemScrollView: ManualNestedScrollView = null;
    private _allItemViews: Node[] = null;

    private _isDragging: boolean = false;
    private _moveArtifactIndex: number = -1;
    private _moveArtifactView: Node = null;
    private _moveEffectViewData: ArtifactData = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        const buildingData = DataMgr.s.userInfo.data.innerBuildings[InnerBuildingType.ArtifactStore];
        if (buildingData != null) {
            this.node.getChildByPath("__ViewContent/Bg/LeftContent/LevelTitle").getComponent(Label).string = "Lv " + buildingData.buildLevel;

            const relicMax: number = InnerBuildingLvlUpConfig.getBuildingLevelData(buildingData.buildLevel, "relic_max");
            if (relicMax != null) {
                this._effectLimit = relicMax;
            }
        }

        // useLanMgr
        // this.node.getChildByPath("__ViewContent/Bg/title").getComponent(Label).string = LanMgr.getLanById("107549");
        //  this.node.getChildByPath("__ViewContent/Bg/LeftContent/EffectTitle").getComponent(Label).string = LanMgr.getLanById("107549");

        this._effectItemContent = this.node.getChildByPath("__ViewContent/Bg/LeftContent/ScrollView/View/Content");
        this._effectEmptyItem = this._effectItemContent.getChildByPath("Item");
        this._effectEmptyItem.removeFromParent();
        this._effectScrollView = this.node.getChildByPath("__ViewContent/Bg/LeftContent/ScrollView").getComponent(ManualNestedScrollView);
        this._effectScrollView.node.on(NodeEventType.TOUCH_START, this._onTouchStart, this);
        this._effectScrollView.node.on(NodeEventType.TOUCH_MOVE, this._onTouchMove, this);
        this._effectScrollView.node.on(NodeEventType.TOUCH_END, this._onTouchEnd, this);
        this._effectScrollView.node.on(NodeEventType.TOUCH_CANCEL, this._onTouchEnd, this);

        this._itemContent = this.node.getChildByPath("__ViewContent/Bg/RightContent/ScrollView/View/Content");
        this._itemView = this._itemContent.getChildByPath("Item");
        this._itemView.removeFromParent();

        this._itemScrollView = this.node.getChildByPath("__ViewContent/Bg/RightContent/ScrollView").getComponent(ManualNestedScrollView);
        this._itemScrollView.node.on(NodeEventType.TOUCH_START, this._onTouchStart, this);
        this._itemScrollView.node.on(NodeEventType.TOUCH_MOVE, this._onTouchMove, this);
        this._itemScrollView.node.on(NodeEventType.TOUCH_END, this._onTouchEnd, this);
        this._itemScrollView.node.on(NodeEventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }
    protected viewDidStart(): void {
        super.viewDidStart();

        this._initArtifact();
        this._refreshArtifactEffect();
    }
    protected viewDidDestroy(): void {
        super.viewDidDestroy();
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByName("__ViewContent");
    }

    private _initArtifact() {
        const itemDatas = DataMgr.s.artifact.getObj();
        this._itemDatas = itemDatas;

        this._allEffectItemViews = [];
        for (let i = 0; i < this._effectLimit; i++) {
            let itemView = instantiate(this._effectEmptyItem);
            itemView.active = true;
            itemView.parent = this._effectItemContent;

            let templeData = null;
            for (const data of this._itemDatas) {
                if (data.effectIndex == i) {
                    templeData = data;
                    break;
                }
            }
            if (templeData != null) {
                const effectView = instantiate(this._itemView);
                effectView.getComponent(ArtifactItem).refreshUI(templeData);
                effectView.getChildByPath("EffectTitle").active = false;
                effectView.parent = itemView;
                effectView.position = Vec3.ZERO;
            }

            this._allEffectItemViews.push({
                itemData: templeData,
                node: itemView,
            });
        }
        this._effectItemContent.getComponent(Layout).updateLayout();

        this._allItemViews = [];
        for (let i = 0; i < itemDatas.length; i++) {
            let itemView = instantiate(this._itemView);
            itemView.active = true;
            itemView.getComponent(ArtifactItem).refreshUI(itemDatas[i]);
            itemView.getChildByPath("EffectTitle").active = false;
            // useLanMgr
            // itemView.getChildByPath("EffectTitle").getComponent(Label).string = LanMgr.getLanById("107549");

            itemView.parent = this._itemContent;
            this._allItemViews.push(itemView);
        }
        this._itemContent.getComponent(Layout).updateLayout();
    }
    private _refreshArtifactEffect() {
        for (let i = 0; i < this._allItemViews.length; i++) {
            this._allItemViews[i].getChildByPath("EffectTitle").active = this._itemDatas[i].effectIndex >= 0;
        }
    }
    //------------------------------------------------------------ action
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel();
    }

    private _onTouchStart(event: EventTouch) {
        if (event.currentTarget == this._itemScrollView.node) {
            for (let i = 0; i < this._allItemViews.length; i++) {
                const worldBox = this._allItemViews[i].getComponent(UITransform).getBoundingBoxToWorld();
                if (worldBox.contains(event.getUILocation())) {
                    this._moveArtifactIndex = i;
                    break;
                }
            }
            this._itemScrollView.forceNested = this._moveArtifactIndex >= 0;
        } else if (event.currentTarget == this._effectScrollView.node) {
            for (let i = 0; i < this._allEffectItemViews.length; i++) {
                if (this._allEffectItemViews[i].itemData == null) {
                    continue;
                }
                const worldBox = this._allEffectItemViews[i].node.getComponent(UITransform).getBoundingBoxToWorld();
                if (worldBox.contains(event.getUILocation())) {
                    this._moveArtifactIndex = i;
                    break;
                }
            }
            this._effectScrollView.forceNested = this._moveArtifactIndex >= 0;
        }
    }
    private _onTouchMove(event: EventTouch) {
        if (this._moveArtifactIndex >= 0) {
            const isItemScrollAction: boolean = event.currentTarget == this._itemScrollView.node;
            if (isItemScrollAction) {
                if (this._itemDatas[this._moveArtifactIndex].effectIndex >= 0) {
                    // on effect cannot drag
                    return;
                }
            }
            if (!this._isDragging) {
                const delta = event.getUIDelta();
                if (Math.abs(delta.x) >= 2 || Math.abs(delta.y) >= 2) {
                    // begin drag init
                    this._isDragging = true;
                    if (isItemScrollAction) {
                        this._moveArtifactView = instantiate(this._allItemViews[this._moveArtifactIndex]);
                        this._moveArtifactView.parent = this.node;
                        this._moveArtifactView.position = this.node
                            .getComponent(UITransform)
                            .convertToNodeSpaceAR(this._allItemViews[this._moveArtifactIndex].worldPosition.clone());
                    } else {
                        this._moveArtifactView = instantiate(this._allEffectItemViews[this._moveArtifactIndex].node);
                        this._moveArtifactView.parent = this.node;
                        this._moveArtifactView.position = this.node
                            .getComponent(UITransform)
                            .convertToNodeSpaceAR(this._allEffectItemViews[this._moveArtifactIndex].node.worldPosition.clone());
                        // remove
                        this._moveEffectViewData = this._allEffectItemViews[this._moveArtifactIndex].itemData;
                        this._moveEffectViewData.effectIndex = -1;
                        this._allEffectItemViews[this._moveArtifactIndex].itemData = null;
                        for (const child of this._allEffectItemViews[this._moveArtifactIndex].node.children) {
                            if (child.name == "Item") {
                                child.removeFromParent();
                                break;
                            }
                        }
                        this._refreshArtifactEffect();
                    }
                }
            }
            if (!this._isDragging) {
                return;
            }

            if (this._moveArtifactView != null) {
                const pos = this._moveArtifactView.worldPosition.add(v3(event.getUIDelta().x, event.getUIDelta().y, 0));
                this._moveArtifactView.worldPosition = pos;
            }
        }
    }
    private async _onTouchEnd(event: EventTouch) {
        if (this._moveArtifactIndex >= 0) {
            const isItemScrollAction: boolean = event.currentTarget == this._itemScrollView.node;
            if (this._isDragging) {
                // is effect
                const moveWorldBox = this._moveArtifactView.getComponent(UITransform).getBoundingBoxToWorld();
                let intersectItem: { itemData: ArtifactData; node: Node } = null;
                for (const effectItem of this._allEffectItemViews) {
                    if (effectItem.itemData == null) {
                        const effectWorldBox = effectItem.node.getComponent(UITransform).getBoundingBoxToWorld();
                        const intersection = rect(0, 0, 0, 0);
                        Rect.intersection(intersection, moveWorldBox, effectWorldBox);
                        if (intersection.width > 0 && intersection.height > 0) {
                            if (intersectItem == null) {
                                intersectItem = effectItem;
                            } else {
                                const intersectionArea = intersection.width * intersection.height;
                                const curIntersectionArea =
                                    intersectItem.node.getComponent(UITransform).getBoundingBoxToWorld().width *
                                    intersectItem.node.getComponent(UITransform).getBoundingBoxToWorld().height;
                                if (intersectionArea > curIntersectionArea) {
                                    intersectItem = effectItem;
                                }
                            }
                        }
                    }
                }
                this._moveArtifactView.removeFromParent();
                const index: number = this._allEffectItemViews.indexOf(intersectItem);
                if (intersectItem != null && index >= 0) {
                    if (isItemScrollAction) {
                        intersectItem.itemData = this._itemDatas[this._moveArtifactIndex];
                        this._itemDatas[this._moveArtifactIndex].effectIndex = index;

                        DataMgr.setTempSendData("player_artifact_equip_res", {
                            artifactId: this._itemDatas[this._moveArtifactIndex].uniqueId,
                            effectIndex: index,
                        });
                        NetworkMgr.websocketMsg.player_artifact_equip({ artifactId: this._itemDatas[this._moveArtifactIndex].uniqueId });
                    } else {
                        if (this._moveEffectViewData != null) {
                            this._moveEffectViewData.effectIndex = index;
                            this._allEffectItemViews[index].itemData = this._moveEffectViewData;

                            DataMgr.setTempSendData("player_artifact_equip_res", {
                                artifactId: this._moveEffectViewData.uniqueId,
                                effectIndex: index,
                            });
                            NetworkMgr.websocketMsg.player_artifact_equip({ artifactId: this._moveEffectViewData.uniqueId });
                        }
                    }
                    this._moveArtifactView.parent = intersectItem.node;
                    this._moveArtifactView.position = Vec3.ZERO;
                    this._refreshArtifactEffect();
                } else {
                    if (!isItemScrollAction && this._moveEffectViewData != null) {
                        DataMgr.setTempSendData("player_artifact_remove_res", {
                            artifactId: this._moveEffectViewData.uniqueId,
                            effectIndex: -1,
                        });
                        NetworkMgr.websocketMsg.player_artifact_remove({ artifactId: this._moveEffectViewData.uniqueId });
                    }
                }
            } else {
                let itemData: ArtifactData = null;
                if (isItemScrollAction) {
                    itemData = this._itemDatas[this._moveArtifactIndex];
                } else {
                    itemData = this._allEffectItemViews[this._moveArtifactIndex].itemData;
                }
                if (itemData != null) {
                    const result = await UIPanelManger.inst.pushPanel(UIName.ArtifactInfoUI);
                    if (result.success) {
                        result.node.getComponent(ArtifactInfoUI).showItem([itemData]);
                    }
                }
            }
        }

        this._moveArtifactIndex = -1;
        this._moveArtifactView = null;
        this._moveEffectViewData = null;
        this._isDragging = false;
        this._itemScrollView.forceNested = false;
        this._effectScrollView.forceNested = false;
    }
}
