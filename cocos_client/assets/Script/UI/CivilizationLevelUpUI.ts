import { _decorator, Animation, Button, Component, instantiate, Label, Layout, Node, Sprite, tween, v3 } from 'cc';
import { EventName, ItemConfigType } from '../Const/ConstDefine';
import { BackpackItem } from './BackpackItem';
import ItemData from '../Model/ItemData';
import { ArtifactItem } from './ArtifactItem';
import ArtifactData from '../Model/ArtifactData';
import { GameMain } from '../GameMain';
import { EventMgr, LanMgr, UIPanelMgr, UserInfoMgr } from '../Utils/Global';
import { UIName } from '../Const/ConstUIDefine';
import { SecretGuardGettedUI } from './Outer/SecretGuardGettedUI';
import ViewController from '../BasicView/ViewController';
import { ItemInfoUI } from './ItemInfoUI';
import { ArtifactInfoUI } from './ArtifactInfoUI';
const { ccclass, property } = _decorator;

@ccclass('CivilizationLevelUpUI')
export class CivilizationLevelUpUI extends ViewController {

    private _rewardItem: Node = null;
    private _artifactItem: Node = null;
    private _showRewardItems: Node[] = [];
    private _showArtifactItems: Node[] = [];

    private _buildAnimView: Node = null;
    private _finishAnimView: Node = null;
    private _finishLightAnimView: Node = null;

    private _showBuildAnimView: Node = null;
    private _showFinishAnimView: Node = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._rewardItem = this.node.getChildByPath("Content/RewardContent/Rewards/Content/BackpackItem");
        this._rewardItem.active = false;

        this._artifactItem = this.node.getChildByPath("Content/RewardContent/Rewards/Content/ArtifactItem");
        this._artifactItem.active = false;

        this._buildAnimView = this.node.getChildByPath("Content/Video/Mask/Build");
        this._buildAnimView.active = false;

        this._finishAnimView = this.node.getChildByPath("Content/Video/Mask/Finish");
        this._finishAnimView.active = false;

        this._finishLightAnimView = this.node.getChildByPath("Content/Video/Mask/FinishLight");
        this._finishLightAnimView.active = false;

        EventMgr.on(EventName.CHANGE_LANG, this.refreshUI, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        EventMgr.off(EventName.CHANGE_LANG, this.refreshUI, this);
    }


    public async refreshUI(levelConfig: any) {
        if (levelConfig == null) {
            return;
        }

        const contentView = this.node.getChildByName("Content");
        // useLanMgr
        // contentView.getChildByName("Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/CityVersion").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/EventUpdate").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/ResGetRateUp").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/GetHpMax").getComponent(Label).string = LanMgr.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/Rewards/Title").getComponent(Label).string = LanMgr.getLanById("107549");


        // anim
        if (this._showBuildAnimView != null) {
            this._showBuildAnimView.destroy();
        }
        if (this._showFinishAnimView != null) {
            this._showFinishAnimView.destroy();
        }
        this._finishLightAnimView.active = false;

        this.node.getChildByName("Content").getComponent(Button).interactable = false;
        this._showBuildAnimView = instantiate(this._buildAnimView);
        this._showBuildAnimView.active = true;
        this._showBuildAnimView.position = v3(0, -166, 0);
        this._showBuildAnimView.parent = this._buildAnimView.parent;
        tween()
            .target(this._showBuildAnimView)
            .delay(1.0)
            .to(0.8, { position: v3(this._showBuildAnimView.position.x, -2400, this._showBuildAnimView.position.z) })
            .delay(2.0)
            .call(() => {
                this._showBuildAnimView.active = false;

                this._showFinishAnimView = instantiate(this._finishAnimView);
                this._showFinishAnimView.active = true;
                this._showFinishAnimView.parent = this._showBuildAnimView.parent;
                this._showFinishAnimView.position = v3(0, -166, 0);

                this._finishLightAnimView.active = true;
                this._finishLightAnimView.setSiblingIndex(99);
                this._finishLightAnimView.getChildByName("Particle_Ui_Building").getComponent(Animation).play();
                tween()
                    .target(this._finishLightAnimView)
                    .delay(1.2)
                    .call(() => {
                        this._finishLightAnimView.active = false;
                        this.node.getChildByName("Content").getComponent(Button).interactable = true;
                    })
                    .start();

                tween()
                    .target(this._showFinishAnimView)
                    .to(0.8, { position: v3(this._showFinishAnimView.position.x, -2400, this._showFinishAnimView.position.z) })
                    .start();
            })
            .start();

        // level 
        contentView.getChildByPath("Level/Before").getComponent(Label).string = "C.LV" + (levelConfig.id - 1);
        contentView.getChildByPath("Level/After").getComponent(Label).string = "C.LV" + levelConfig.id;

        // reward
        const content = contentView.getChildByName("RewardContent");
        content.getChildByName("CityFeature").active = levelConfig.city_feature != null && levelConfig.city_feature == 1;
        // useLanMgr
        // content.getChildByPath("CityFeature/Title").getComponent(Label).string = LanMgr.getLanById("107549");

        content.getChildByName("CityVersion").active = levelConfig.city_vision != null && levelConfig.city_vision > 0;
        // useLanMgr
        // content.getChildByPath("CityVersion/Title").getComponent(Label).string = LanMgr.getLanById("107549");

        content.getChildByName("EventUpdate").active = levelConfig.event_building != null;
        // useLanMgr
        // content.getChildByPath("EventUpdate/Title").getComponent(Label).string = LanMgr.getLanById("107549");

        if (levelConfig.extra_res != null && levelConfig.extra_res > 0) {
            content.getChildByName("ResGetRateUp").active = true;
            // useLanMgr
            // content.getChildByPath("ResGetRateUp/Content/Title").getComponent(Label).string = LanMgr.getLanById("107549");
            content.getChildByPath("ResGetRateUp/Value").getComponent(Label).string = "+" + (levelConfig.extra_res * 100) + "%!";
        } else {
            content.getChildByName("ResGetRateUp").active = false;
        }

        if (levelConfig.hp_max != null && levelConfig.hp_max > 0) {
            content.getChildByName("GetHpMax").active = true;
            // useLanMgr
            // content.getChildByPath("GetHpMax/Content/Title").getComponent(Label).string = LanMgr.getLanById("107549");
            content.getChildByPath("GetHpMax/Value").getComponent(Label).string = "+" + levelConfig.hp_max + "!";
        } else {
            content.getChildByName("GetHpMax").active = false;
        }

        if (levelConfig.reward != null && levelConfig.reward.length > 0) {
            content.getChildByName("Rewards").active = true;
            for (const item of [...this._showRewardItems, ...this._showArtifactItems]) {
                item.destroy();
            }
            this._showRewardItems = [];
            this._showArtifactItems = [];
            for (const data of levelConfig.reward) {
                if (data.length == 3) {
                    const type = data[0];
                    const id = data[1];
                    const num = data[2];
                    if (type == ItemConfigType.Item) {
                        const view = instantiate(this._rewardItem);
                        view.active = true;
                        view.getComponent(BackpackItem).refreshUI(new ItemData(id, num));
                        view.getChildByName("Count").getComponent(Label).string = num;
                        view.setParent(content.getChildByPath("Rewards/Content"));
                        this._showRewardItems.push(view);
                    } else if (type == ItemConfigType.Artifact) {
                        const view = instantiate(this._artifactItem);
                        view.active = true;
                        view.getComponent(ArtifactItem).refreshUI(new ArtifactData(id, num));
                        view.getChildByName("Count").getComponent(Label).string = num;
                        view.setParent(content.getChildByPath("Rewards/Content"));
                        this._showArtifactItems.push(view);
                    }
                }
            }
            content.getChildByPath("Rewards/Content").getComponent(Layout).updateLayout();
        } else {
            content.getChildByName("Rewards").active = false;
        }
    }

    private async onTapClose() {
        UIPanelMgr.removePanelByNode(this.node);
        if (UserInfoMgr.afterCivilizationClosedShowPioneerDatas.length > 0) {
            const view = await UIPanelMgr.openPanel(UIName.SecretGuardGettedUI);
            if (view != null) {
                view.getComponent(SecretGuardGettedUI).dialogShow(UserInfoMgr.afterCivilizationClosedShowPioneerDatas[0].animType);
            }
            UserInfoMgr.afterCivilizationClosedShowPioneerDatas = [];
        } else {
            if (UserInfoMgr.afterCivilizationClosedShowItemDatas.length > 0) {
                const view = await UIPanelMgr.openPanel(UIName.ItemInfoUI);
                if (view != null) {
                    view.getComponent(ItemInfoUI).showItem(UserInfoMgr.afterCivilizationClosedShowItemDatas, true);
                }
                UserInfoMgr.afterCivilizationClosedShowItemDatas = [];
            }
            if (UserInfoMgr.afterCivilizationClosedShowArtifactDatas.length > 0) {
                const view = await UIPanelMgr.openPanel(UIName.ArtifactInfoUI);
                if (view != null) {
                    view.getComponent(ArtifactInfoUI).showItem(UserInfoMgr.afterCivilizationClosedShowArtifactDatas);
                }
                UserInfoMgr.afterCivilizationClosedShowArtifactDatas = [];
            }
        }
    }
}


