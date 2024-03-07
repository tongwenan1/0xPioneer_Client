import { _decorator, Button, Color, Component, instantiate, Label, Node, ScrollView, Slider, UITransform, Vec3 } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
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
    @property([Node])
    tabContents: Node[] = [];

    @property([Node])
    tabButtons: Node[] = [];

    @property(Button)
    nextLevelNode: Button = null;

    @property(Node)
    nextLevelPageNode: Node = null;

    @property(ScrollView)
    contentScrollView: ScrollView = null;

    @property(ScrollView)
    listScrollView: ScrollView = null;

    @property(Slider)
    musicVolumeSlider: Slider = null;

    @property(Label)
    musicVolumeLabel: Label = null;

    @property(Slider)
    sfxVolumeSlider: Slider = null;

    @property(Label)
    sfxVolumeLabel: Label = null;

    private settlementStages: SettlementStage[] = [];

    @property(Node)
    optionsContainer: Node = null;

    @property(Button)
    LanguageBtn: Button = null;

    @property([Button])
    optionBtns: Button[] = [];

    start() {
        this.setupTabs();

        this.nextLevelNode.node.on(Node.EventType.TOUCH_END, this.onNextLevelClicked, this);

        this.settlementStages = [
            new SettlementStage(1, "Stats1", "Good"),
            new SettlementStage(2, "Stats2", "Excellent"),
        ];

        this.populateList();
        this.populateContent(0);

        this.musicVolumeSlider?.node.on('slide', this.onMusicVolumeChange, this);
        this.sfxVolumeSlider?.node.on('slide', this.onSfxVolumeChange, this);

        this.LanguageBtn.node.on(Node.EventType.TOUCH_END, this.toggleDropdown, this);
        this.optionBtns.forEach((button, index) => {
            button.node.on(Node.EventType.TOUCH_END, () => {
                this.onOptionSelected(index);
            }, this);
        });
    }

    update(deltaTime: number) {

    }

    setupTabs() {
        this.showTab(0);

        this.tabButtons.forEach((buttonNode, index) => {
            let button = buttonNode.getComponent(Button);
            if (button) {
                button.node.on(Button.EventType.CLICK, () => {
                    this.showTab(index);
                }, this);
            }
        });
    }

    showTab(index: number) {
        this.tabContents.forEach((content, i) => {
            content.active = i === index;
        });
    }

    onNextLevelClicked() {
        if (this.nextLevelPageNode) {
            this.nextLevelPageNode.active = !this.nextLevelPageNode.active;
        }
    }

    onDestroy() {
        this.nextLevelNode.node.off(Node.EventType.TOUCH_END, this.onNextLevelClicked, this);
    }

    getLevelInfo(level: number) {
    }

    populateContent(index: number) {
        if (index < 0 || index >= this.settlementStages.length) {
            console.warn("Index out of bounds");
            return;
        }

        this.contentScrollView.content.removeAllChildren();

        let stage = this.settlementStages[index];
        let dataPoints = stage.stats.split(",");

        let startPositionY = 0;
        const gap = 40;
        dataPoints.forEach(dataPoint => {
            let detailItem = new Node("DetailItem");
            detailItem.setPosition(0, -20, 0);
            let label = detailItem.addComponent(Label);
            label.string = `Data: ${dataPoint}`;
            label.color = new Color(0, 0, 0);

            let uiTransform = detailItem.addComponent(UITransform);
            uiTransform.setContentSize(100, 30);
            uiTransform.setAnchorPoint(1, 1);

            detailItem.setPosition(new Vec3(0, startPositionY, 0));

            this.contentScrollView.content.addChild(detailItem);

            startPositionY -= gap;
        });
    }

    populateList() {
        let startPositionY = 0;
        const gap = 40;
        this.settlementStages.forEach((stage, index) => {
            let listItem = new Node("ListItem");
            let label = listItem.addComponent(Label);
            label.string = `Level: ${stage.level}`;
            label.color = new Color(0, 0, 0);

            let uiTransform = listItem.addComponent(UITransform);
            uiTransform.setContentSize(80, 30);
            uiTransform.setAnchorPoint(1, 1);

            listItem.on(Node.EventType.TOUCH_END, () => {
                this.populateContent(index);
            }, this);

            listItem.setPosition(new Vec3(0, startPositionY, 0));

            this.listScrollView.content.addChild(listItem);
            startPositionY -= gap;
        });
    }

    onMusicVolumeChange() {
        const volume = this.musicVolumeSlider.progress;
        this.musicVolumeLabel.string = `${Math.round(volume * 100)}%`;
    }

    onSfxVolumeChange() {
        const volume = this.sfxVolumeSlider.progress;
        this.sfxVolumeLabel.string = `${Math.round(volume * 100)}%`;
    }

    toggleDropdown() {
        this.optionsContainer.active = !this.optionsContainer.active;
    }

    onOptionSelected(index: number) {
        console.log(`Option ${index} selected`);
        this.optionsContainer.active = false;
    }
}


