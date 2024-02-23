import { _decorator, Component, Node, Button, SpriteFrame, Sprite, Label, ToggleContainer, ScrollView, log, instantiate, ProgressBar, ShadowsInfo } from 'cc';
import EventMgr from '../../Manger/EventMgr';
import { EventName } from '../../Basic/ConstDefine';
import { UserInnerBuildInfo } from '../../Manger/UserInfoMgr';
import InnerBuildingMgr from '../../Manger/InnerBuildingMgr';
import { PopUpUI } from '../../BasicView/PopUpUI';

const { ccclass, property } = _decorator;

@ccclass('FactoryInfoUI')
export class FactoryInfoUI extends PopUpUI {
    public override get typeName() {
        return "FactoryInfoUI";
    }

    @property(Label)
    txtTitle: Label = null;

    @property(Label)
    txtUpgradeTime: Label = null;

    @property(Button)
    btnUpgrade: Button = null;

    @property(Label)
    btnUpgradeTxt: Label = null;

    @property(Node)
    upEffLayout: Node = null;

    @property(Node)
    upConditionLayout: Node = null;

    @property(Node)
    upgradeConstLayout: Node = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Node)
    progressNode: Node = null;

    private _data: UserInnerBuildInfo;

    start() {

    }

    public get canUpgrade() {
        return true;
    }

    converTimeStr(second) {
        let hour = Math.floor(second / 3600);
        let min = Math.floor((second - hour * 3600) / 60);
        let sec = second - hour * 3600 - min * 60;
        return hour + ':' + min + ':' + sec;
    }

    refreshUI(data: UserInnerBuildInfo) {
        log('initUI ', data);
        this._data = data;

        this.txtTitle.string = data.buildName;

        const buildingInfo = InnerBuildingMgr.Instance.getInfoById(data.buildID);
        if (data.buildLevel < buildingInfo.maxLevel) {
            this.btnUpgrade.node.active = true;
            if (data.buildLevel == 0) {
                this.btnUpgradeTxt.string = "Unlock";
                this.progressNode.active = false;
            } else {
                this.btnUpgradeTxt.string = "Upgrade";
                this.progressNode.active = true;
            }
        } else {
            this.btnUpgrade.node.active = false;
        }

        // this._outTime = up_cfg.outTime;
        // this._useItemArr = [];
        // this._outputItemArr = [];

        // for (let i = 0; i < up_cfg.useItem.length / 2; i++) {
        //     let item_id = up_cfg.useItem[i];
        //     let item_count = up_cfg.useItem[i + 1];
        //     this._useItemArr.push(new ItemData(item_id, item_count));
        // }

        // for (let i = 0; i < up_cfg.outItem.length / 2; i++) {
        //     let item_id = up_cfg.outItem[i];
        //     let item_count = up_cfg.outItem[i + 1];
        //     this._outputItemArr.push(new ItemData(item_id, item_count));
        // }


        // this.txtTitle.string = up_cfg.buildName;
        // this.txtUpgradeTime.string = 'Time required: ' +this.converTimeStr(up_cfg.upgradeTime);
        this.txtUpgradeTime.node.active = false;

        // refresh upgrade effect
        // for (let i = 0; i < up_cfg.upgradeEffectArr.length; i++) {
        //     let item = this.upEffLayout.children[i];
        //     if (!item) {
        //         item = instantiate(this.upEffLayout.children[0]);
        //         item.setParent(this.upEffLayout);
        //     }

        //     let desc = item.getComponent(Label);
        //     desc.string = up_cfg.upgradeEffectArr[i];
        // }
        // for (let i = up_cfg.upgradeEffectArr.length; i < this.upEffLayout.children.length; i++) {
        //     this.upEffLayout.children[i].active = false;
        // }

        // // refresh upgrade condition
        // for (let i = 0; i < up_cfg.upgradeConditionArr.length; i++) {
        //     let item = this.upConditionLayout.children[i];
        //     if (!item) {
        //         item = instantiate(this.upConditionLayout.children[0]);
        //         item.setParent(this.upConditionLayout);
        //     }

        //     let desc = item.getComponent(Label);
        //     desc.string = up_cfg.upgradeConditionArr[i];
        // }
        // for (let i = up_cfg.upgradeConditionArr.length; i < this.upConditionLayout.children.length; i++) {
        //     this.upConditionLayout.children[i].active = false;
        // }

        // // refresh upgrade cos
        // for (let i = 0; i < up_cfg.upgradeCostArr.length / 2; i++) {
        //     let item = this.upgradeConstLayout.children[i];
        //     if (!item) {
        //         item = instantiate(this.upgradeConstLayout.children[0]);
        //         item.setParent(this.upgradeConstLayout);
        //     }
        //     let item_id = up_cfg.upgradeCostArr[i];
        //     let item_count = up_cfg.upgradeCostArr[i + 1];
        //     let desc = item.getChildByName('title').getComponent(Label);
        //     desc.string = `${0}/${item_count}`;
        // }
        // for (let i = up_cfg.upgradeCostArr.length / 2; i < this.upgradeConstLayout.children.length; i++) {
        //     this.upgradeConstLayout.children[i].active = false;
        // }

    }

    closeClick() {
        this.show(false);
    }

    onUpgradeClick() {
        EventMgr.emit(EventName.BUILD_LEVEL_UP, this._data.buildID);
        this.show(false);
    }


    private factoryItemChange() {
        
    }

    private _outTime = 0;

    update(deltaTime: number) {
        this.progressBar.progress += deltaTime * (1 / this._outTime);
        if (this.progressBar.progress >= 1) {
            this.factoryItemChange();
            this.progressBar.progress = 0;
        }
    }
}


