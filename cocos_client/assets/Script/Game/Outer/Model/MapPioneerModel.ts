import { Vec2, Vec3, log, v2 } from "cc";
import { TilePos } from "../../TiledMap/TileTool";
import { MapPioneerAttributesChangeModel, MapPioneerLogicType, MapPioneerActionType, MapPioneerEventStatus, MapPioneerMoveDirection, MapPioneerType } from "../../../Const/Model/MapPioneerModelDefine";
import { AttrChangeType, GetPropData, MapMemberFactionType, MapMemberGetTalkCountStruct, MapMemberShowHideCountStruct } from "../../../Const/ConstDefine";

export default class MapPioneerModel {
    // hp
    public gainOriginalHpMax(value: number) {
        this._originalHpMax += value;

        this._hpMax = this._originalHpMax;
        for (const model of this._hpMaxChanges) {
            if (model.type == AttrChangeType.ADD) {
                this._hpMax += model.value;
            } else if (model.type == AttrChangeType.MUL) {
                this._hpMax += (model.value * this._originalHpMax);
            }
        }
        this._hpMax = Math.max(1, this._hpMax);
        if (this._hp > this._hpMax) {
            this._hp = this._hpMax;
        }
    }
    public changeHpMax(model: MapPioneerAttributesChangeModel) {
        this._hpMaxChanges.push(model);
        if (model.type == AttrChangeType.ADD) {
            this._hpMax += model.value;
        } else if (model.type == AttrChangeType.MUL) {
            this._hpMax += (model.value * this._originalHpMax);
        }
        this._hpMax = Math.max(1, this._hpMax);
        if (this._hp > this._hpMax) {
            this._hp = this._hpMax;
        }
    }
    public gainHp(value: number) {
        this._hp = Math.min(this._hpMax, this._hp + value);
    }
    public loseHp(value: number) {
        this._hp = Math.max(0, this._hp - value);
    }
    // attack
    public gainOriginalAttack(value: number) {
        this._originalAttack += value;
        this._attack = this._originalAttack;
        for (const model of this._attackChanges) {
            if (model.type == AttrChangeType.ADD) {
                this._attack += model.value;
            } else if (model.type == AttrChangeType.MUL) {
                this._attack += (model.value * this._originalAttack);
            }
        }
        this._attack = Math.max(0, this._attack);
    }
    
    public changeAttack(model: MapPioneerAttributesChangeModel) {
        this._attackChanges.push(model);
        if (model.type == AttrChangeType.ADD) {
            this._attack += model.value;
        } else if (model.type == AttrChangeType.MUL) {
            this._attack += (model.value * this._originalAttack);
        }
        this._attack = Math.max(0, this._attack);
    }
    // defend
    public gainOriginalDefend(value: number) {
        this._originalDefend += value;
        this._defend = this._originalDefend;
        for (const model of this._defendChanges) {
            if (model.type == AttrChangeType.ADD) {
                this._defend += model.value;
            } else if (model.type == AttrChangeType.MUL) {
                this._defend += (model.value * this._originalDefend);
            }
        }
        this._defend = Math.max(0, this._defend);
    }
    public changeDefend(model: MapPioneerAttributesChangeModel) {
        this._defendChanges.push(model);
        if (model.type == AttrChangeType.ADD) {
            this._defend += model.value;
        } else if (model.type == AttrChangeType.MUL) {
            this._defend += (model.value * this._originalDefend);
        }
        this._defend = Math.max(0, this._defend);
    }

    public isMoving() {
        if(this._movePaths.length > 0){
            return true;
        }

        for(let i=0;i<this._logics.length; ++i){
            if(this._logics[i].type == MapPioneerLogicType.stepmove){
                return true;
            }
            if(this._logics[i].type == MapPioneerLogicType.targetmove){
                return true;
            }
            if (this._logics[i].type == MapPioneerLogicType.patrol){
                return true;
            }
        }

        return false;
    }

    public set faction(value: MapMemberFactionType) {
        this._faction = value;
    }
    public set animType(value: string) {
        this._animType = value;
    }
    public set show(value: boolean) {
        this._show = value;
    }
    public set showHideStruct(value: MapMemberShowHideCountStruct) {
        this._showHideStruct = value;
    }
    public set stayPos(value: Vec2) {
        this._stayPos = value;
    }
    public set movePaths(value: TilePos[]) {
        this._movePaths = value;
    }
    public set actionType(value: MapPioneerActionType) {
        this._actionType = value;
    }
    public set actionEventId(value: string | null) {
        this._actionEventId = value;
    }
    public set eventStatus(value: MapPioneerEventStatus) {
        this._eventStatus = value;
    }
    public set moveDirection(value: MapPioneerMoveDirection) {
        this._moveDirection = value;
    }
    public set actionEndTimeStamp(value: number) {
        this._actionEndTimeStamp = value;
    }
    public set actionBeginTimeStamp(value: number) {
        this._actionBeginTimeStamp = value;
    }
    public set logics(value: MapPioneerLogicModel[]) {
        this._logics = value;
    }
    public set moveSpeed(value: number) {
        this._moveSpeed = value;
    }
    public set purchaseMovingPioneerId(value: string | null) {
        this._purchaseMovingPioneerId = value;
    }
    public set purchaseMovingBuildingId(value: string | null) {
        this._purchaseMovingBuildingId = value;
    }
    public set winprogress(value: number) {
        this._winprogress = value;
    }
    public set winexp(value: number) {
        this._winexp = value;
    }
    public set drop(value: GetPropData[]) {
        this._drop = value;
    }
    public set NFTLinkdId(value: string) {
        this._NFTLinkedId = value;
    }
    public set NFTId(value: string) {
        this._NFTId = value;
    }


    public get show(): boolean {
        return this._show;
    }
    public get showHideStruct(): MapMemberShowHideCountStruct {
        return this._showHideStruct;
    }
    public get id(): string {
        return this._id;
    }
    public get faction(): MapMemberFactionType {
        return this._faction;
    }
    public get type(): MapPioneerType {
        return this._type;
    }
    public get animType(): string {
        return this._animType;
    }
    public get moveDirection(): MapPioneerMoveDirection {
        return this._moveDirection;
    }
    public get name(): string {
        return this._name;
    }
    public get originalHpMax(): number {
        return this._originalHpMax;
    }
    public get hpMax(): number {
        return this._hpMax;
    }
    public get hp(): number {
        return this._hp;
    }
    public get hpMaxChange(): MapPioneerAttributesChangeModel[] {
        return this._hpMaxChanges;
    }

    public get originalAttack(): number {
        return this._originalAttack;
    }
    public get attack(): number {
        return this._attack;
    }
    public get attackChange(): MapPioneerAttributesChangeModel[] {
        return this._attackChanges;
    }

    public get originalDefend(): number {
        return this._originalDefend;
    }
    public get defend(): number {
        return this._defend;
    }
    public get defendChange(): MapPioneerAttributesChangeModel[] {
        return this._defendChanges;
    }

    public get stayPos(): Vec2 {
        return this._stayPos;
    }
    public get movePaths(): TilePos[] {
        return this._movePaths;
    }
    public get actionType(): MapPioneerActionType {
        return this._actionType;
    }
    public get actionEventId(): string | null {
        return this._actionEventId;
    }
    public get eventStatus(): MapPioneerEventStatus {
        return this._eventStatus;
    }
    public get actionEndTimeStamp(): number {
        return this._actionEndTimeStamp;
    }
    public get actionBeginTimeStamp(): number {
        return this._actionBeginTimeStamp;
    }
    public get logics(): MapPioneerLogicModel[] {
        return this._logics;
    }
    public get moveSpeed(): number {
        return this._moveSpeed;
    }
    public get purchaseMovingPioneerId(): string | null {
        return this._purchaseMovingPioneerId;
    }
    public get purchaseMovingBuildingId(): string | null {
        return this._purchaseMovingBuildingId
    }
    public get winprogress(): number {
        return this._winprogress;
    }
    public get winexp(): number {
        return this._winexp;
    }
    public get drop(): GetPropData[] {
        return this._drop;
    }
    public get NFTLinkdId(): string {
        return this._NFTLinkedId;
    }
    public get NFTId(): string {
        return this._NFTId;
    }


    public constructor(show: boolean, id: string, faction: MapMemberFactionType, type: MapPioneerType, name: string, originalHpMax: number, hpMax: number, hp: number, originalAttack: number, attack: number, originalDefend: number, defend: number, stayPos: Vec2) {
        this._show = show;
        this._id = id;
        this._faction = faction;
        this._type = type;
        this._name = name;
        this._stayPos = stayPos;

        this._originalHpMax = originalHpMax;
        this._hpMax = hpMax;
        this._hp = hp;
        this._hpMaxChanges = [];

        this._originalAttack = originalAttack;
        this._attack = attack;
        this._attackChanges = [];

        this._originalDefend = originalDefend,
        this._defend = defend;
        this._defendChanges = [];

        this._movePaths = [];
        this._actionType = MapPioneerActionType.idle;
        this._actionEventId = null;
        this._eventStatus = MapPioneerEventStatus.None;
        this._actionEndTimeStamp = 0;
        this._actionBeginTimeStamp = 0;
        this._logics = [];
        this._moveSpeed = -1;
        this._purchaseMovingPioneerId = null;
        this._winprogress = 0;
        this._winexp = 0;
        this._drop = [];
    }

    private _show: boolean;
    private _showHideStruct: MapMemberShowHideCountStruct;
    private _id: string;
    private _faction: MapMemberFactionType;
    private _type: MapPioneerType;
    private _animType: string;
    private _moveDirection: MapPioneerMoveDirection;
    private _name: string;

    private _originalHpMax: number;
    private _hpMax: number;
    private _hp: number;
    private _hpMaxChanges: MapPioneerAttributesChangeModel[];

    private _originalAttack: number;
    private _attack: number;
    private _attackChanges: MapPioneerAttributesChangeModel[];

    private _originalDefend: number;
    private _defend: number;
    private _defendChanges: MapPioneerAttributesChangeModel[];

    private _stayPos: Vec2;
    private _movePaths: TilePos[];
    private _actionType: MapPioneerActionType;
    private _actionEventId: string;
    private _eventStatus: MapPioneerEventStatus;
    private _actionEndTimeStamp: number;
    private _actionBeginTimeStamp: number;
    private _logics: MapPioneerLogicModel[];
    private _moveSpeed: number;
    private _purchaseMovingPioneerId: string | null;
    private _purchaseMovingBuildingId: string | null;
    private _winprogress: number;
    private _winexp: number;
    private _drop: GetPropData[];

    private _NFTLinkedId: string;
    private _NFTId: string;
}

export class MapPlayerPioneerModel extends MapPioneerModel {

    public rebirth(hp: number, stayPos: Vec2) {
        // rebirth to dead point right one step 
        this.show = true;
        this.gainHp(hp);
        if (stayPos != null) {
            this.stayPos = stayPos;
        }
    }
    public get rebirthCountTime() {
        return this._rebirthCountTime;
    }
    public get killerId() {
        return this._killerId;
    }
    


    public set rebirthCountTime(value: number) {
        this._rebirthCountTime = value;
    }
    public set killerId(value: string) {
        this._killerId = value;
    }

    public constructor(show: boolean, id: string, faction: MapMemberFactionType, type: MapPioneerType, name: string, originalHpMax: number, hpMax: number, hp: number, originalAttack: number, attack: number, originalDefend: number, defend: number, stayPos: Vec2) {
        super(show, id, faction, type, name, originalHpMax, hpMax, hp, originalAttack, attack, originalDefend, defend, stayPos);
        this._rebirthCountTime = 0;
        this._killerId = null;
    }

    private _rebirthCountTime: number;
    private _killerId: string; 
}

export class MapNpcPioneerModel extends MapPioneerModel {

    public set talkCountStruct(value: MapMemberGetTalkCountStruct) {
        this._talkCountStruct = value;
    }
    public set talkId(value: string | null) {
        this._talkId = value;
    }

    public get talkCountStruct(): MapMemberGetTalkCountStruct {
        return this._talkCountStruct;
    }
    public get talkId(): string | null {
        return this._talkId;
    }

    public constructor(show: boolean, id: string, faction: MapMemberFactionType, type: MapPioneerType, name: string, originalHpMax: number, hpMax: number, hp: number, originalAttack: number, attack: number, originalDefend: number, defend: number, stayPos: Vec2) {
        super(show, id, faction, type, name, originalHpMax, hpMax, hp, originalAttack, attack, originalDefend, defend, stayPos);
        this._talkId = null;
    }
    
    private _talkId: string;
    private _talkCountStruct: MapMemberGetTalkCountStruct;
}



export class MapPioneerLogicModel {

    public setStepMoveData(step: number, cd: number, currentCd: number, direction: number, repeat: number) {
        this._step = step;
        this._cd = cd;
        this._currentCd = currentCd;
        this._direction = direction;
        this._repeat = repeat;
    }
    public setPatrolData(originalPos: Vec2, interval: number[], range: number, repeat: number, currentCd: number, patrolTargetPos: Vec2) {
        this._originalPos = originalPos;
        this._interval = interval;
        this._range = range;
        this._repeat = repeat;
        this._currentCd = currentCd;
        this._patrolTargetPos = patrolTargetPos;
    }

    public set currentCd(value: number) {
        this._currentCd = value;
    }
    public set repeat(value: number) {
        this._repeat = value;
    }
    public set targetPos(value: Vec2) {
        this._targetPos = value;
    }
    public set patrolTargetPos(value: Vec2) {
        this._patrolTargetPos = value;
    }
    public set moveSpeed(value: number) {  
        this._moveSpeed = value;
    }
    public set commonMoveTilePos(value: TilePos) {
        this._commonMoveTilePos = value;
    }


    public get type(): MapPioneerLogicType {
        return this._type;
    }
    public get step(): number {
        return this._step;
    }
    public get cd(): number {
        return this._cd;
    }
    public get currentCd(): number {
        return this._currentCd;
    }
    public get direction(): number {
        return this._direction;
    }
    public get repeat(): number {
        return this._repeat;
    }
    public get targetPos(): Vec2 {
        return this._targetPos;
    }


    public get originalPos(): Vec2 {
        return this._originalPos;
    }
    public get interval(): number[] {
        return this._interval;
    }
    public get range(): number {
        return this._range;
    }
    public get patrolTargetPos(): Vec2 {
        return this._patrolTargetPos;
    }


    public get moveSpeed(): number {
        return this._moveSpeed;
    }
    public get commonMoveTilePos(): TilePos {
        return this._commonMoveTilePos;
    }

    public constructor(type: MapPioneerLogicType) {
        this._type = type;
        this._moveSpeed = -1;
    }

    private _type: MapPioneerLogicType;
    private _step: number;
    private _cd: number;
    private _currentCd: number;
    private _direction: number;
    private _repeat: number;
    private _targetPos: Vec2;

    private _originalPos: Vec2;
    private _interval: number[];
    private _range: number;
    private _patrolTargetPos: Vec2;

    private _moveSpeed: number;
    private _commonMoveTilePos: TilePos;
}