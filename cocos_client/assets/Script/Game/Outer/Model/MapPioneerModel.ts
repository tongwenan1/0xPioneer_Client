import { Vec2, Vec3, log, v2 } from "cc";
import { FinishedEvent } from "../../../Manger/UserInfoMgr";
import { TilePos } from "../../TiledMap/TileTool";

export enum MapPioneerActionType {
    idle = "idle",
    defend = "defend",
    moving = "moving",
    mining = "mining",
    fighting = "fighting",
    exploring = "exploring",
    addingtroops = "addingtroops"
}

export enum MapPioneerType {
    player = "player",
    npc = "npc",
    hred = "hred",
    gangster = "gangster",
}

export enum MapPioneerLogicType {
    stepmove = "stepmove",
    targetmove = "targetmove",
    hide = "hide",
    patrol = "patrol"
}

export enum MapPioneerMoveDirection {
    left = "left",
    right = "right",
    top = "top",
    bottom = "bottom",
}

export default class MapPioneerModel {

    public loseHpMax(value: number) {
        this._hpMax = Math.max(1, this.hpMax - value);
        this._hp = this._hpMax;
    }
    public loseAttack(value: number) {
        this._attack = Math.max(0, this._attack - value);
    }

    public loseHp(value: number) {
        this._hp = Math.max(0, this._hp - value);
    }
    public gainHp(value: number) {
        this._hp = Math.min(this._hpMax, this._hp + value);
    }
    public changeHpMax(value: number) {
        this._hpMax = Math.max(1, this._hpMax + value);
        this._hp = this._hpMax;
    }
    public gainAttack(value: number) {
        this._attack += value;
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
    public get hpMax(): number {
        return this._hpMax;
    }
    public get hp(): number {
        return this._hp;
    }
    public get attack(): number {
        return this._attack;
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


    public constructor(show: boolean, showCountTime: number, id: string, friendly: boolean, type: MapPioneerType, name: string, hpMax: number, hp: number, attack: number, stayPos: Vec2) {
        this._show = show;
        this._showCountTime = showCountTime;
        this._id = id;
        this._friendly = friendly;
        this._type = type;
        this._name = name;
        this._stayPos = stayPos;
        this._hpMax = hpMax;
        this._hp = hp;
        this._attack = attack;
        this._movePaths = [];
        this._actionType = MapPioneerActionType.idle;
        this._actionEndTimeStamp = 0;
        this._actionBeginTimeStamp = 0;
        this._logics = [];
        this._moveSpeed = -1;
        this._purchaseMovingPioneerId = null;
        this._winprogress = 0;
    }

    private _show: boolean;
    private _showCountTime: number;
    private _id: string;
    private _friendly: boolean;
    private _type: MapPioneerType;
    private _animType: string;
    private _moveDirection: MapPioneerMoveDirection;
    private _name: string;
    private _hpMax: number;
    private _hp: number;
    private _attack: number;
    private _stayPos: Vec2;
    private _movePaths: TilePos[];
    private _actionType: MapPioneerActionType;
    private _actionEndTimeStamp: number;
    private _actionBeginTimeStamp: number;
    private _logics: MapPioneerLogicModel[];
    private _moveSpeed: number;
    private _purchaseMovingPioneerId: string | null;
    private _purchaseMovingBuildingId: string | null;
    private _winprogress: number;
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

    public constructor(show: boolean, showCountTime: number, id: string, friendly: boolean, type: MapPioneerType, name: string, hpMax: number, hp: number, attack: number, stayPos: Vec2) {
        super(show, showCountTime, id, friendly, type, name, hpMax, hp, attack, stayPos);
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

    public constructor(show: boolean, showCountTime: number, id: string, friendly: boolean, type: MapPioneerType, name: string, hpMax: number, hp: number, attack: number, stayPos: Vec2) {
        super(show, showCountTime, id, friendly, type, name, hpMax, hp, attack, stayPos);
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

    public setStepMoveData(step: number, cd: number, currentCd: number, direction: Vec3, repeat: number) {
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
    public get direction(): Vec3 {
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

    public constructor(type: MapPioneerLogicType) {
        this._type = type;
        this._moveSpeed = -1;
    }

    private _type: MapPioneerLogicType;
    private _condition: FinishedEvent;
    private _step: number;
    private _cd: number;
    private _currentCd: number;
    private _direction: Vec3;
    private _repeat: number;
    private _targetPos: Vec2;

    private _originalPos: Vec2;
    private _interval: number[];
    private _range: number;
    private _patrolTargetPos: Vec2;

    private _moveSpeed: number;
}