import { _decorator, Component, instantiate, math, misc, Node, pingPong, Prefab, Quat, quat, sp, tween, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { OuterFightView } from '../Game/Outer/View/OuterFightView';
import { OuterOtherPioneerView } from '../Game/Outer/View/OuterOtherPioneerView';
import { MapItemMonster } from '../Game/Outer/View/MapItemMonster';
import { MapPioneer } from '../Game/Outer/View/MapPioneer';
import { TestMapBG } from './TestMapBG';
import { EventName } from '../Const/ConstDefine';
import { PioneerMgr, TaskMgr, UserInfoMgr } from '../Utils/Global';
import { MapPioneerType } from '../Const/Model/MapPioneerModelDefine';
import { MapNpcPioneerModel } from '../Game/Outer/Model/MapPioneerModel';
import NotificationMgr from '../Basic/NotificationMgr';


const { ccclass, property } = _decorator;

@ccclass('TestOuterPioneerController') 
export class TestOuterPioneerController extends Component {
    @property(Prefab)
    private selfPioneer: Prefab;

    @property(Prefab)
    private otherPioneer;

    @property(Prefab)
    private battleSmall;

    @property(Prefab)
    private fightPrefab: Prefab;

    @property(Prefab)
    private footPathPrefab: Prefab;

    @property(TestMapBG)
    private mapBG;

    private _pioneerMap: Map<string, Node> = new Map();
    private _movingPioneerIds: string[] = [];
    private _fightViewMap: Map<string, OuterFightView> = new Map();
    private _footPathMap: Map<string, Node[]> = new Map();

    private _started: boolean = false;
    private _dataLoaded: boolean = false;
    protected onLoad(): void {
        
        this._pioneerMap = new Map();
        NotificationMgr.addListener(EventName.LOADING_FINISH, this.onLocalDataLoadOver, this);
    }

    start() {
        this._started = true;
        this._startAction();
    }

    protected onDestroy(): void {
        
    }

    private _startAction() {
        if (this._started && this._dataLoaded) {
            this._refreshUI();
            // recover, set, task, getTaskDialogShow, etc
            PioneerMgr.recoverLocalState();
            // checkRookie
        }
    }

    private _refreshUI() {
        const allPioneers = PioneerMgr.getAllPioneer();
        for (const pioneer of allPioneers) {
            if (pioneer.show) {
                let firstInit: boolean = false;
                let temple = null;
                if (this._pioneerMap.has(pioneer.id)) {
                    temple = this._pioneerMap.get(pioneer.id);

                } else {
                    // new
                    if (pioneer.type == MapPioneerType.player) {
                        temple = instantiate(this.selfPioneer);

                    } else if (pioneer.type == MapPioneerType.npc ||
                        pioneer.type == MapPioneerType.gangster) {
                        temple = instantiate(this.otherPioneer);

                    } else if (pioneer.type == MapPioneerType.hred) {
                        temple = instantiate(this.battleSmall);
                    }
                    temple.setParent(this.node);
                    firstInit = true;
                    this._pioneerMap.set(pioneer.id, temple);
                }
                if (temple != null) {
                    if (pioneer.type == MapPioneerType.player) {
                        temple.getComponent(MapPioneer).refreshUI(pioneer);

                    } else if (pioneer.type == MapPioneerType.npc) {
                        const npcModel = pioneer as MapNpcPioneerModel;
                        const task = TaskMgr.getTaskByNpcId(pioneer.id, npcModel.friendly, npcModel.hideTaskIds, UserInfoMgr.currentTaskIds, UserInfoMgr.finishedEvents);
                        if (npcModel.taskObj == null &&
                            task != null) {
                            // npc get task
                            npcModel.taskObj = task;
                            if (task.entrypoint.hidetimecount != null) {
                                npcModel.taskHideTime = task.entrypoint.hidetimecount;
                            }
                            if (task.entrypoint.cdtimecount != null) {
                                npcModel.taskCdEndTime = task.entrypoint.cdtimecount;
                            }
                        } else if (task == null &&
                            npcModel.taskObj != null) {
                            // npc lose task
                            npcModel.taskObj = null;
                        }
                        temple.getComponent(OuterOtherPioneerView).refreshUI(pioneer);

                    } else if (pioneer.type == MapPioneerType.gangster) {
                        temple.getComponent(OuterOtherPioneerView).refreshUI(pioneer);

                    } else if (pioneer.type == MapPioneerType.hred) {
                        temple.getComponent(MapItemMonster).refreshUI(pioneer, UserInfoMgr.finishedEvents);
                    }
                    if (firstInit) {
                        let worldPos = this.mapBG.getPosWorld(pioneer.stayPos.x, pioneer.stayPos.y);
                        temple.setWorldPosition(worldPos);
                    }
                }
            } else {
                if (this._pioneerMap.has(pioneer.id)) {
                    this._pioneerMap.get(pioneer.id).destroy();
                    this._pioneerMap.delete(pioneer.id);
                }
            }
        }

        // destroy 
        this._pioneerMap.forEach((value: Node, key: string) => {
            let isExsit: boolean = false;
            for (const pioneer of allPioneers) {
                if (pioneer.id == key) {
                    isExsit = true;
                    break;
                }
            }
            if (!isExsit) {
                value.destroy();
                this._pioneerMap.delete(key);
            }
        });
    }

    private onLocalDataLoadOver() {
        this._dataLoaded = true;
        this._startAction();
    }
}


