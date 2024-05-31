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
import { GameMgr, LanMgr } from "../Utils/Global";
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
import { RelicSelectUI } from "./RelicSelectUI";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import { GameExtraEffectType } from "../Const/ConstDefine";
const { ccclass, property } = _decorator;

@ccclass("RelicTowerUI")
export class RelicTowerUI extends ViewController {
    private _effectLimit: number = 1;

    private _currentSlotViews: Node[] = [];
    private _effectItemViews: Node[] = [];

    private _effectContent: Node = null;
    private _effectView: Node = null;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        // useLanMgr
        // this.node.getChildByPath("__ViewContent/Bg/title").getComponent(Label).string = LanMgr.getLanById("107549");

        const buildingLevel = DataMgr.s.innerBuilding.getInnerBuildingLevel(InnerBuildingType.ArtifactStore);
        this.node.getChildByPath("__ViewContent/Bg/LeftContent/LevelTitle").getComponent(Label).string = "Lv " + buildingLevel;

        this._effectContent = this.node.getChildByPath("__ViewContent/Bg/LeftContent/ScrollView/View/Content");
        this._effectView = this._effectContent.getChildByPath("Item");
        this._effectView.removeFromParent();

        const relicMax: number = InnerBuildingLvlUpConfig.getBuildingLevelData(buildingLevel, "relic_max");
        if (relicMax != null) {
            this._effectLimit = relicMax;
        }
        const level1View = this.node.getChildByPath("__ViewContent/Bg/RightContent/Level_1");
        const level2View = this.node.getChildByPath("__ViewContent/Bg/RightContent/Level_2");
        const level3View = this.node.getChildByPath("__ViewContent/Bg/RightContent/Level_3");

        level1View.active = false;
        level2View.active = false;
        level3View.active = false;

        let slotContentView: Node = null;
        if (this._effectLimit <= 5) {
            slotContentView = level1View;
        } else if (this._effectLimit <= 9) {
            slotContentView = level2View;
        } else {
            slotContentView = level3View;
        }

        this._currentSlotViews = [];
        if (slotContentView != null) {
            slotContentView.active = true;
            for (const child of slotContentView.children) {
                this._currentSlotViews.push(child);
            }
        }

        NotificationMgr.addListener(NotificationName.ARTIFACT_EQUIP_DID_CHANGE, this._refreshUI, this);
    }
    protected viewDidStart(): void {
        super.viewDidStart();

        this._refreshUI();
    }
    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.ARTIFACT_EQUIP_DID_CHANGE, this._refreshUI, this);
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByName("__ViewContent");
    }

    private _refreshUI() {
        if (this._currentSlotViews.length <= 0) {
            return;
        }

        const effectData = DataMgr.s.artifact.getAllEffectiveEffect(DataMgr.s.userInfo.data.level);
        this._effectContent.destroyAllChildren();
        effectData.forEach((value: number, key: GameExtraEffectType) => {
            const effectItem = instantiate(this._effectView);
            effectItem.setParent(this._effectContent);
            effectItem.getChildByPath("Effect").getComponent(Label).string = GameMgr.getEffectShowText(key, value);
        });
        this._effectContent.getComponent(Layout).updateLayout();

        const artifacts = DataMgr.s.artifact.getObj_artifact_equiped();

        for (const item of this._effectItemViews) {
            item.destroy();
        }
        this._effectItemViews = [];

        for (let i = 0; i < this._currentSlotViews.length; i++) {
            const locked: boolean = !(i < this._effectLimit);
            let data: ArtifactData = null;
            for (const temp of artifacts) {
                if (i == temp.effectIndex) {
                    data = temp;
                    break;
                }
            }
            const itemView = this._currentSlotViews[i];
            //is main
            itemView.getChildByPath("Main").active = i == 0 || i == 5 || i == 9;
            //is locked
            itemView.getChildByPath("Lock").active = locked;

            itemView.getComponent(Button).clickEvents[0].customEventData = i.toString();
            itemView.getComponent(Button).interactable = !locked;

            itemView.getComponent(ArtifactItem).refreshUI(data);
        }
    }

    //------------------------------------------------------------ action
    private async onTapClose() {
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel(this.node);
    }
    private async onTapItem(event: Event, customEventData: string) {
        const index = parseInt(customEventData);
        const result = await UIPanelManger.inst.pushPanel(UIName.RelicSelectUI);
        if (!result.success) {
            return;
        }
        result.node.getComponent(RelicSelectUI).configuration(index);
    }
}
