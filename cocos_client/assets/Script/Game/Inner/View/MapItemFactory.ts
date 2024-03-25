import { _decorator, Component, Node, Vec2, Vec3, CCString, CCInteger, UIOpacity, log, Prefab, instantiate, Label } from 'cc';
import { MapItem } from '../../../BasicView/MapItem';
import { EventName } from '../../../Const/ConstDefine';
import { GameMain } from '../../../GameMain';
import CommonTools from '../../../Tool/CommonTools';
import { InnerBuildUI } from '../../../UI/Inner/InnerBuildUI';
import { FinishedEvent, InnerBuildingType, UserInfoEvent, UserInnerBuildInfo } from '../../../Const/Manager/UserInfoMgrDefine';
import { LanMgr, NotificationMgr, UIPanelMgr, UserInfoMgr } from '../../../Utils/Global';
import { UIName } from '../../../Const/ConstUIDefine';
import { RecruitUI } from '../../../UI/Inner/RecruitUI';
import { UIHUDController } from '../../../UI/UIHUDController';

const { ccclass, property } = _decorator;

@ccclass('MapItemFactory')
export class MapItemFactory extends MapItem implements UserInfoEvent {


    @property(CCString)
    buildID = "1";

    @property(InnerBuildUI)
    private buildInfoUI: InnerBuildUI = null;

    @property([Prefab])
    private buildPfbList: Prefab[] = [];

    private buildData: UserInnerBuildInfo = null;
    private _upgradeIng = false;

    private _showBuilding: Node = null;
    private _recruitCountTime: Label = null;
    override async _onClick() {
        super._onClick();
        if (GameMain.inst.innerSceneMap.isUpgrading(this.buildID as InnerBuildingType)) {
            // useLanMgr
            UIHUDController.showCenterTip(LanMgr.getLanById("201001"));
            // UIHUDController.showCenterTip("The building is being upgraded, please wait.");
            return;
        }
        if (this.buildData == null) {
            return;
        }
        if (this.buildData.buildID == InnerBuildingType.Barrack &&
            this.buildData.buildLevel > 0) {
            if (UserInfoMgr.isGeneratingTroop) {
                // useLanMgr
                UIHUDController.showCenterTip(LanMgr.getLanById("201002"));
                // UIHUDController.showCenterTip("Recruiting…Please wait…");
                return;
            }
            const view = await UIPanelMgr.openPanel(UIName.RecruitUI);
            if (view != null) {
                view.getComponent(RecruitUI).refreshUI(true);
            }
        }
    }

    onLoad(): void {
        if (this.node.getChildByName("RecruitTime") != null) {
            this._recruitCountTime = this.node.getChildByName("RecruitTime").getComponent(Label);
            this._recruitCountTime.node.active = false;
        }
        NotificationMgr.addListener(EventName.BUILD_BEGIN_UPGRADE, this._onBeginUpgrade, this);
    }

    start() {
        super.start();
        const innerBuildData = UserInfoMgr.innerBuilds;
        this.buildData = innerBuildData.get(this.buildID);
        this.refresh();
        UserInfoMgr.addObserver(this);
    }

    protected onEnable(): void {

    }

    update(deltaTime: number) {

    }

    protected onDestroy(): void {
        UserInfoMgr.removeObserver(this);
    }


    refresh() {
        if (this.buildData == null) {
            return;
        }
        this.buildInfoUI?.refreshUI(this.buildData);
        if (this.buildData.buildLevel < this.buildPfbList.length) {
            if (this._showBuilding != null) {
                this._showBuilding.destroy();
            }
            const buildView = instantiate(this.buildPfbList[this.buildData.buildLevel]);
            this.node.addChild(buildView);
            this._showBuilding = buildView;
        }
        this.buildInfoUI.node.setSiblingIndex(99);
    }

    private _onBeginUpgrade(data: { buildingType: InnerBuildingType, time: number }) {
        if (data.buildingType != this.buildID) {
            return;
        }
        GameMain.inst.innerSceneMap.playBuildAnim(data.buildingType, this.node, data.time, () => {
            this.refresh();
            this._upgradeIng = false;
        });
        this.buildInfoUI.setProgressTime(data.time);
    }

    //---------------------------------------------------
    // UserInfoEvent
    playerNameChanged(value: string): void {

    }
    playerExplorationValueChanged?(value: number): void {

    }
    getNewTask(taskId: string): void {

    }
    triggerTaskStepAction(action: string, delayTime: number): void {

    }
    finishEvent(event: FinishedEvent): void {

    }
    taskProgressChanged(taskId: string): void {

    }
    taskFailed(taskId: string): void {

    }
    getProp(propId: string, num: number): void {

    }
    gameTaskOver(): void {

    }
    generateTroopTimeCountChanged(leftTime: number): void {
        if (this._recruitCountTime != null) {
            if (leftTime > 0) {
                this._recruitCountTime.node.active = true;
                this._recruitCountTime.string = CommonTools.formatSeconds(leftTime);
            } else {
                this._recruitCountTime.node.active = false;
            }
        }
    }
}


