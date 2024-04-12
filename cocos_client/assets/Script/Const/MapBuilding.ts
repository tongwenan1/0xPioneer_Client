import { MapBuildingType } from "./BuildingDefine";

export interface MapBuildingConfigData {
    id: string;
    name: string;
    type: MapBuildingType;
    show: number;
    pos_type: number;
    positions: [number, number];
    node: string;
    level: number;
    progress: null;
    resources: null;
    quota: null;
    exp: null;
    event: "";
    hp: number;
    attack: number;
    winprogress: number;
    faction: number;
    defendPioneerIds: string[];
}
