import { _decorator, CCInteger, Component, instantiate, Node, Prefab, UITransform, v3, Vec3 } from 'cc';
import ViewController from '../../../BasicView/ViewController';
import { InnerBuildUI } from '../../../UI/Inner/InnerBuildUI';
import NotificationMgr from '../../../Basic/NotificationMgr';
import { InnerBuildingNotification, UserInnerBuildInfo } from '../../../Const/BuildingDefine';
const { ccclass, property } = _decorator;

@ccclass('InnerBuildingView')
export class InnerBuildingView extends ViewController {

    public refreshUI(building: UserInnerBuildInfo) {
        this._building = building;

        let showBuildingIndex: number = -1;
        if (this._building.buildLevel < this.buildingPrbs.length) {
            showBuildingIndex = this._building.buildLevel;
        } else {
            showBuildingIndex = this.buildingPrbs.length - 1;
        }
        if (this._currentShowBuildingIndex != showBuildingIndex) {
            if (this._showBuilding != null) {
                this._showBuilding.destroy();
            }
            const buildView = instantiate(this.buildingPrbs[showBuildingIndex]);
            this.node.getChildByPath("BuildingContent").addChild(buildView);
            buildView.setPosition(v3(0, 0, 0));
            this._showBuilding = buildView;
            this._currentShowBuildingIndex = showBuildingIndex;
            //change tap area height
            if (this._currentShowBuildingIndex < this.buildingShowHeight.length) {
                this.node.getChildByPath("clickNode").getComponent(UITransform).height = this.buildingShowHeight[this._currentShowBuildingIndex];
            }
        }
        this._infoView.refreshUI(this._building);
    }
    public playBuildAnim(buildTime: number) {
        const buildAnim = instantiate(this.buildingAnimPrb);
        buildAnim.setPosition(Vec3.ZERO);
        this.node.getChildByPath("BuildingContent").addChild(buildAnim);
        this._infoView.setProgressTime(buildTime);
        this.scheduleOnce(()=> {
            buildAnim.destroy();
            NotificationMgr.triggerEvent(InnerBuildingNotification.upgradeFinished, this._building.buildType);
        }, buildTime);
    }


    @property([Prefab])
    private buildingPrbs: Prefab[] = [];
    @property([CCInteger])
    private buildingShowHeight: number[] = [];

    @property(Prefab)
    private buildingAnimPrb: Prefab = null;

    protected innerBuildingLoad() {
    }
    protected innerBuildingTaped() {
    }

    private _infoView: InnerBuildUI = null;
    private _showBuilding: Node = null;
    private _currentShowBuildingIndex: number = -1;

    protected _building: UserInnerBuildInfo = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._infoView = this.node.getChildByName("innerBuildUI").getComponent(InnerBuildUI);

        this.innerBuildingLoad();
    }
    //---------------------------- action
    private onTapBuilding() {
        if (this._building == null) {
            return;
        }
        this.innerBuildingTaped();
    }
}


