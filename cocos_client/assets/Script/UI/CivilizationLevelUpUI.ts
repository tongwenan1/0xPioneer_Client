import { _decorator, Component, instantiate, Label, Layout, Node, Sprite } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import { EventName } from '../Const/ConstDefine';
import EventMgr from '../Manger/EventMgr';
import LanMgr from '../Manger/LanMgr';
import { BackpackItem } from './BackpackItem';
import ItemMgr from '../Manger/ItemMgr';
const { ccclass, property } = _decorator;

@ccclass('CivilizationLevelUpUI')
export class CivilizationLevelUpUI extends PopUpUI {

    private _rewardItem: Node = null;

    private _showRewardItems: Node[] = [];
    onLoad(): void {
        this._rewardItem = this.node.getChildByPath("Content/RewardContent/Rewards/Content/Item")
        this._rewardItem.active = false;
        EventMgr.on(EventName.CHANGE_LANG, this.refreshUI, this);
    }

    onDestroy(): void {
        EventMgr.off(EventName.CHANGE_LANG, this.refreshUI, this);
    }

    public async refreshUI(levelConfig: any) {
        if (levelConfig == null) {
            return;
        }

        // useLanMgr
        // this.node.getChildByPath("Content/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/LevelChanged").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/CityFeature").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/CityVersion").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/EventUpdate").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/ResGetRateUp").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/GetHpMax").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this.node.getChildByPath("Content/RewardContent/Rewards/Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        // title
        this.node.getChildByPath("Content/LevelChanged").getComponent(Label).string = "Lv " + (levelConfig.id - 1) + "  >  Lv " + levelConfig.id;

        const content = this.node.getChildByPath("Content/RewardContent");
        content.getChildByName("CityFeature").active = levelConfig.city_feature != null && levelConfig.city_feature == 1;

        content.getChildByName("CityVersion").active = levelConfig.city_vision != null && levelConfig.city_vision > 0;

        content.getChildByName("EventUpdate").active = levelConfig.event != null;

        if (levelConfig.extra_res != null && levelConfig.extra_res > 0) {
            content.getChildByName("ResGetRateUp").active = true;
            content.getChildByName("ResGetRateUp").getComponent(Label).string = "> Resources Gained + " + levelConfig.extra_res * 100 + "%!";
        } else {
            content.getChildByName("ResGetRateUp").active = false;
        }
        
        if (levelConfig.hp_max != null && levelConfig.hp_max > 0) {
            content.getChildByName("GetHpMax").active = true;
            content.getChildByName("GetHpMax").getComponent(Label).string = "> HP Max + " + levelConfig.hp_max + "!";
        } else {
            content.getChildByName("GetHpMax").active = false;
        }

        if (levelConfig.reward != null && levelConfig.reward.length > 0) {
            content.getChildByName("Rewards").active = true;
            for (const item of this._showRewardItems) {
                item.destroy();
            }
            this._showRewardItems = [];
            for (const data of levelConfig.reward) {
                if (data.length == 3) {
                    const type = data[0];
                    const id = parseInt(data[1]);
                    const num = data[2];
                    const view = instantiate(this._rewardItem);
                    view.active = true;
                    view.getChildByName("Icon").getComponent(Sprite).spriteFrame = await BackpackItem.getItemIcon(ItemMgr.Instance.getItemConf(id).icon);
                    view.getChildByName("Num").getComponent(Label).string = "x" + num;
                    view.setParent(content.getChildByPath("Rewards/Content"));
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


