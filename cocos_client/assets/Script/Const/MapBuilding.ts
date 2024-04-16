import { Vec2 } from "cc";
import { BuildingStayPosType, MapBuildingType } from "./BuildingDefine";
import { MapMemberFactionType } from "./ConstDefine";
import { MapDecoratePosMode } from "./Model/MapDecorateModelDefine";

export interface MapBuildingConfigData {
    block: any;
    posmode: any;
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
    event: string;
    hp: number;
    attack: number;
    winprogress: number;
    faction: number;
    defendPioneerIds: string[];
}

export interface StayMapPosition {
    x: number;
    y: number;
}

// building
export interface MapBuildingBaseData {
    id: string;
    name: string;
    type: MapBuildingType;
    level: number;
    show: boolean;
    showHideStruct: {
        countTime: number;
        isShow: boolean;
    };
    faction: MapMemberFactionType;
    defendPioneerIds: string[];

    stayMapPositions: StayMapPosition[];
    stayPosType: BuildingStayPosType;
    progress: number;
    winprogress: number;
    eventId: string;

    originalEventId: string;
    exp: number;
    animType: string;
}
export interface MapBuildingMainCityData extends MapBuildingBaseData {
    hpMax: number;
    hp: number;
    attack: number;
    taskObj: any;
}
export interface MapBuildingResourceData extends MapBuildingBaseData {
    resources: { id: string; num: number };
    quota: number;
}
export type MapBuildingData = MapBuildingMainCityData | MapBuildingResourceData | MapBuildingBaseData;

export interface MapBuildingBaseObject extends MapBuildingBaseData {
    stayMapPositions: Vec2[];
}
export interface MapBuildingMainCityObject extends MapBuildingMainCityData {
    stayMapPositions: Vec2[];
}
export interface MapBuildingResourceObject extends MapBuildingResourceData {
    stayMapPositions: Vec2[];
}
export type MapBuildingObject = MapBuildingMainCityObject | MapBuildingResourceObject | MapBuildingBaseObject;

// decorate
export interface MapDecorateData {
    id: string;
    name: string;
    show: boolean;
    block: boolean;
    posMode: MapDecoratePosMode;
    stayMapPositions: StayMapPosition[];
}

export interface MapDecorateObject extends MapDecorateData {
    stayMapPositions: Vec2[];
}
