import { InnerBuildingType } from "../Const/BuildingDefine";
import { GameExtraEffectType } from "../Const/ConstDefine";
import { MapPlayerPioneerObject } from "../Const/PioneerDefine";
import { DataMgr } from "../Data/DataMgr";
import { PioneerDevelopMgr, UserInfoMgr } from "../Utils/Global";

export default class GameMgr {
    public getAfterExtraEffectPropertyByPioneer(pioneerId: string, type: GameExtraEffectType, originalValue: number): number {
        // artifact effect
        let artifactChangeRate: number = DataMgr.s.artifact.getObj_artifact_effectiveEffect(type, UserInfoMgr.artifactStoreLevel);

        // nft
        let nftChangeRate: number = 0;
        const pioneer = DataMgr.s.pioneer.getById(pioneerId) as MapPlayerPioneerObject;
        if (!!pioneer && pioneer.NFTId != null) {
            nftChangeRate = PioneerDevelopMgr.getNFTEffectById(pioneer.NFTId, type);
        }

        return this._getEffectResultNum(type, originalValue, artifactChangeRate + nftChangeRate);
    }
    public getAfterExtraEffectPropertyByBuilding(buildingType: InnerBuildingType, type: GameExtraEffectType, originalValue: number): number {
        // artifact effect
        let artifactChangeRate: number = DataMgr.s.artifact.getObj_artifact_effectiveEffect(type, UserInfoMgr.artifactStoreLevel);

        //nft
        let nftChangeRate: number = 0;
        const nft = PioneerDevelopMgr.getNFTByWorkingBuildingId(buildingType);
        if (nft != undefined) {
            nftChangeRate = PioneerDevelopMgr.getNFTEffectById(nft.uniqueId, type);
        }

        return this._getEffectResultNum(type, originalValue, artifactChangeRate + nftChangeRate);
    }

    private _getEffectResultNum(type: GameExtraEffectType, originalValue: number, effectNum: number): number {
        if (type == GameExtraEffectType.MOVE_SPEED || type == GameExtraEffectType.ENERGY_GENERATE || type == GameExtraEffectType.TREASURE_PROGRESS) {
            originalValue = Math.floor(originalValue * (1 + effectNum));
        } else if (
            type == GameExtraEffectType.BUILDING_LVUP_TIME ||
            type == GameExtraEffectType.BUILDING_LVLUP_RESOURCE ||
            type == GameExtraEffectType.GATHER_TIME ||
            type == GameExtraEffectType.TROOP_GENERATE_TIME
        ) {
            originalValue = Math.floor(originalValue * (1 - effectNum));
        } else if (
            type == GameExtraEffectType.PIONEER_ONLY_VISION_RANGE ||
            type == GameExtraEffectType.CITY_AND_PIONEER_VISION_RANGE ||
            type == GameExtraEffectType.CITY_ONLY_VISION_RANGE
        ) {
            originalValue = originalValue + effectNum;
        }
        return originalValue;
    }
}
