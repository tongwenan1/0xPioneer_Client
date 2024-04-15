import { Vec2 } from "cc";
import { TilePos } from "../Game/TiledMap/TileTool";
import GameMainHelper from "../Game/Helper/GameMainHelper";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import { TaskFactionAction, TaskShowHideAction, TaskShowHideStatus, TaskTargetType } from "../Const/TaskDefine";
import { DataMgr } from "../Data/DataMgr";

export default class BuildingMgr {
    public constructor() {}

    public async initData() {
        await this._initData();
        NotificationMgr.addListener(NotificationName.MAP_MEMBER_CHANGE_SHOW_HIDE, this._onBuildingChangeShowHide, this);
        NotificationMgr.addListener(NotificationName.MAP_MEMBER_CHANGE_FACTION, this._onBuildingChangeFaction, this);
    }

    public checkMapPosIsInBuilingRange(stayPos: Vec2, buildingId: string, range: number): boolean {
        const building = DataMgr.s.mapBuilding.getBuildingById(buildingId);
        if (building != null) {
            let centerPos = null;
            if (building.stayMapPositions.length == 1 || building.stayMapPositions.length == 3) {
                centerPos = building.stayMapPositions[0];
            } else if (building.stayMapPositions.length == 7) {
                centerPos = building.stayMapPositions[3];
            }
            const visionPositions: TilePos[] = GameMainHelper.instance.tiledMapGetExtAround(centerPos, range);
            return visionPositions.some((pos) => pos.x === stayPos.x && pos.y === stayPos.y);
        }
        return false;
    }

    private async _initData() {
        setInterval(() => {
            const buildings = DataMgr.s.mapBuilding.getObj_building();
            for (const building of buildings) {
                if (building.showHideStruct != null) {
                    if (building.showHideStruct.countTime > 0) {
                        building.showHideStruct.countTime -= 1;
                        // this._savePioneerData();
                        if (building.showHideStruct.countTime == 0) {
                            if (building.showHideStruct.isShow) {
                                DataMgr.s.mapBuilding.showBuilding(building.id);
                            } else {
                                DataMgr.s.mapBuilding.hideBuilding(building.id);
                            }
                            building.showHideStruct = null;
                            // this._savePioneerData();
                        }
                        DataMgr.s.mapBuilding.saveObj_building();
                    }
                }
            }
        }, 1000);
    }

    //---------------------------------- notification
    private _onBuildingChangeShowHide(action: TaskShowHideAction) {
        if (action.type == TaskTargetType.building) {
            if (action.delayTime <= 0) {
                if (action.status == TaskShowHideStatus.show) {
                    DataMgr.s.mapBuilding.showBuilding(action.id);
                } else if (action.status == TaskShowHideStatus.hide) {
                    DataMgr.s.mapBuilding.hideBuilding(action.id);
                }
            } else {
                const findBuilding = DataMgr.s.mapBuilding.getBuildingById(action.id);
                if (findBuilding != null) {
                    findBuilding.showHideStruct = {
                        countTime: action.delayTime,
                        isShow: action.status == TaskShowHideStatus.show,
                    };

                    // this._savePioneerData();
                    DataMgr.s.mapBuilding.saveObj_building();
                }
            }
        }
    }
    private _onBuildingChangeFaction(action: TaskFactionAction) {
        if (action.type == TaskTargetType.building) {
            DataMgr.s.mapBuilding.changeBuildingFaction(action.id, action.faction);
        }
    }
}
