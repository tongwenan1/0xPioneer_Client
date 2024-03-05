import { _decorator, builtinResMgr, Component, instantiate, Node, Prefab, v2, v3, Vec2, Vec3, warn } from 'cc';
import { GameMain } from '../../GameMain';
import BuildingMgr, { BuildingMgrEvent } from '../../Manger/BuildingMgr';
import EventMgr from '../../Manger/EventMgr';
import PioneerMgr, { PioneerMgrEvent } from '../../Manger/PioneerMgr';
import TaskMgr from '../../Manger/TaskMgr';
import UserInfoMgr, { UserInfoEvent, FinishedEvent } from '../../Manger/UserInfoMgr';
import { TilePos } from '../TiledMap/TileTool';
import { MapBuildingType, BuildingFactionType } from './Model/MapBuildingModel';
import MapPioneerModel, { MapPioneerActionType, MapPioneerLogicModel } from './Model/MapPioneerModel';
import { OuterBuildingView } from './View/OuterBuildingView';
import { MapBG } from '../../Scene/MapBG';


const { ccclass, property } = _decorator;

@ccclass('OuterBuildingController')
export class OuterBuildingController extends Component implements UserInfoEvent, BuildingMgrEvent, PioneerMgrEvent {

    @property(Prefab) 
    private buildingPrefab;

    private _buildingMap: Map<string, { node: Node, stayPositons: Vec2[] }> = new Map();

    private _started: boolean = false;
    private _dataLoaded: boolean = false;
    protected onLoad() {
        EventMgr.on("Event_LoadOver", this.onLocalDataLoadOver, this);
        UserInfoMgr.Instance.addObserver(this);
        BuildingMgr.instance.addObserver(this);
        PioneerMgr.instance.addObserver(this);
    }

    start() {
        this._started = true;
        this._startAction();
    }

    update(deltaTime: number) {

    }

    protected onDestroy(): void {
        UserInfoMgr.Instance.removeObserver(this);
        BuildingMgr.instance.removeObserver(this);
        PioneerMgr.instance.removeObserver(this);
    }

    private onLocalDataLoadOver() {
        this._dataLoaded = true;
        this._startAction();
    }

    private _startAction() {
        if (this._started && this._dataLoaded) {
            this._refreshUI();
        }
    }

    private _refreshUI() {
        const decorationView = this.node.getComponent(MapBG).mapDecorationView();
        if (decorationView == null) {
            return;
        }
        let changed: boolean = false;
        const allBuildings = BuildingMgr.instance.getAllBuilding();
        for (const building of allBuildings) {
            if (building.show) {
                let temple = null;
                if (this._buildingMap.has(building.id)) {
                    temple = this._buildingMap.get(building.id).node;

                } else {
                    // new
                    temple = instantiate(this.buildingPrefab);
                    temple.setParent(decorationView);
                    this._buildingMap.set(building.id, { node: temple, stayPositons: building.stayMapPositions });

                    changed = true;
                }
                if (temple != null) {
                    temple.getComponent(OuterBuildingView).refreshUI(building, PioneerMgr.instance.getPlayerPioneer());
                    if (building.stayMapPositions.length > 0) {
                        let worldPos = null;
                        if (building.stayMapPositions.length == 7) {
                            worldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(building.stayMapPositions[3].x, building.stayMapPositions[3].y);
                        } else if (building.stayMapPositions.length == 3) {
                            const beginWorldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(building.stayMapPositions[0].x, building.stayMapPositions[0].y);
                            const endWorldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(building.stayMapPositions[1].x, building.stayMapPositions[1].y);
                            worldPos = v3(
                                beginWorldPos.x,
                                endWorldPos.y + (beginWorldPos.y - endWorldPos.y) / 2,
                                0
                            );
                        } else {
                            worldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(building.stayMapPositions[0].x, building.stayMapPositions[0].y);
                        }
                        temple.setWorldPosition(worldPos);
                    }
                }

            } else {
                if (this._buildingMap.has(building.id)) {
                    const data = this._buildingMap.get(building.id);
                    data.node.destroy();
                    for (const pos of data.stayPositons) {
                        // GameMain.inst.outSceneMap.mapBG.removeDynamicBlock(pos);
                    }
                    this._buildingMap.delete(building.id);
                }
            }
        }
        // destroy 
        this._buildingMap.forEach((value: { node: Node, stayPositons: Vec2[] }, key: string) => {
            let isExsit: boolean = false;
            for (const building of allBuildings) {
                if (building.id == key) {
                    isExsit = true;
                    break;
                }
            }
            if (!isExsit) {
                value.node.destroy();
                for (const pos of value.stayPositons) {
                    // GameMain.inst.outSceneMap.mapBG.removeDynamicBlock(pos);
                }
                this._buildingMap.delete(key);
            }
        });

        if (changed) {
            this.node.getComponent(MapBG).sortMapItemSiblingIndex();
        }
    }

    //-----------------------------------------------------------
    //UserInfoEvent
    playerNameChanged(value: string): void {
        
    }
    
    getNewTask(taskId: string): void {

    }
    triggerTaskStepAction(action: string): void {
        const temp = action.split("|");
        if (temp[0] == "buildingtoenemy" ||
            temp[0] == "buildingtoself" ||
            temp[0] == "buildinghide" ||
            temp[0] == "buildingshow") {
            BuildingMgr.instance.dealWithTaskAction(action);
        }
    }
    finishEvent(event: FinishedEvent): void {
        if (event == FinishedEvent.KillDoomsDayGangTeam) {
            const allBuildings = BuildingMgr.instance.getAllBuilding();
            for (const building of allBuildings) {
                if (building.type == MapBuildingType.city) {
                    const task = TaskMgr.Instance.getTaskByBuilding(building.id, UserInfoMgr.Instance.currentTaskIds, UserInfoMgr.Instance.finishedEvents);
                    BuildingMgr.instance.buildingGetTask(building.id, task);
                }
            }
        }
        this._refreshUI();
    }
    taskProgressChanged(taskId: string): void {
        
    }
    taskFailed(taskId: string): void {
        
    }

    getProp(propId: string, num: number): void {

    }

    gameTaskOver(): void {

    }
    generateTroopTimeCountChanged(leftTime: number): void {
        
    }

    //-----------------------------------------------------------
    //BuildingMgrEvent
    buildingFacitonChanged(buildingId: string, faction: BuildingFactionType): void {
        this._refreshUI();
    }
    buildingDefendPioneerChanged(buildingId: string, pioneerId: string): void {
        this._refreshUI();
    }
    buildingDidHide(buildingId: string, beacusePioneerId): void {
        this._refreshUI();
        UserInfoMgr.Instance.pioneerHideBuildingCheckTaskFail(beacusePioneerId, buildingId);
    }
    buildingDidShow(buildingId: string): void {
        this._refreshUI();
    }
    buildingInsertDefendPioneer(buildingId: string, pioneerId: string): void {
        this._refreshUI();
    }
    buildingRemoveDefendPioneer(buildingId: string, pioneerId: string): void {
        this._refreshUI();
    }


    //-----------------------------------------------------------
    //PioneerMgrEvent
    pioneerActionTypeChanged(pioneerId: string, actionType: MapPioneerActionType, actionEndTimeStamp: number): void {
        
    }
    pioneerDidGainHpMax(pioneerId: string, value: number): void {
        
    }
    pioneerDidGainAttack(pioneerId: string, value: number): void {
        
    }
    pioneerLoseHp(pioneerId: string, value: number): void {
        
    }
    pionerrRebirthCount(pioneerId: string, count: number): void {
        
    }
    pioneerRebirth(pioneerId: string): void {
        
    }
    pioneerDidShow(pioneerId: string): void {
        
    }
    pioneerDidHide(pioneerId: string): void {
        
    }
    pioneerDidNonFriendly(pioneerId: string): void {
        
    }
    pioneerDidFriendly(pioneerId: string): void {
        
    }
    addNewOnePioneer(newPioneer: MapPioneerModel): void {
        
    }
    destroyOnePioneer(pioneerId: string): void {
        
    }
    pioneerTaskBeenGetted(pioneerId: string, taskId: string): void {
        
    }
    showGetTaskDialog(task: any): void {
        
    }
    beginFight(fightId: string, attacker: { name: string; hp: number; hpMax: number; }, defender: { name: string; hp: number; hpMax: number; }, attackerIsSelf: boolean, fightPositions: Vec2[]): void {
        
    }
    fightDidAttack(fightId: string, attacker: { name: string; hp: number; hpMax: number; }, defender: { name: string; hp: number; hpMax: number; }, attackerIsSelf: boolean, fightPositions: Vec2[]): void {
        
    }
    endFight(fightId: string, isEventFightOver: boolean, isDeadPionner: boolean, deadId: string): void {
        
    }
    exploredPioneer(pioneerId: string): void {
        
    }
    exploredBuilding(buildingId: string): void {
        
    }
    miningBuilding(actionPioneerId: string, buildingId: string): void {
        
    }
    eventBuilding(actionPioneerId: string, buildingId: string, eventId: string): void {
        
    }
    pioneerTaskHideTimeCountChanged(pioneerId: string, timeCount: number): void {
        
    }
    pioneerTaskCdTimeCountChanged(pioneerId: string, timeCount: number): void {
        
    }
    pioneerLogicMoveTimeCountChanged(pioneer: MapPioneerModel): void {
        
    }
    pioneerLogicMove(pioneer: MapPioneerModel, logic: MapPioneerLogicModel): void {
        
    }
    pioneerLogicMovePathPrepared(pioneer: MapPioneerModel) {
    
    }
    pioneerShowCount(pioneerId: string, count: number): void {
        
    }
    playerPioneerShowMovePath(pioneerId: string, path: TilePos[]): void {
        
    }
}


