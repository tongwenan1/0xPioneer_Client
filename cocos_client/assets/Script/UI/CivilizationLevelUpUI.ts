import { _decorator, Component, instantiate, Label, Layout, Node, Sprite } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import { EventName, ItemConfigType } from '../Const/ConstDefine';
import EventMgr from '../Manger/EventMgr';
import LanMgr from '../Manger/LanMgr';
import ItemMgr from '../Manger/ItemMgr';
import { BackpackItem } from './BackpackItem';
import ItemData from '../Model/ItemData';
import { ArtifactItem } from './ArtifactItem';
import ArtifactData from '../Model/ArtifactData';
const { ccclass, property } = _decorator;

@ccclass('CivilizationLevelUpUI')
export class CivilizationLevelUpUI extends PopUpUI {

    private _rewardItem: Node = null;
    private _artifactItem: Node = null;
    private _showRewardItems: Node[] = [];
    private _showArtifactItems: Node[] = [];
    onLoad(): void {
        this._rewardItem = this.node.getChildByPath("Content/RewardContent/Rewards/Content/BackpackItem");
        this._rewardItem.active = false;

        this._artifactItem = this.node.getChildByPath("Content/RewardContent/Rewards/Content/ArtifactItem");
        this._artifactItem.active = false;

        EventMgr.on(EventName.CHANGE_LANG, this.refreshUI, this);
    }

    onDestroy(): void {
        EventMgr.off(EventName.CHANGE_LANG, this.refreshUI, this);
    }

    public async refreshUI(levelConfig: any) {
        if (levelConfig == null) {
            return;
        }

        const contentView = this.node.getChildByName("Content");
        // useLanMgr
        // contentView.getChildByName("Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/CityVersion").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/EventUpdate").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/ResGetRateUp").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/GetHpMax").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/Rewards/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");


        // level 
        contentView.getChildByPath("Level/Before").getComponent(Label).string = "C.LV" + (levelConfig.id - 1);
        contentView.getChildByPath("Level/After").getComponent(Label).string = "C.LV" + levelConfig.id;

        // reward
        const content = contentView.getChildByName("RewardContent");
        content.getChildByName("CityFeature").active = levelConfig.city_feature != null && levelConfig.city_feature == 1;
        // useLanMgr
        // content.getChildByPath("CityFeature/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        content.getChildByName("CityVersion").active = levelConfig.city_vision != null && levelConfig.city_vision > 0;
        // useLanMgr
        // content.getChildByPath("CityVersion/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        content.getChildByName("EventUpdate").active = levelConfig.event_building != null;
        // useLanMgr
        // content.getChildByPath("EventUpdate/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        if (levelConfig.extra_res != null && levelConfig.extra_res > 0) {
            content.getChildByName("ResGetRateUp").active = true;
            // useLanMgr
            // content.getChildByPath("ResGetRateUp/Content/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
            content.getChildByPath("ResGetRateUp/Value").getComponent(Label).string = "+" + (levelConfig.extra_res * 100) + "%!";
        } else {
            content.getChildByName("ResGetRateUp").active = false;
        }

        if (levelConfig.hp_max != null && levelConfig.hp_max > 0) {
            content.getChildByName("GetHpMax").active = true;
            // useLanMgr
            // content.getChildByPath("GetHpMax/Content/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
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

    start() {

    }

    update(deltaTime: number) {

    }

    private onTapClose() {
        this.show(false);
    }
}


