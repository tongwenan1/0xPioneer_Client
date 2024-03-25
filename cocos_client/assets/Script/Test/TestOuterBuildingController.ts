import { _decorator, builtinResMgr, Component, instantiate, Node, Prefab, v2, v3, Vec2, Vec3, warn } from 'cc';
import { OuterBuildingView } from '../Game/Outer/View/OuterBuildingView';
import { TestMapBG } from './TestMapBG';
import { EventName } from '../Const/ConstDefine';
import { BuildingMgr, PioneerMgr } from '../Utils/Global';
import NotificationMgr from '../Basic/NotificationMgr';

const { ccclass, property } = _decorator;

@ccclass('TestOuterBuildingController')
export class TestOuterBuildingController extends Component {

    @property(Prefab) 
    private buildingPrefab;

    @property(TestMapBG)
    private mapBG;

    private _buildingMap: Map<string, { node: Node, stayPositons: Vec2[] }> = new Map();

    private _started: boolean = false;
    private _dataLoaded: boolean = false;
    protected onLoad() {
        NotificationMgr.addListener(EventName.LOADING_FINISH, this.onLocalDataLoadOver, this);
       
    }

    start() {
        this._started = true;
        this._startAction();
    }

    update(deltaTime: number) {

    }

    protected onDestroy(): void {
       
    }

    private onLocalDataLoadOver() {
        this._dataLoaded = true;
        this._startAction();
    }

    private _startAction() {
        if (this._started && this._dataLoaded) {
            this._refreshUI();
        }
    }

    private _refreshUI() {
        const allBuildings = BuildingMgr.getAllBuilding();
        for (const building of allBuildings) {
            if (building.show) {
                let temple = null;
                if (this._buildingMap.has(building.id)) {
                    temple = this._buildingMap.get(building.id).node;

                } else {
                    // new
                    temple = instantiate(this.buildingPrefab);
                    temple.setParent(this.node);
                    this._buildingMap.set(building.id, { node: temple, stayPositons: building.stayMapPositions });
                }
                if (temple != null) {
                    temple.getComponent(OuterBuildingView).refreshUI(building, PioneerMgr.getPlayerPioneer());
                    if (building.stayMapPositions.length > 0) {
                        let worldPos = null;
                        if (building.stayMapPositions.length == 7) {
                            worldPos = this.mapBG.getPosWorld(building.stayMapPositions[3].x, building.stayMapPositions[3].y);
                        } else if (building.stayMapPositions.length == 3) {
                            const beginWorldPos = this.mapBG.getPosWorld(building.stayMapPositions[0].x, building.stayMapPositions[0].y);
                            const endWorldPos = this.mapBG.getPosWorld(building.stayMapPositions[1].x, building.stayMapPositions[1].y);
                            worldPos = v3(
                                beginWorldPos.x,
                                endWorldPos.y + (beginWorldPos.y - endWorldPos.y) / 2,
                                0
                            );
                        } else {
                            worldPos = this.mapBG.getPosWorld(building.stayMapPositions[0].x, building.stayMapPositions[0].y);
                        }
                        temple.setWorldPosition(worldPos);
                    }
                }

            } else {
                if (this._buildingMap.has(building.id)) {
                    const data = this._buildingMap.get(building.id);
                    data.node.destroy();
                    for (const pos of data.stayPositons) {
                        // this.mapBG.removeDynamicBlock(pos);
                    }
                    this._buildingMap.delete(building.id);
                }
            }
        }
        // destroy 
        this._buildingMap.forEach((value: { node: Node, stayPositons: Vec2[] }, key: string) => {
            let isExsit: boolean = false;
            for (const building of allBuildings) {
                if (building.id == key) {
                    isExsit = true;
                    break;
                }
            }
            if (!isExsit) {
                value.node.destroy();
                for (const pos of value.stayPositons) {
                    // this.mapBG.removeDynamicBlock(pos);
                }
                this._buildingMap.delete(key);
            }
        });
    }
}


