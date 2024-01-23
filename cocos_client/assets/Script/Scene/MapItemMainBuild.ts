import { _decorator, Component, Node, Vec2, Vec3, CCString, Prefab, instantiate } from 'cc';
import { GameMain } from '../GameMain';
import { MapItem } from './MapItem';
import { InnerBuildUI } from '../UI/Inner/InnerBuildUI';
import { InnerBuildInfo, OutMapItemTownData } from '../Datas/DataDefine';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Datas/ConstDefine';
import UserInfo, { UserInnerBuildInfo } from '../v2/DataMgr/user_Info';
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

        if (GameMain.inst.UI.mainBuildUI.isShow) {
            GameMain.inst.UI.mainBuildUI.show(false);
        }
        else {

            GameMain.inst.UI.mainBuildUI.show(true);
        }
    }

    public upgradeBuild() {
        // TODO Currently only processing upgrades to level 2
        if (this._data.buildLevel >= 2 ||
            this._buildUpgrading) {
            return;
        }
        this._buildUpgrading = true;

        let up_time = 5;
        this.buildingAnim.active = true;
        this.scheduleOnce(() => {
            UserInfo.Instance.upgradeBuild('0');

            this.refresh();
            this._buildUpgrading = false;
        }, up_time);
        this.buildInfoUI.setProgressTime(up_time);
    }

    start() {
        super.start();

        EventMgr.on(EventName.MAIN_BUILD_LEVEL_UP, this.upgradeBuild, this)

        this.buildInfoUI = this.node.getChildByName('innerBuildUI')?.getComponent(InnerBuildUI);
        this._data = UserInfo.Instance.innerBuilds.get('0');
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


