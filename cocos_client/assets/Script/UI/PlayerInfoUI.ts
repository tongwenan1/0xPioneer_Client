import { _decorator, Button, Color, Component, EditBox, instantiate, Label, Layout, Node, ScrollView, Slider, Sprite, UITransform, Vec3 } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import UserInfoMgr from '../Manger/UserInfoMgr';
import LvlupMgr from '../Manger/LvlupMgr';
import { GameMain } from '../GameMain';
import { BackpackItem } from './BackpackItem';
import ItemMgr from '../Manger/ItemMgr';
import { AudioMgr } from '../Basic/AudioMgr';
import LanMgr from '../Manger/LanMgr';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Const/ConstDefine';
const { ccclass, property } = _decorator;

class SettlementStage {
    level: number;
    stats: string;
    evaluation: string;

    constructor(level: number, stats: string, evaluation: string) {
        this.level = level;
        this.stats = stats;
        this.evaluation = evaluation;
    }
}

@ccclass('PlayerInfoUI')
export class PlayerInfoUI extends PopUpUI {
    
    private _selectIndex: number = 0;
    private _selectLang: string = "eng";

    private _tabViews: Node[] = [];
    private _tabButtons: Node[] = [];
    private _changeNameView: Node = null;
    private _nextLevelView: Node = null;
    private _langSelectView: Node = null;
    private _rewardItem: Node = null;
    private _showRewardItems: Node[] = [];

    onLoad(): void {
        this._selectIndex = 0;

        const infoView = this.node.getChildByPath("Content/tabContents/InfoContent");
        const summaryView = this.node.getChildByPath("Content/tabContents/SummaryContent");
        const achievementView = this.node.getChildByPath("Content/tabContents/AchievementContent");
        const settingView = this.node.getChildByPath("Content/tabContents/SettingsContent");
        achievementView.active = false;

        this._tabViews = [infoView, summaryView, settingView];

        const infoBtn = this.node.getChildByPath("Content/tabButtons/InfoBtn");
        const summaryBtn = this.node.getChildByPath("Content/tabButtons/SummaryBtn");
        const achievementBtn = this.node.getChildByPath("Content/tabButtons/AchievementsBtn");
        const settingBtn = this.node.getChildByPath("Content/tabButtons/SettingsBtn");
        achievementBtn.active = false;

        this._tabButtons = [infoBtn, summaryBtn, settingBtn];

        for (let i = 0; i < this._tabButtons.length; i++) {
            this._tabButtons[i].getComponent(Button).clickEvents[0].customEventData = i.toString();
        }

        this._changeNameView = this.node.getChildByName("ChangeNameContent");
        this._changeNameView.active = false;

        this._nextLevelView = this.node.getChildByName("NextLevelContent");
        this._rewardItem = this._nextLevelView.getChildByPath("NextLevelInfo/RewardContent/Rewards/Content/Item")
        this._rewardItem.active = false;
        this._nextLevelView.active = false;
    
        this._langSelectView = this.node.getChildByName("OptionContainer");
        this._langSelectView.active = false;

        EventMgr.on(EventName.LOADING_FINISH, this._loadOver, this);
    }

    start() {
        // this.settlementStages = [
        //     new SettlementStage(1, "Stats1", "Good"),
        //     new SettlementStage(2, "Stats2", "Excellent"),
        // ];

        // this.populateList();
        // this.populateContent(0);

        // this.musicVolumeSlider?.node.on('slide', this.onMusicVolumeChange, this);
        // this.sfxVolumeSlider?.node.on('slide', this.onSfxVolumeChange, this);

        // this.LanguageBtn.node.on(Node.EventType.TOUCH_END, this.toggleDropdown, this);
        // this.optionBtns.forEach((button, index) => {
        //     button.node.on(Node.EventType.TOUCH_END, () => {
        //         this.onOptionSelected(index);
        //     }, this);
        // });
    }

    update(deltaTime: number) {

    }

    private _loadOver() {
        this._selectLang = LanMgr.Instance.getLang();
        this._refreshUI();
    }

    private _refreshUI() {
        for (let i = 0; i < this._tabViews.length; i++) {
            this._tabViews[i].active = i == this._selectIndex;
            this._tabButtons[i].getComponent(Sprite).grayscale = (i != this._selectIndex);
        }

        const currentShowView = this._tabViews[this._selectIndex];
        if (this._selectIndex == 0) {
            // info
            const currentLevel = UserInfoMgr.Instance.level;

            currentShowView.getChildByName("UserID").getComponent(Label).string = "ID:" + UserInfoMgr.Instance.playerID;
            currentShowView.getChildByName("UserName").getComponent(Label).string = "Name:" + UserInfoMgr.Instance.playerName;
            currentShowView.getChildByName("UserLCivilizationLv").getComponent(Label).string = "Civilization Level  " + currentLevel;

            currentShowView.getChildByPath("RewardContent/CityVersion").getComponent(Label).string = "> City Vision Expand + " + LvlupMgr.Instance.getTotalVisionByLvl(currentLevel);
            currentShowView.getChildByPath("RewardContent/ResGetRateUp").getComponent(Label).string = "> Resources Gained + " + LvlupMgr.Instance.getTotalExtraRateByLvl(currentLevel) * 100 + "%";
            currentShowView.getChildByPath("RewardContent/GetHpMax").getComponent(Label).string = "> HP Max + " + LvlupMgr.Instance.getTotalHpMaxByLvl(currentLevel);

        } else if (this._selectIndex == 1) {
            // summary

        } else if (this._selectIndex == 2) {
            // setting
            const bgmSlider = currentShowView.getChildByName("musicVolumeSlider").getComponent(Slider);
            bgmSlider.progress = AudioMgr.instance.musicVolume;

            const effectSlider = currentShowView.getChildByName("sfxVolumeSlider").getComponent(Slider);
            effectSlider.progress = AudioMgr.instance.effectVolume;

            const lang = new Map();
            lang.set("eng", "English");
            lang.set("cn", "Chinese");
            currentShowView.getChildByPath("LanguageMenu/LanguageBtn/Label").getComponent(Label).string = lang.get(this._selectLang);

        } else if (this._selectIndex == 3) {
            // xx reversed   
        }
    }

    private async _refreshNextLevelView() {
        const nextLevel = UserInfoMgr.Instance.level + 1;
        this._nextLevelView.getChildByPath("NextLevelInfo/NextLevel").getComponent(Label).string = "Civilization Level  " + nextLevel;

        const rewardView = this._nextLevelView.getChildByPath("NextLevelInfo/RewardContent");
        const maxTip = this._nextLevelView.getChildByPath("NextLevelInfo/MaxTip");
        const nextLvConfig = LvlupMgr.Instance.getConfigByLvl(nextLevel);
        if (nextLvConfig.length > 0) {
            const levelConfig = nextLvConfig[0];

            rewardView.active = true;
            const content = rewardView;
            content.getChildByName("CityVersion").active = levelConfig.city_vision != null && levelConfig.city_vision > 0;
            content.getChildByName("CityVersion").getComponent(Label).string = "> City Vision Expand + " + levelConfig.city_vision;

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

            maxTip.active = false;
        } else {
            rewardView.active = false;
            maxTip.active = true;
        }
    }

   

    onDestroy() {
       
    }

    getLevelInfo(level: number) {
    }

    populateContent(index: number) {
        // if (index < 0 || index >= this.settlementStages.length) {
        //     console.warn("Index out of bounds");
        //     return;
        // }

        // this.contentScrollView.content.removeAllChildren();

        // let stage = this.settlementStages[index];
        // let dataPoints = stage.stats.split(",");

        // let startPositionY = 0;
        // const gap = 40;
        // dataPoints.forEach(dataPoint => {
        //     let detailItem = new Node("DetailItem");
        //     detailItem.setPosition(0, -20, 0);
        //     let label = detailItem.addComponent(Label);
        //     label.string = `Data: ${dataPoint}`;
        //     label.color = new Color(0, 0, 0);

        //     let uiTransform = detailItem.addComponent(UITransform);
        //     uiTransform.setContentSize(100, 30);
        //     uiTransform.setAnchorPoint(1, 1);

        //     detailItem.setPosition(new Vec3(0, startPositionY, 0));

        //     this.contentScrollView.content.addChild(detailItem);

        //     startPositionY -= gap;
        // });
    }

    populateList() {
        let startPositionY = 0;
        const gap = 40;
        // this.settlementStages.forEach((stage, index) => {
        //     let listItem = new Node("ListItem");
        //     let label = listItem.addComponent(Label);
        //     label.string = `Level: ${stage.level}`;
        //     label.color = new Color(0, 0, 0);

        //     let uiTransform = listItem.addComponent(UITransform);
        //     uiTransform.setContentSize(80, 30);
        //     uiTransform.setAnchorPoint(1, 1);

        //     listItem.on(Node.EventType.TOUCH_END, () => {
        //         this.populateContent(index);
        //     }, this);

        //     listItem.setPosition(new Vec3(0, startPositionY, 0));

        //     this.listScrollView.content.addChild(listItem);
        //     startPositionY -= gap;
        // });
    }


    private onTapTab(event: Event, customEventData: string) {
        const index = parseInt(customEventData);
        if (this._selectIndex == index) {
            return;
        }
        this._selectIndex = index;
        this._refreshUI();
    }
    //-----------------------------------
    // info
    private onTapChangeNameShow() {
        this._changeNameView.active = true;
        this._changeNameView.getChildByPath("Content/UserName").getComponent(EditBox).string = "";
    }
    private onTapChangeNameClose() {
        this._changeNameView.active = false;
    }
    private onTapChangeNameConfirm() {
        const changedName: string = this._changeNameView.getChildByPath("Content/UserName").getComponent(EditBox).string;
        if (changedName.length <= 0) {
            GameMain.inst.UI.ShowTip("Name cannot be empty");
            return;
        }
        UserInfoMgr.Instance.playerName = changedName;
        this._refreshUI();
        this._changeNameView.active = false;
    }
    private onTapNextLevelShow() {
        this._nextLevelView.active = true;
        this._refreshNextLevelView();
    }
    private onTapNextLevelClose() {
        this._nextLevelView.active = false;
    }
    //-----------------------------------
    // setting
    private onBgmVolumeChanged() {
        const bgmSlider = this.node.getChildByPath("Content/tabContents/SettingsContent/musicVolumeSlider").getComponent(Slider);
        AudioMgr.instance.changeMusicVolume(bgmSlider.progress);
        this._refreshUI();
    }
    private onEffectVolumeChanged() {
        const effectSlider = this.node.getChildByPath("Content/tabContents/SettingsContent/sfxVolumeSlider").getComponent(Slider);
        AudioMgr.instance.changeEffectVolume(effectSlider.progress);
        this._refreshUI();
    }
    private onTapLangSelectShow() {
        this._langSelectView.active = true;
    }
    private onTapLangItem(event: Event, customEventData: string) {
        this._selectLang = customEventData;
        LanMgr.Instance.changeLang(this._selectLang);
        this._refreshUI();
        this._langSelectView.active = false;
    }
    private onTapLangSelectClose() {
        this._langSelectView.active = false;
    }


    private onTapClose() {
        this.show(false);
    }
}


