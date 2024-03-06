import { _decorator, Component, Label, Node } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import { EventName } from '../Const/ConstDefine';
import EventMgr from '../Manger/EventMgr';
import LanMgr from '../Manger/LanMgr';
const { ccclass, property } = _decorator;

@ccclass('CivilizationLevelUpUI')
export class CivilizationLevelUpUI extends PopUpUI {

    onLoad(): void {
        EventMgr.on(EventName.CHANGE_LANG, this.refreshUI, this);
    }

    onDestroy(): void {
        EventMgr.off(EventName.CHANGE_LANG, this.refreshUI, this);
    }

    public refreshUI(levelConfig: any) {
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


