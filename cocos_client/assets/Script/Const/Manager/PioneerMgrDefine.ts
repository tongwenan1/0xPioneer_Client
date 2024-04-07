import { Vec2 } from "cc";
import { TilePos } from "../../Game/TiledMap/TileTool";
import MapPioneerModel, { MapPioneerLogicModel } from "../../Game/Outer/Model/MapPioneerModel";
import { MapPioneerActionType } from "../Model/MapPioneerModelDefine";

export interface PioneerMgrEvent {
    pioneerActionTypeChanged(pioneerId: string, actionType: MapPioneerActionType, actionEndTimeStamp: number): void;

    pioneerHpMaxChanged(pioneerId: string): void;
    pioneerAttackChanged(pioneerId: string): void;
    pioneerGainHp?(pioneerId: string, value: number): void;
    pioneerLoseHp(pioneerId: string, value: number): void;
    pionerrRebirthCount(pioneerId: string, count: number): void;
    pioneerRebirth(pioneerId: string): void;

    pioneerDidShow(pioneerId: string): void;
    pioneerDidHide(pioneerId: string): void;

    pioneerFactionChanged?(pioneerId: string): void;

    addNewOnePioneer(newPioneer: MapPioneerModel): void;
    destroyOnePioneer(pioneerId: string): void;

    beginFight?(fightId: string, attacker: { id: string, name: string, hp: number, hpMax: number }, defender: { id: string, isBuilding: boolean, name: string, hp: number, hpMax: number }, attackerIsSelf: boolean, fightPositions: Vec2[]): void;
    fightDidAttack?(fightId: string, attacker: { id: string, name: string, hp: number, hpMax: number }, defender: { id: string, isBuilding: boolean, name: string, hp: number, hpMax: number }, attackerIsSelf: boolean, fightPositions: Vec2[]): void;
    endFight?(fightId: string, isEventFightOver: boolean, isDeadPionner: boolean, deadId: string, isPlayerWin: boolean, playerPioneerId: string): void;

    exploredPioneer(pioneerId: string): void;
    exploredBuilding(buildingId: string): void;
    miningBuilding(actionPioneerId: string, buildingId: string): void;
    eventBuilding(actionPioneerId: string, buildingId: string, eventId: string): void;

    pioneerTaskHideTimeCountChanged(pioneerId: string, timeCount: number): void;
    pioneerTaskCdTimeCountChanged(pioneerId: string, timeCount: number): void;
    pioneerLogicMovePathPrepared?(pioneer: MapPioneerModel, logic: MapPioneerLogicModel): void;
    pioneerLogicMoveTimeCountChanged(pioneer: MapPioneerModel): void;
    pioneerLogicMove(pioneer: MapPioneerModel, logic: MapPioneerLogicModel): void;

    pioneerShowCount(pioneerId: string, count: number): void;

    playerPioneerShowMovePath(pioneerId: string, path: TilePos[]): void;

    playerPioneerDidMoveOneStep?(pioneerId: string): void;
}