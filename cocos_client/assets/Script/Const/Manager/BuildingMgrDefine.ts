import { BuildingFactionType } from "../../Game/Outer/Model/MapBuildingModel";

export interface BuildingMgrEvent {
    buildingDidHide(buildingId: string, beacusePioneerId: string): void;
    buildingDidShow(buildingId: string): void;


    buildingFacitonChanged(buildingId: string, faction: BuildingFactionType): void;
    buildingInsertDefendPioneer(buildingId: string, pioneerId: string): void;
    buildingRemoveDefendPioneer(buildingId: string, pioneerId: string): void;
}