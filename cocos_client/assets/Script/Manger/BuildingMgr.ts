import { Vec2 } from "cc";
import GameMainHelper from "../Game/Helper/GameMainHelper";
import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import { MapBuildingFactionAction, TaskFactionAction, TaskShowHideAction, TaskShowHideStatus } from "../Const/TaskDefine";
import { DataMgr } from "../Data/DataMgr";
import { MapMemberTargetType } from "../Const/ConstDefine";

export default class BuildingMgr {
    public constructor() {}

    public async initData() {
        NotificationMgr.addListener(NotificationName.BUILDING_TAVERN_COUNT_DOWN_TIME_DID_FINISH, this._onBuildingTavernCountdownTimeDidFinish, this);

        setInterval(() => {
            const buildings = DataMgr.s.mapBuilding.getObj_building();
            for (const building of buildings) {
                if (building.showHideStruct == null) return;
                if (building.showHideStruct.countTime <= 0) return;

                building.showHideStruct.countTime -= 1;

                

            }
        }, 1000);
    }

    public checkMapPosIsInBuilingRange(stayPos: Vec2, buildingId: string, range: number): boolean {
        const building = DataMgr.s.mapBuilding.getBuildingById(buildingId);
        if (building == null) return false;

        let centerPos = null;
        if (building.stayMapPositions.length == 1 || building.stayMapPositions.length == 3) {
            centerPos = building.stayMapPositions[0];
        } else if (building.stayMapPositions.length == 7) {
            centerPos = building.stayMapPositions[3];
        }
        const visionPositions = GameMainHelper.instance.tiledMapGetExtAround(centerPos, range);

        return visionPositions.some((pos) => pos.x === stayPos.x && pos.y === stayPos.y);
    }

    //---------------------------------- notification
    private _onBuildingChangeShowHide(action: TaskShowHideAction) {
        if (action.type != MapMemberTargetType.building) return;

        const findBuilding = DataMgr.s.mapBuilding.getBuildingById(action.id);
        if (findBuilding == null) return;

        if (action.delayTime > 0) {
            findBuilding.showHideStruct = {
                countTime: action.delayTime,
                isShow: action.status == TaskShowHideStatus.show,
            };
            return;
        }

        // if (action.status == TaskShowHideStatus.show) {
        //     DataMgr.s.mapBuilding.showBuilding(action.id);
        // } else if (action.status == TaskShowHideStatus.hide) {
        //     DataMgr.s.mapBuilding.hideBuilding(action.id);
        // }
    }

    // private _onBuildingChangeFaction(action: TaskFactionAction) {
    //     if (action.type != MapMemberTargetType.building) return;
    //     DataMgr.s.mapBuilding.changeBuildingFaction(action.id, action.faction);
    // }
    private _onBuildingTavernCountdownTimeDidFinish(data: { id: string }) {
        // const nft = DataMgr.s.nftPioneer.generateNewNFT();
        // DataMgr.s.mapBuilding.changeBuildingNewNft(data.id, nft);
    }
}
