import { _decorator, Button, Component, EventHandler, instantiate, Label, Layout, math, Node } from 'cc';
import { GameMain } from '../GameMain';
import { PlayerItemUI } from './PlayerItemUI';
import { TilePos } from '../Game/TiledMap/TileTool';
import { EventName } from '../Const/ConstDefine';
import { PioneerMgrEvent } from '../Const/Manager/PioneerMgrDefine';
import { BuildingMgr, NotificationMgr, PioneerMgr } from '../Utils/Global';
import { MapPioneerActionType } from '../Const/Model/MapPioneerModelDefine';
import MapPioneerModel, { MapPlayerPioneerModel, MapPioneerLogicModel } from '../Game/Outer/Model/MapPioneerModel';
const { ccclass, property } = _decorator;

@ccclass('PlayerListUI')
export class PlayerListUI extends Component implements PioneerMgrEvent {

    @property(Node)
    playerLayout: Node = null;

    private _playerItem: Node = null;
    private _playerItems: Node[] = [];

    private _pioneers: MapPlayerPioneerModel[] = [];

    private _started: boolean = false;
    private _dataLoaded: boolean = false;
    protected onLoad(): void {
        this._playerItem = this.playerLayout.children[0];
        {
            const itemButton = this._playerItem.getComponent(Button);
            const evthandler = new EventHandler();
            evthandler._componentName = "PlayerListUI";
            evthandler.target = this.node;
            evthandler.handler = "onTapPlayerItem";
            itemButton.clickEvents.push(evthandler);
        }
        this._playerItem.active = false;

        NotificationMgr.addListener(EventName.LOADING_FINISH, this.loadOver, this);
        NotificationMgr.addListener(EventName.CHANGE_LANG, this.changeLang, this);
    }

    start() {
        PioneerMgr.addObserver(this);
        this._started = true;
        this._startAction();
    }

    protected onDestroy(): void {
        PioneerMgr.removeObserver(this);
        NotificationMgr.removeListener(EventName.LOADING_FINISH, this.loadOver, this);
        NotificationMgr.removeListener(EventName.CHANGE_LANG, this.changeLang, this);
    }

    private loadOver() {
        this._dataLoaded = true;
        this.changeLang();
        this._startAction();
    }

    private changeLang() {
        if (this.node.active === false) return;

        // useLanMgr
        // this.node.getChildByName("title").getComponent(Label).string = LanMgr.getLanById("107549");
    }

    private _startAction() {
        if (this._started && this._dataLoaded) {
            this.refreshPlayerList();
        }
    }

    refreshPlayerList() {
        this._pioneers = [];
        for (const temple of PioneerMgr.getPlayerPioneer()) {
            if (temple.show ||
                (!temple.show && temple.rebirthCountTime > 0)) {
                this._pioneers.push(temple);
            }
        }
        let i = 0;
        for (i; i < this._pioneers.length; i++) {
            let item: Node = null;
            if (i < this._playerItems.length) {
                item = this._playerItems[i];
            } else {
                item = instantiate(this._playerItem);
                item.setParent(this.playerLayout);
                this._playerItems.push(item);
                this.playerLayout.getComponent(Layout).updateLayout();
            }
            item.active = true;
            item.getComponent(PlayerItemUI).refreshUI(this._pioneers[i]);
            item.getComponent(Button).clickEvents[0].customEventData = i.toString();
        }
        for (i + 1; i < this._playerItems.length; i++) {
            this._playerItems[i].destroy();
            this._playerItems.splice(i, 1);
            i -= 1;
        }
    }

    update(deltaTime: number) {

    }

    private onTapPlayerItem(event: Event, customEventData: string) {
        const index = parseInt(customEventData);
        BuildingMgr.hideBuilding("decorate_2");
        if (GameMain.inst.OutScene.active) {
            if (index < this._pioneers.length) {
                const currentMapPos = this._pioneers[index].stayPos;
                if (currentMapPos != null) {
                    const currentWorldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(currentMapPos.x, currentMapPos.y);
                    GameMain.inst.MainCamera.node.worldPosition = currentWorldPos;
                }
                PioneerMgr.changeCurrentActionPioneer(this._pioneers[index].id);
                this.refreshPlayerList();
            }
        }
    }

    clsoelick() {

    }
    private async onTapForceStop() {
        const selfPioneer = await PioneerMgr.getPlayerPioneer();
        for (const pioneer of selfPioneer) {
            if (pioneer.show) {
                PioneerMgr.pioneerForceStopMove(pioneer.id);
            }
        }
    }
    //------------------------------------
    //PioneerMgrEvent
    pioneerActionTypeChanged(pioneerId: string, actionType: MapPioneerActionType, actionEndTimeStamp: number): void {
        this.refreshPlayerList();
    }
    pioneerHpMaxChanged(pioneerId: string): void {
        this.refreshPlayerList();
    }
    pioneerAttackChanged(pioneerId: string): void {
        this.refreshPlayerList();
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
        this.refreshPlayerList();
    }
    destroyOnePioneer(pioneerId: string): void {
        this.refreshPlayerList();
    }

    pioneerTaskBeenGetted(pioneerId: string, taskId: string): void {

    }
    showGetTaskDialog(taskId: string): void {

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
    pioneerLoseHp(pioneerId: string, value: number): void {
        this.refreshPlayerList();
    }
    pioneerGainHp(pioneerId: string, value: number): void {
        this.refreshPlayerList();
    }
    pionerrRebirthCount(pioneerId: string, count: number): void {
        this.refreshPlayerList();
    }
    pioneerRebirth(pioneerId: string): void {
        this.refreshPlayerList();
    }
    pioneerShowCount(pioneerId: string, count: number): void {

    }
    playerPioneerShowMovePath(pioneerId: string, path: TilePos[]): void {
        
    }
}


