import {
    _decorator,
    Component,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    Vec3,
    Button,
    EventHandler,
    v2,
    Vec2,
    Prefab,
    Slider,
    instantiate,
    RichText,
    randomRangeInt,
    Layout,
    Color,
} from "cc";
import { GameRankColor, GetPropRankColor, ResourceCorrespondingItem } from "../Const/ConstDefine";
import { ArtifactItem } from "./ArtifactItem";
import { ArtifactMgr, ItemMgr, LanMgr } from "../Utils/Global";
import ArtifactData from "../Model/ArtifactData";
import ViewController from "../BasicView/ViewController";
import { UIName } from "../Const/ConstUIDefine";
import { ArtifactInfoUI } from "./ArtifactInfoUI";
import { UIHUDController } from "./UIHUDController";
import ArtifactConfig from "../Config/ArtifactConfig";
import ArtifactEffectConfig from "../Config/ArtifactEffectConfig";
import DropConfig from "../Config/DropConfig";
import { DropConfigData } from "../Const/Drop";
import ItemData, { ItemConfigType } from "../Const/Item";
import UIPanelManger, { UIPanelLayerType } from "../Basic/UIPanelMgr";
import { DataMgr } from "../Data/DataMgr";
import { s2c_user, share } from "../Net/msg/WebsocketMsg";
import { NetworkMgr } from "../Net/NetworkMgr";
import GameMusicPlayMgr from "../Manger/GameMusicPlayMgr";
const { ccclass, property } = _decorator;

@ccclass("ItemSelectFromThreeUI")
export class ItemSelectFromThreeUI extends ViewController {
    private _boxIndex: number;

    private _itemView: Node = null;

    public async showItem(boxIndex: number, threes: share.Iartifact_three_conf[]) {
        this.node.getChildByPath("__ViewContent/Title").getComponent(Label).string = LanMgr.getLanById("200004");
        // useLanMgr
        // this.node.getChildByPath("__ViewContent/GetAllBtn/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        if (threes.length != 3) {
            UIPanelManger.inst.popPanel(this.node);
            return;
        }
        this._boxIndex = boxIndex;
        const content = this.node.getChildByPath("__ViewContent/ImgTextBg/SelectContent").getComponent(Layout);
        for (let i = 0; i < threes.length; i++) {
            const config = ArtifactConfig.getById(threes[i].propId);
            if (config == null) {
                continue;
            }
            let useColor: Color = GameRankColor[config.rank - 1];
            let useTitle: string = null;
            if (config.rank == 1) {
                useTitle = LanMgr.getLanById("105001");
            } else if (config.rank == 2) {
                useTitle = LanMgr.getLanById("105002");
            } else if (config.rank == 3) {
                useTitle = LanMgr.getLanById("105003");
            } else if (config.rank == 4) {
                useTitle = LanMgr.getLanById("105004");
            } else if (config.rank == 5) {
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
            tempView.getChildByName("ArtifactItem").getComponent(ArtifactItem).refreshUI(new ArtifactData(threes[i].propId, 1));

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
        }
        content.updateLayout();
    }

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._itemView = this.node.getChildByPath("__ViewContent/ImgTextBg/SelectContent/Item");
        this._itemView.active = false;
    }
    protected viewPopAnimation(): boolean {
        return true;
    }
    protected contentView(): Node {
        return this.node.getChildByPath("__ViewContent");
    }

    //---------------------------------------------------- action
    private async onTapClose() {
        GameMusicPlayMgr.playTapButtonEffect();
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel(this.node);
    }

    private async onTapGet(event: Event, customEventData: string) {
        GameMusicPlayMgr.playTapButtonEffect();
        const index: number = parseInt(customEventData);
        NetworkMgr.websocketMsg.player_worldbox_open_select_artifact({
            boxIndex: this._boxIndex,
            artifactIndex: index,
        });
        await this.playExitAnimation();
        UIPanelManger.inst.popPanel(this.node);
    }

    private async onTapGetAll() {
        GameMusicPlayMgr.playTapButtonEffect();
        const energyNum: number = DataMgr.s.item.getObj_item_count(ResourceCorrespondingItem.Energy);
        const needNum: number = 200;
        if (energyNum >= needNum) {
            NetworkMgr.websocketMsg.player_worldbox_open_select_artifact({
                boxIndex: this._boxIndex,
                artifactIndex: -1,
            });
            await this.playExitAnimation();
            UIPanelManger.inst.popPanel(this.node, UIPanelLayerType.UI);
        } else {
            // useLanMgr
            // UIHUDController.showCenterTip(LanMgr.getLanById("201004"));
            UIHUDController.showCenterTip("Insufficient resources for get all");
        }
    }
}
