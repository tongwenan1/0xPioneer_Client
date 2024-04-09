import { _decorator, Button, CCInteger, Component, instantiate, Node, Prefab, size, Size, UITransform, v3, Vec3 } from 'cc';
import ViewController from '../../../BasicView/ViewController';
import { InnerBuildUI } from '../../../UI/Inner/InnerBuildUI';
import NotificationMgr from '../../../Basic/NotificationMgr';
import { InnerBuildingType, UserInnerBuildInfo } from '../../../Const/BuildingDefine';
import { ResourcesMgr } from '../../../Utils/Global';
import InnerBuildingLvlUpConfig from '../../../Config/InnerBuildingLvlUpConfig';
import InnerBuildingConfig from '../../../Config/InnerBuildingConfig';
import { NotificationName } from '../../../Const/Notification';
const { ccclass, property } = _decorator;

@ccclass('InnerBuildingView')
export class InnerBuildingView extends ViewController {

    public async refreshUI(building: UserInnerBuildInfo, canAction: boolean = true) {
        if (building == null) {
            return;
        }
        this._building = building;

        // building
        if (this._building.buildLevel != this._currentLevel) {
            this._currentLevel = this._building.buildLevel;
            let showedBuildingView: Node = null;
            let prefabName: string = null;
            const innerConfig = InnerBuildingConfig.getByBuildingType(this._building.buildType);
            if (this._building.buildLevel > 0 &&
                innerConfig != null && innerConfig.prefab != null && innerConfig.prefab.length > 0) {
                prefabName = InnerBuildingLvlUpConfig.getBuildingLevelData(this._building.buildLevel, innerConfig.prefab);
            }
            if (prefabName != null) {
                this._defaultBuildingView.active = false;
                if (this._showBuilding != null) {
                    this._showBuilding.destroy();
                    this._showBuilding = null;
                }
                const buildingPrb = await ResourcesMgr.LoadABResource("prefab/game/inner/building/" + prefabName, Prefab);
                if (buildingPrb != null) {
                    const buildView = instantiate(buildingPrb);
                    // buildView.setPosition(Vec3.ZERO);
                    this.node.getChildByPath("BuildingContent").addChild(buildView);
                    this._showBuilding = buildView;
                    showedBuildingView = buildView;
                }

            } else {
                this._defaultBuildingView.active = true;
                showedBuildingView = this._defaultBuildingView;
            }
            const buildingSize: Size = size(0, 0);
            if (showedBuildingView != null) {
                let minX: number = null;
                let maxX: number = null;
                let minY: number = null;
                let maxY: number = null;
                for (const children of showedBuildingView.children) {
                    const childrenScale: Vec3 = children.scale;
                    if (children.getComponent(UITransform) == null) {
                        minX = minX == null ? children.position.x : Math.min(minX, children.position.x);
                        maxX = maxX == null ? children.position.x : Math.max(maxX, children.position.x);
                        minY = minY == null ? children.position.y : Math.min(minY, children.position.y);
                        maxY = maxY == null ? children.position.y : Math.max(maxY, children.position.y);
                    } else {
                        const size = children.getComponent(UITransform).contentSize;
                        minX = minX == null ? (children.position.x - size.width / 2 * childrenScale.x) : Math.min(minX, children.position.x - size.width / 2 * childrenScale.x);
                        maxX = maxX == null ? (children.position.x + size.width / 2 * childrenScale.x) : Math.max(maxX, children.position.x + size.width / 2 * childrenScale.x);
                        minY = minY == null ? (children.position.y - size.height / 2 * childrenScale.y) : Math.min(minY, children.position.y - size.width / 2 * childrenScale.y);
                        maxY = maxY == null ? (children.position.y + size.height / 2 * childrenScale.y) : Math.max(maxY, children.position.y + size.height / 2 * childrenScale.y);
                    }
                }
                const showedBuildingViewScale: Vec3 = showedBuildingView.scale;
                buildingSize.width = (maxX - minX) * showedBuildingViewScale.x;
                buildingSize.height = (maxY - minY) * showedBuildingViewScale.y;

                buildingSize.width += showedBuildingViewScale.x * showedBuildingView.position.x;
                buildingSize.height += showedBuildingViewScale.y * showedBuildingView.position.y;
            }
            this._buildingSize = buildingSize;
            this.node.getChildByPath("clickNode").getComponent(UITransform).setContentSize(buildingSize);
        }

        // info 
        this._infoView.refreshUI(this._building);
        this._infoView.setProgressTime(this._building.upgradeCountTime, this._building.upgradeTotalTime);

        // building anim
        if (building.upgradeTotalTime > 0) {
            this._buildingAnim.active = true;
        } else {
            this._buildingAnim.active = false;
        }

        // can action
        this.node.getChildByPath("clickNode").getComponent(Button).interactable = canAction;
    }

    @property(Prefab)
    private buildingAnimPrb: Prefab = null;

    protected innerBuildingLoad() {
    }
    protected innerBuildingTaped() {
    }

    private _buildingAnim: Node = null;
    private _defaultBuildingView: Node = null;
    private _showBuilding: Node = null;
    private _infoView: InnerBuildUI = null;

    protected _building: UserInnerBuildInfo = null;
    protected _buildingSize: Size = null;
    private _currentLevel: number = -1;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        // building anim
        this._buildingAnim = instantiate(this.buildingAnimPrb);
        this._buildingAnim.setPosition(Vec3.ZERO);
        this.node.addChild(this._buildingAnim);
        this._buildingAnim.active = false;

        // default building
        this._defaultBuildingView = this.node.getChildByPath("BuildingContent/Default");

        // info 
        this._infoView = this.node.getChildByName("innerBuildUI").getComponent(InnerBuildUI);

        this.innerBuildingLoad();
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();

        NotificationMgr.addListener(NotificationName.INNER_BUILDING_BEGIN_UPGRADE, this._beginUpgrade, this);
        NotificationMgr.addListener(NotificationName.INNER_BUILDING_UPGRADE_COUNT_TIME_CHANGED, this._upgradeCountTimeChanged, this);
        NotificationMgr.addListener(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, this._upgradeFinished, this);
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();

        NotificationMgr.removeListener(NotificationName.INNER_BUILDING_BEGIN_UPGRADE, this._beginUpgrade, this);
        NotificationMgr.removeListener(NotificationName.INNER_BUILDING_UPGRADE_COUNT_TIME_CHANGED, this._upgradeCountTimeChanged, this);
        NotificationMgr.removeListener(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, this._upgradeFinished, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

    }
    //---------------------------- function
    private _beginUpgrade() {
        this.refreshUI(this._building);
    }
    private _upgradeCountTimeChanged() {
        this.refreshUI(this._building);
    }
    private _upgradeFinished() {
        this.refreshUI(this._building);
    }

    //---------------------------- action
    private onTapBuilding() {
        if (this._building == null) {
            return;
        }
        if (this._building.buildType == InnerBuildingType.ArtifactStore) {
            
        }
        this.innerBuildingTaped();
    }
}


