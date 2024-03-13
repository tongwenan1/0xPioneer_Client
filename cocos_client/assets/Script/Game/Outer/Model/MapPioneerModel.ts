import { Vec2, Vec3, log, v2 } from "cc";
import { FinishedEvent } from "../../../Manger/UserInfoMgr";
import { TilePos } from "../../TiledMap/TileTool";

export enum MapPioneerActionType {
    dead = "dead",
    wakeup = "wakeup",
    idle = "idle",
    defend = "defend",
    moving = "moving",
    mining = "mining",
    fighting = "fighting",
    exploring = "exploring",
    eventing = "eventing",
    addingtroops = "addingtroops"
}

export enum MapPioneerType {
    player = "1",
    npc = "2",
    hred = "4",
    gangster = "3",
}

export enum MapPioneerLogicType {
    stepmove = 2,
    targetmove = 1,
    hide = 3,
    patrol = 4,
    commonmove = -1,
}

export enum MapPioneerMoveDirection {
    left = "left",
    right = "right",
    top = "top",
    bottom = "bottom",
}

export enum MapPioneerAttributesChangeType {
    ADD = 1,
    MUL = 2,
}

export enum MapPioneerEventStatus {
    None,
    Waiting,
    Waited
}

export interface MapPioneerAttributesChangeModel {
    type: MapPioneerAttributesChangeType;
    value: number;
}

export default class MapPioneerModel {
    // hp
    public gainOriginalHpMax(value: number) {
        this._originalHpMax += value;

        this._hpMax = this._originalHpMax;
        for (const model of this._hpMaxChanges) {
            if (model.type == MapPioneerAttributesChangeType.ADD) {
                this._hpMax += model.value;
            } else if (model.type == MapPioneerAttributesChangeType.MUL) {
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
        if (model.type == MapPioneerAttributesChangeType.ADD) {
            this._hpMax += model.value;
        } else if (model.type == MapPioneerAttributesChangeType.MUL) {
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
            if (model.type == MapPioneerAttributesChangeType.ADD) {
                this._attack += model.value;
            } else if (model.type == MapPioneerAttributesChangeType.MUL) {
                this._attack += (model.value * this._originalAttack);
            }
        }
        this._attack = Math.max(0, this._attack);
    }
    
    public changeAttack(model: MapPioneerAttributesChangeModel) {
        this._attackChanges.push(model);
        if (model.type == MapPioneerAttributesChangeType.ADD) {
            this._attack += model.value;
        } else if (model.type == MapPioneerAttributesChangeType.MUL) {
            this._attack += (model.value * this._originalAttack);
        }
        this._attack = Math.max(0, this._attack);
    }
    // defend
    public gainOriginalDefend(value: number) {
        this._originalDefend += value;
        this._defend = this._originalDefend;
        for (const model of this._defendChanges) {
            if (model.type == MapPioneerAttributesChangeType.ADD) {
                this._defend += model.value;
            } else if (model.type == MapPioneerAttributesChangeType.MUL) {
                this._defend += (model.value * this._originalDefend);
            }
        }
        this._defend = Math.max(0, this._defend);
    }
    public changeDefend(model: MapPioneerAttributesChangeModel) {
        this._defendChanges.push(model);
        if (model.type == MapPioneerAttributesChangeType.ADD) {
            this._defend += model.value;
        } else if (model.type == MapPioneerAttributesChangeType.MUL) {
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

    public set friendly(value: boolean) {
        this._friendly = value;
    }
    public set animType(value: string) {
        this._animType = value;
    }
    public set show(value: boolean) {
        this._show = value;
    }
    public set showCountTime(value: number) {
        this._showCountTime = value;
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
    public set drop(value: any[]) {
        this._drop = value;
    }


    public get show(): boolean {
        return this._show;
    }
    public get showCountTime(): number {
        return this._showCountTime;
    }
    public get id(): string {
        return this._id;
    }
    public get friendly(): boolean {
        return this._friendly;
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
    public get drop(): any[] {
        return this._drop;
    }


    public constructor(show: boolean, showCountTime: number, id: string, friendly: boolean, type: MapPioneerType, name: string, originalHpMax: number, hpMax: number, hp: number, originalAttack: number, attack: number, originalDefend: number, defend: number, stayPos: Vec2) {
        this._show = show;
        this._showCountTime = showCountTime;
        this._id = id;
        this._friendly = friendly;
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
        this._drop = [];
    }

    private _show: boolean;
    private _showCountTime: number;
    private _id: string;
    private _friendly: boolean;
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
    private _drop: any[];
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


    public set rebirthCountTime(value: number) {
        this._rebirthCountTime = value;
    }

    public constructor(show: boolean, showCountTime: number, id: string, friendly: boolean, type: MapPioneerType, name: string, originalHpMax: number, hpMax: number, hp: number, originalAttack: number, attack: number, originalDefend: number, defend: number, stayPos: Vec2) {
        super(show, showCountTime, id, friendly, type, name, originalHpMax, hpMax, hp, originalAttack, attack, originalDefend, defend, stayPos);
        this._rebirthCountTime = 0;
    }

    private _rebirthCountTime: number;
}

export class MapNpcPioneerModel extends MapPioneerModel {

    public set taskObj(value: any) {
        this._taskObj = value;
    }
    public set hideTaskIds(value: string[]) {
        this._hideTaskIds = value;
    }
    public set taskHideTime(value: number) {
        this._taskHideTime = value;
    }
    public set taskCdEndTime(value: number) {
        this._taskCdEndTime = value;
    }

    public get taskObj(): any {
        return this._taskObj;
    }
    public get hideTaskIds(): string[] {
        return this._hideTaskIds;
    }
    public get taskHideTime(): number {
        return this._taskHideTime;
    }
    public get taskCdEndTime(): number {
        return this._taskCdEndTime;
    }

    public constructor(show: boolean, showCountTime: number, id: string, friendly: boolean, type: MapPioneerType, name: string, originalHpMax: number, hpMax: number, hp: number, originalAttack: number, attack: number, originalDefend: number, defend: number, stayPos: Vec2) {
        super(show, showCountTime, id, friendly, type, name, originalHpMax, hpMax, hp, originalAttack, attack, originalDefend, defend, stayPos);
        this._taskObj = null;
        this._hideTaskIds = [];
        this._taskHideTime = -1;
        this._taskCdEndTime = 0;
    }

    private _taskObj: any;
    private _hideTaskIds: string[];
    private _taskHideTime: number;
    private _taskCdEndTime: number;
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

    public set condition(value: FinishedEvent) {
        this._condition = value;
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
    public get condition(): FinishedEvent {
        return this._condition;
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
    private _condition: FinishedEvent;
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