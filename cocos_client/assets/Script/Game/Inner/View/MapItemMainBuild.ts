import { _decorator, Component, Node, Vec2, Vec3, CCString, Prefab, instantiate } from 'cc';
import { MapItem } from '../../../BasicView/MapItem';
import { EventName } from '../../../Const/ConstDefine';
import { GameMain } from '../../../GameMain';
import ArtifactMgr from '../../../Manger/ArtifactMgr';
import EventMgr from '../../../Manger/EventMgr';
import UserInfoMgr, { InnerBuildingType, UserInnerBuildInfo } from '../../../Manger/UserInfoMgr';
import { ArtifactEffectType } from '../../../Model/ArtifactData';
import { InnerBuildUI } from '../../../UI/Inner/InnerBuildUI';

const { ccclass, property } = _decorator;

@ccclass('MapItemMainBuild')
export class MapItemMainBuild extends MapItem {

    @property([Prefab])
    private buildPfbList: Prefab[] = [];

    @property(Node)
    private buildingAnim: Node = null;

    private buildInfoUI: InnerBuildUI = null;

    private buildNode: Node = null;


    private _data: UserInnerBuildInfo = null;
    private _buildUpgrading: boolean = false;

    override _onClick() {
        super._onClick();

        GameMain.inst.UI.buildingUpgradeUI.refreshUI();
        GameMain.inst.UI.buildingUpgradeUI.show(true, true);
    }

    public upgradeBuild() {
        // TODO Currently only processing upgrades to level 2
        if (this._data.buildLevel >= 2 ||
            this._buildUpgrading) {
            return;
        }
        this._buildUpgrading = true;

        let up_time = 5;
        // artifact
        let artifactTime = 0;
        let artifactPropEff = ArtifactMgr.Instance.getPropEffValue(UserInfoMgr.Instance.level);
        if (artifactPropEff.eff[ArtifactEffectType.BUILDING_LVUP_TIME]) {
            artifactTime = artifactPropEff.eff[ArtifactEffectType.BUILDING_LVUP_TIME];
        }
        // total time
        up_time = Math.floor(up_time - (up_time * artifactTime));

        this.buildingAnim.active = true;
        this.scheduleOnce(() => {
            UserInfoMgr.Instance.upgradeBuild(InnerBuildingType.MainCity);

            this.refresh();
            this._buildUpgrading = false;
        }, up_time);
        this.buildInfoUI.setProgressTime(up_time);
    }

    async start() {
        super.start();

        this.buildInfoUI = this.node.getChildByName('innerBuildUI')?.getComponent(InnerBuildUI);
        const innerBuildData = await UserInfoMgr.Instance.innerBuilds;
        this._data = innerBuildData.get('0');
        this.refresh();
    }

    refresh() {
        this.buildingAnim.active = false;

        if (this._data) {
            this.buildInfoUI?.refreshUI(this._data);
            this.buildNode = instantiate(this.buildPfbList[this._data.buildLevel - 1]);
            this.buildNode.setParent(this.node);
            this.buildNode.setPosition(new Vec3(0, 0, 0));

        }
    }

    update(deltaTime: number) {

    }
}


