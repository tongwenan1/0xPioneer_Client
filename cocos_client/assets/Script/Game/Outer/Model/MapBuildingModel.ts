import { Vec2 } from "cc";
import CommonTools from "db://assets/Script/Tool/CommonTools";
import { LanMgr } from "../../../Utils/Global";
import { BuildingStayPosType, MapBuildingType } from "../../../Const/BuildingDefine";
import { ResourceModel } from "../../../Const/UserInfoDefine";
import { MapMemberFactionType, MapMemberShowHideCountStruct } from "../../../Const/ConstDefine";

// export default class MapBuildingModel {

//     public set show(value: boolean) {
//         this._show = value;
//     }
//     public set showHideStruct(value: MapMemberShowHideCountStruct) {
//         this._showHideStruct = value;
//     }
//     public set faction(value: MapMemberFactionType) {
//         this._faction = value;
//     }
//     public set defendPioneerIds(value: string[]) {
//         this._defendPioneerIds = value;
//     }
//     public set stayMapPositions(posions: Vec2[]) {
//         this._stayMapPositions = posions;
//     }
//     public set progress(value: number) {
//         this._progress = value;
//     }
//     public set winprogress(value: number) {
//         this._winprogress = value;
//     }
//     public set eventId(value: string) {
//         this._eventId = value;
//     }
//     public set originalEventId(value: string) {
//         this._originalEventId = value;
//     }
//     public set exp(value: number) {
//         this._exp = value;
//     }
//     public set animType(value: string) {
//         this._animType = value;
//     }


//     public get show(): boolean {
//         return this._show;
//     }
//     public get showHideStruct(): MapMemberShowHideCountStruct {
//         return this._showHideStruct;
//     }
//     public get id(): string {
//         return this._id;
//     }
//     public get name(): string {
//         return this._name;
//     }
//     public get type(): MapBuildingType {
//         return this._type;
//     }
//     public get faction(): MapMemberFactionType {
//         return this._faction;
//     }
//     public get defendPioneerIds(): string[] {
//         return this._defendPioneerIds;
//     }
//     public get level(): number {
//         return this._level;
//     }
//     public get stayMapPositions(): Vec2[] {
//         return this._stayMapPositions;
//     }
//     public get stayPosType(): BuildingStayPosType {
//         return this._stayPosType;
//     }
//     public get progress(): number {
//         return this._progress;
//     }
//     public get winprogress(): number {
//         return this._winprogress;
//     }
//     public get eventId(): string {
//         return this._eventId;
//     }
//     public get originalEventId(): string {
//         return this._originalEventId;
//     }
//     public get exp(): number {
//         return this._exp;
//     }
//     public get animType(): string {
//         return this._animType;
//     }

//     public constructor(show: boolean, id: string, type: MapBuildingType, name: string, faction: MapMemberFactionType, defendPioneerIds: string[], level: number, stayMapPositions: Vec2[], posType: BuildingStayPosType) {
//         this._show = show;
//         this._id = id;
//         this._type = type;
//         this._name = name;
//         this._faction = faction;
//         this._defendPioneerIds = defendPioneerIds;
//         this._level = level;
//         this._stayMapPositions = stayMapPositions;
//         this._stayPosType = posType;
//         this._progress = 0;
//         this._winprogress = 0;
//         this._exp = 0;
//     }

//     private _show: boolean;
//     private _showHideStruct: MapMemberShowHideCountStruct;
//     private _id: string;
//     private _name: string;
//     private _type: MapBuildingType;
//     private _faction: MapMemberFactionType;
//     private _defendPioneerIds: string[];
//     private _level: number;
//     private _stayMapPositions: Vec2[];
//     private _stayPosType: BuildingStayPosType;
//     private _progress: number;
//     private _winprogress: number;
//     private _originalEventId: string;
//     private _eventId: string;
//     private _exp: number;
//     private _animType: string;

//     /**
//      * format: Abandoned Mine (198, 120)
//      */
//     public locationString() {
//         return `${LanMgr.getLanById(this.name)} ${CommonTools.formatMapPosition(this.stayMapPositions[0])}`
//     }
// }

// export class MapMainCityBuildingModel extends MapBuildingModel {

//     public loseHp(value: number) {
//         this._hp = Math.max(0, this._hp - value);
//     }
//     public set taskObj(value: any) {
//         this._taskObj = value;
//     }

//     public get hpMax(): number {
//         return this._hpMax;
//     }
//     public get hp(): number {
//         return this._hp;
//     }
//     public get attack(): number {
//         return this._attack;
//     }
//     public get taskObj(): any {
//         return this._taskObj;
//     }


//     public constructor(show: boolean, id: string, type: MapBuildingType, name: string, faction: MapMemberFactionType, defendPioneerIds: string[], level: number, stayMapPositions: Vec2[], posType: BuildingStayPosType, hpMax: number, hp: number, attack: number) {
//         super(show, id, type, name, faction, defendPioneerIds, level, stayMapPositions, posType);
//         this._hpMax = hpMax;
//         this._hp = hp;
//         this._attack = attack;
//     }

//     private _hpMax: number;
//     private _hp: number;
//     private _attack: number;
//     private _taskObj: any;
// }

// export class MapResourceBuildingModel extends MapBuildingModel {

//     public set resources(value: ResourceModel[]) {
//         this._resources = value;
//     }
//     public set quota(value: number) {
//         this._quota = value;
//     }


//     public get resources(): ResourceModel[] {
//         return this._resources;
//     }
//     public get quota(): number {
//         return this._quota;
//     }

//     public constructor(show: boolean, id: string, type: MapBuildingType, name: string, faction: MapMemberFactionType, defendPioneerIds: string[], level: number, stayMapPositions: Vec2[], posType: BuildingStayPosType, resources: ResourceModel[], quota: number) {
//         super(show, id, type, name, faction, defendPioneerIds, level, stayMapPositions, posType);
//         this._resources = resources;
//         this._quota = quota;
//     }

//     private _resources: ResourceModel[];
//     private _quota: number;
// }