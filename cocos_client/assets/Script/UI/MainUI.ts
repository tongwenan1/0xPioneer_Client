import { _decorator, Component, Node, Button, SpriteFrame, Sprite, Label, Prefab, instantiate, tiledLayerAssembler, Tween, v3, tween, math, randomRangeInt, Color, LabelOutline, ImageAsset } from 'cc';
import { GameMain } from '../GameMain';
import EventMgr from '../Manger/EventMgr';
import PioneerMgr, { PioneerMgrEvent } from '../Manger/PioneerMgr';
import UserInfo, { FinishedEvent, UserInfoEvent } from '../Manger/UserInfoMgr';
import LocalDataLoader from '../Manger/LocalDataLoader';

import { ECursorStyle, MouseCursor } from './MouseCursor';
import ItemMgr from '../Manger/ItemMgr';
import { TilePos } from '../Game/TiledMap/TileTool';
import MapPioneerModel, { MapPioneerActionType, MapPioneerLogicModel } from '../Game/Outer/Model/MapPioneerModel';


import { BaseUI } from '../BasicView/BaseUI';
import { PopUpUI } from '../BasicView/PopUpUI';
import { ClaimRewardUI } from './ClaimRewardUI';
import { EventUI } from './Outer/EventUI';
import { SecretGuardGettedUI } from './Outer/SecretGuardGettedUI';
import { TreasureGettedUI } from './TreasureGettedUI';
import { TaskListUI } from './TaskListUI';
import { BackpackUI } from './BackpackUI';
import { ItemInfoUI } from './ItemInfoUI';
import { FactoryInfoUI } from './Inner/FactoryInfoUI';
import { MainBuildUI } from './Inner/MainBuildUI';
import { DialogueUI } from './Outer/DialogueUI';
import { RecruitUI } from './Inner/RecruitUI';
import { ResOprUI } from './Outer/ResOprUI';
import { EventName } from '../Basic/ConstDefine';

const { ccclass, property } = _decorator;

@ccclass('MainUI')
export class MainUI extends BaseUI implements PioneerMgrEvent, UserInfoEvent {

    @property(Node)
    UIRoot: Node;
    
    @property([ImageAsset])
    cursorImages : ImageAsset[] = [];

    @property(Prefab)
    mainBuildUIPfb: Prefab;

    @property(Prefab)
    factoryInfoUIPfb: Prefab;

    @property(Prefab)
    ResOprPfb: Prefab;

    @property(Prefab)
    private dialoguePrefab: Prefab;
    @property(Prefab)
    private secretGuardGettedPrefab: Prefab;
    @property(Prefab)
    private treasureGettedPrefab: Prefab;
    @property(Prefab)
    private taskListPrefab: Prefab;
    @property(Prefab)
    private recruitPrefab: Prefab;
    @property(Prefab)
    private eventPrefab: Prefab;


    @property(Prefab)
    BackpackUIPfb: Prefab;
    
    @property(Prefab)
    ItemInfoUIPfb: Prefab;
    
    @property([SpriteFrame])
    ResourceIconSpriteFrame: SpriteFrame[] = [];

    public mainBuildUI: MainBuildUI;
    public factoryInfoUI: FactoryInfoUI;
    public resOprUI: ResOprUI;

    public dialogueUI: DialogueUI;
    public serectGuardGettedUI: SecretGuardGettedUI;
    public treasureGettedUI: TreasureGettedUI;
    public taskListUI: TaskListUI;
    public recruitUI: RecruitUI;
    public eventUI: EventUI;

    public backpackUI: BackpackUI;
    public itemInfoUI: ItemInfoUI;

    private _claimRewardUI: ClaimRewardUI;

    @property(Node)
    public leftUI: Node = null;

    @property(Node)
    public btnBuild: Node = null;

    @property(Button)
    backpackBtn:Button = null;
    
    private _gangsterComingTipView: Node = null;

    onLoad(): void {
        MouseCursor.SetCursorStyle(ECursorStyle.url, this.cursorImages[0].nativeUrl);

        this._gangsterComingTipView = this.node.getChildByName("GangsterTipView");
        this._gangsterComingTipView.active = false;

        PioneerMgr.instance.addObserver(this);
        UserInfo.Instance.addObserver(this);
    }

    async start() {

        let mainBuildUINode = instantiate(this.mainBuildUIPfb);
        mainBuildUINode.setParent(this.UIRoot);

        let factoryInfoUINode = instantiate(this.factoryInfoUIPfb);
        factoryInfoUINode.setParent(this.UIRoot);

        let resOprUINode = instantiate(this.ResOprPfb);
        resOprUINode.setParent(this.UIRoot);


        this.mainBuildUI = mainBuildUINode.getComponent(MainBuildUI);
        this.factoryInfoUI = factoryInfoUINode.getComponent(FactoryInfoUI);
        this.resOprUI = resOprUINode.getComponent(ResOprUI);


        this.dialogueUI = instantiate(this.dialoguePrefab).getComponent(DialogueUI);
        this.dialogueUI.node.setParent(this.UIRoot);
        this.dialogueUI.node.active = false;


        this.serectGuardGettedUI = instantiate(this.secretGuardGettedPrefab).getComponent(SecretGuardGettedUI);
        this.serectGuardGettedUI.node.setParent(this.UIRoot);
        this.serectGuardGettedUI.node.active = false;

        this.treasureGettedUI = instantiate(this.treasureGettedPrefab).getComponent(TreasureGettedUI);
        this.treasureGettedUI.node.setParent(this.UIRoot);
        this.treasureGettedUI.node.active = false;

        this.taskListUI = instantiate(this.taskListPrefab).getComponent(TaskListUI);
        this.taskListUI.node.setParent(this.UIRoot);
        this.taskListUI.node.active = false;

        this.recruitUI = instantiate(this.recruitPrefab).getComponent(RecruitUI);
        this.recruitUI.node.setParent(this.UIRoot);
        this.recruitUI.node.active = false;

        this.eventUI = instantiate(this.eventPrefab).getComponent(EventUI);
        this.eventUI.node.setParent(this.UIRoot);
        this.eventUI.node.active = false;

        this.backpackUI = instantiate(this.BackpackUIPfb).getComponent(BackpackUI);
        this.backpackUI.node.setParent(this.UIRoot);
        this.backpackUI.node.active = false;
        this.itemInfoUI = instantiate(this.ItemInfoUIPfb).getComponent(ItemInfoUI);
        this.itemInfoUI.node.setParent(this.UIRoot);
        this.itemInfoUI.node.active = false;

        this._claimRewardUI = this.node.getChildByName("reward_ui").getComponent(ClaimRewardUI);

        EventMgr.on(EventName.SCENE_CHANGE, this.onSceneChange, this);

        if (LocalDataLoader.instance.loadStatus == 0) {
            await LocalDataLoader.instance.loadLocalDatas();
        }
        EventMgr.emit("Event_LoadOver");
        
        const bigGanster = PioneerMgr.instance.getPioneerById("gangster_3");
        if (bigGanster != null && bigGanster.show) {
            this.checkCanShowGansterComingTip(bigGanster.id);
        }

        
        this.backpackBtn.node.on(Button.EventType.CLICK, ()=>{
            GameMain.inst.UI.backpackUI.show(true);
        }, this);
    }

    update(deltaTime: number) {

    }

    onDestroy(): void {
        PioneerMgr.instance.removeObserver(this);
        UserInfo.Instance.removeObserver(this);
    }

    onSceneChange() {

        PopUpUI.hideAllShowingPopUpUI();
        // this.LoadingUINode.active = true;

        // let thisptr = this;
        // tween(this.LoadingUINode)
        //     .delay(1.5)
        //     .to(0, { active: false })
        //     .call(() => {

        // if (GameMain.inst.isInnerScene()) {
        //     thisptr.leftUI.active = false;
        //     //thisptr.btnBuild.active = true;
        //     this.btnBuild.active = false; // for Debug ...
        // }
        // else {
        //     thisptr.leftUI.active = true;
        //     thisptr.btnBuild.active = false;
        // }
        // })
        // .start();


        // if(GameMain.inst.isInnerScene()) {
        //     this.leftUI.active = false;
        //     //this.btnBuild.active = true;
        //     this.btnBuild.active = false; // for Debug ...
        // }
        // else {
        //     this.leftUI.active = true;
        //     this.btnBuild.active = false;
        // }

    }

    onBuliClick() {

    }

    // index : 0:normal, 1:gear, 2:forbiden
    public ChangeCursor(index:number) {
        if(index >= this.cursorImages.length) {
            index = 0;
        }
        
        MouseCursor.SetCursorStyle(ECursorStyle.url, this.cursorImages[index].nativeUrl);
        //MouseCursor.SetCursorStyle(ECursorStyle.crosshair);
    }

    public ShowTip(str: string) {
        let node = new Node();
        node.setParent(this.UIRoot);
        let label = node.addComponent(Label);
        label.string = str;
        label.fontSize = 30;

        // TO DO : change color by input parameter
        label.color = Color.RED;
        let labelOutline = node.addComponent(LabelOutline);
        labelOutline.color = Color.BLACK;
        labelOutline.width = 3;

        let action = new Tween(node);
        action.to(0.2, { position: v3(0, 200, 0) });
        action.delay(1.5);
        action.call(() => {
            node.destroy();
        });
        action.start();
    }

    private checkCanShowGansterComingTip(pioneerId: string) {
        if (pioneerId == "gangster_3" && UserInfo.Instance.finishedEvents.indexOf(FinishedEvent.KillDoomsDayGangTeam) != -1) {
            this._gangsterComingTipView.active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamComing").active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing").active = false;
        }
    }

    private padZero(num: number): string {
        return num < 10 ? `0${num}` : `${num}`;
    }

    private secondsToTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const formattedHours = this.padZero(hours);
        const formattedMinutes = this.padZero(minutes);
        const formattedSeconds = this.padZero(remainingSeconds);

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    //------------------------------------------
    // PioneerMgrEvent
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
        this.checkCanShowGansterComingTip(pioneerId);
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

    beginFight(fightId: string, attacker: { name: string; hp: number; hpMax: number; }, defender: { name: string; hp: number; hpMax: number; }, attackerIsSelf: boolean, fightPositions: math.Vec2[]): void {

    }
    fightDidAttack(fightId: string, attacker: { name: string; hp: number; hpMax: number; }, defender: { name: string; hp: number; hpMax: number; }, attackerIsSelf: boolean, fightPositions: math.Vec2[]): void {

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
    pioneerShowCount(pioneerId: string, count: number): void {
        if (pioneerId == "gangster_3" && count > 0) {
            this._gangsterComingTipView.active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamComing").active = false;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing").active = true;
            this._gangsterComingTipView.getChildByPath("Bg/BigTeamWillComing/Tip").getComponent(Label).string = "Big Team Coming: " + this.secondsToTime(count);
        }
    }
    playerPioneerShowMovePath(pioneerId: string, path: TilePos[]): void {

    }

    //-----------------------------------------------------------------
    //userInfoEvent
    playerNameChanged(value: string): void {

    }
    playerEnergyChanged?(value: number): void {

    }
    playerMoneyChanged?(value: number): void {

    }
    playerFoodChanged?(value: number): void {

    }
    playerWoodChanged?(value: number): void {

    }
    playerStoneChanged?(value: number): void {

    }
    playerTroopChanged?(value: number): void {

    }
    playerExplorationValueChanged?(value: number): void {
        this._claimRewardUI.refreshUI();
    }
    getNewTask(taskId: string): void {

    }
    triggerTaskStepAction(action: string, delayTime: number): void {

    }
    finishEvent(event: FinishedEvent): void {

    }
    getProp(propId: string, num: number): void {

    }
    gameTaskOver(): void {
        this._gangsterComingTipView.active = false;
    }
    taskProgressChanged(taskId: string): void {
        
    }
    taskFailed(taskId: string): void {
        
    }
    generateTroopTimeCountChanged(leftTime: number): void {
        
    }
}

