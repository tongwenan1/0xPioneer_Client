import { Asset, __private, resources, sys } from "cc";
import TaskMgr from "./TaskMgr";
import ItemMgr from "./ItemMgr";
import ItemData from "../Model/ItemData";
import { GameMain } from "../GameMain";
import { ItemInfoShowModel } from "../UI/ItemInfoUI";

export interface UserInnerBuildInfo {
    buildID: string,
    buildLevel: number,
    buildUpTime: number,
    buildName: string,
}

export interface ResourceModel {
    id: string;
    num: number
}

export interface GenerateTroopInfo {
    countTime: number;
    troopNum: number;
}

export enum FinishedEvent {
    FirstTalkToProphetess = "FirstTalkToProphetess",
    KillDoomsDayGangTeam = "KillDoomsDayGangTeam",
    KillProphetess = "KillProphetess",
    BecomeCityMaster = "BecomeCityMaster",
}

export interface UserInfoEvent {
    playerNameChanged(value: string): void;
    playerEnergyChanged?(value: number): void;
    playerMoneyChanged?(value: number): void;
    playerFoodChanged?(value: number): void;
    playerWoodChanged?(value: number): void;
    playerStoneChanged?(value: number): void;
    playerTroopChanged?(value: number): void;

    playerExplorationValueChanged?(value: number): void;

    getNewTask(taskId: string): void;
    triggerTaskStepAction(action: string, delayTime: number): void;
    finishEvent(event: FinishedEvent): void;
    taskProgressChanged(taskId: string): void;
    taskFailed(taskId: string): void;

    gameTaskOver(): void;

    generateTroopTimeCountChanged(leftTime: number): void;
}

export default class UserInfoMgr {

    public static get Instance() {
        if (!this._instance) {
            this._instance = new UserInfoMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public addObserver(observer: UserInfoEvent) {
        this._observers.push(observer);
    }
    public removeObserver(observer: UserInfoEvent) {
        const index: number = this._observers.indexOf(observer);
        if (index != -1) {
            this._observers.splice(index, 1);
        }
    }

    public getNewTask(task: any) {
        if (task.id == "task01") {
            this.isFinishRookie = true;
            this.finishEvent(FinishedEvent.FirstTalkToProphetess);
        }
        task.currentStep = 0;
        const step = task.steps[task.currentStep];
        for (const templeWinAction of step.startaction) {
            for (const observe of this._observers) {
                observe.triggerTaskStepAction(templeWinAction.type, templeWinAction.delaytime != null ? templeWinAction.delaytime : 0);
            }
        }
        this._currentTasks.push(task);
        this._localJsonData.playerData.currentTasks = this._currentTasks;
        this._localDataChanged(this._localJsonData);
        for (const observer of this._observers) {
            observer.getNewTask(task);
        }
        if (task.steps[task.currentStep].condwin.length <= 0) {
            this.checkCanFinishedTask("", "");
        }
    }
    public checkCanFinishedTask(actionType: string, pioneerId: string) {
        if (actionType == "killpioneer") {
            if (pioneerId == "gangster_1") {
                this.finishEvent(FinishedEvent.KillDoomsDayGangTeam);
            } else if (pioneerId == "npc_0") {
                this.finishEvent(FinishedEvent.KillProphetess);
            }
        }
        for (const task of this._currentTasks) {
            if (task.finished != null && task.finished) {
                continue;
            }
            if (task.fail != null && task.fail) {
                continue;
            }
            const step = task.steps[task.currentStep];
            if (step.condwinStep == null) {
                step.condwinStep = 0;
            }
            let taskStepForward: boolean = false;
            // deal with addition task
            for (const templeStep of task.steps) {
                if (templeStep.addition == true) {
                    if (this._dealWithTaskStepProgress(task, templeStep, actionType, pioneerId)) {
                        // each addition task first done will add taskstepindex
                        task.currentStep += 1;
                        taskStepForward = true;
                    }
                }
            }
            // deal with cur not addition step
            if (step.addition != true && step.condwin != null && step.over != true) {
                if (this._dealWithTaskStepProgress(task, step, actionType, pioneerId)) {
                    task.currentStep += 1;
                    taskStepForward = true;
                }
            }
            if (taskStepForward) {
                if (task.currentStep > task.steps.length - 1) {
                    // task over
                    task.finished = true;
                } else {
                    // next step startaction
                    for (const templeStartAction of task.steps[task.currentStep].startaction) {
                        for (const observe of this._observers) {
                            observe.triggerTaskStepAction(templeStartAction.type, templeStartAction.delaytime != null ? templeStartAction.delaytime : 0);
                        }
                    }
                }
            }
        }
        this._localJsonData.playerData.currentTasks = this._currentTasks;
        this._localDataChanged(this._localJsonData);
    }

    public pioneerHideBuildingCheckTaskFail(pioneerid: string, buildingid: string) {
        for (const task of this._currentTasks) {
            if (task.finished != null && task.finished) {
                continue;
            }
            if (task.fail != null && task.fail) {
                continue;
            }
            const step = task.steps[task.currentStep];
            if (step.condfail == null) {
                continue;
            }
            for (let i = 0; i < step.condfail.length; i++) {
                const temple = step.condfail[i];
                if (temple.type == "pioneerhidebuilding" &&
                    temple.pioneerid == pioneerid &&
                    temple.buildingid == buildingid) {
                    task.fail = true;
                    for (const observe of this._observers) {
                        observe.taskFailed(task.id);
                    }
                    break;
                }
            }
        }
        this._localJsonData.playerData.currentTasks = this._currentTasks;
        this._localDataChanged(this._localJsonData);
    }
    public hidePioneerCheckTaskFail(pioneerid: string) {
        for (const task of this._currentTasks) {
            if (task.finished != null && task.finished) {
                continue;
            }
            if (task.fail != null && task.fail) {
                continue;
            }
            const step = task.steps[task.currentStep];
            if (step.condfail == null) {
                continue;
            }
            for (let i = 0; i < step.condfail.length; i++) {
                const temple = step.condfail[i];
                if (temple.type == "pioneerhide" &&
                    temple.pioneerid == pioneerid) {
                    task.fail = true;
                    for (const observe of this._observers) {
                        observe.taskFailed(task.id);
                    }
                    break;
                }
            }
        }
    }

    public finishEvent(step: FinishedEvent) {
        if (this._finishedEvents.indexOf(step) == -1) {
            this._finishedEvents.push(step);
            this._localJsonData.playerData.finishedEvents = this._finishedEvents;
            this._localDataChanged(this._localJsonData);
            for (const observer of this._observers) {
                observer.finishEvent(step);
            }
        }
    }
    public upgradeBuild(buildID: string) {
        const buildInfo = this._innerBuilds.get(buildID);
        if (buildInfo != null) {
            buildInfo.buildLevel += 1;
            this._innerBuilds.set(buildID, buildInfo);
            this._localJsonData.innerBuildData[buildID].buildLevel = buildInfo.buildLevel;
            this._localDataChanged(this._localJsonData);

            if (buildInfo.buildID == "4") {
                // build house
                this.checkCanFinishedTask("buildhouse", "-1");
            }
        }
    }
    public getExplorationReward(boxId: string) {
        this._gettedExplorationRewardIds.push(boxId);
        this._localJsonData.playerData.gettedExplorationRewardIds = this._gettedExplorationRewardIds;
        this._localDataChanged(this._localJsonData);
    }

    public beginGenerateTroop(leftTime: number, troopNum: number) {
        this._generateTroopInfo = {
            countTime: leftTime,
            troopNum: troopNum
        };
        this._localJsonData.playerData.generateTroopInfo = this._generateTroopInfo;
        this._localDataChanged(this._localJsonData);
    }

    public get currentTasks() {
        return this._currentTasks;
    }
    public get currentTaskIds() {
        const ids = [];
        for (const task of this._currentTasks) {
            ids.push(task.id);
        }
        return ids;
    }
    public get finishedEvents() {
        return this._finishedEvents;
    }
    public get isFinishRookie() {
        return this._isFinishRookie;
    }

    public get playerID() {
        return this._playerID;
    }
    public get playerName() {
        return this._playerName;
    }
    public get level() {
        return this._level;
    }
    public get money() {
        return this._money;
    }
    public get energy() {
        return this._energy;
    }
    public get exp() {
        return this._exp;
    }
    public get innerBuilds(): Map<string, UserInnerBuildInfo> {
        return this._innerBuilds;
    }
    public get food() {
        return this._food;
    }
    public get wood() {
        return this._wood;
    }
    public get stone() {
        return this._stone;
    }
    public get troop() {
        return this._troop;
    }
    public get explorationValue() {
        return this._explorationValue;
    }
    public get gettedExplorationRewardIds() {
        return this._gettedExplorationRewardIds;
    }
    public get isGeneratingTroop() {
        return this._generateTroopInfo != null;
    }



    public set isFinishRookie(value: boolean) {
        this._isFinishRookie = true;
        this._localJsonData.playerData.isFinishRookie = value;
        this._localDataChanged(this._localJsonData);
    }
    public set playerName(value: string) {
        this._playerName = value;
        this._localJsonData.playerData.playerName = value;
        this._localDataChanged(this._localJsonData);

        for (const observe of this._observers) {
            observe.playerNameChanged(value);
        }
    }
    public set energy(value: number) {
        const original = this._energy;
        this._energy = value;
        this._localJsonData.playerData.energy = value;
        this._localDataChanged(this._localJsonData);

        if (this._energy != original) {
            for (const observe of this._observers) {
                if (observe.playerEnergyChanged != null) {
                    observe.playerEnergyChanged(this._energy - original);
                }
            }
        }
    }
    public set money(value: number) {
        const original = this._money;
        this._money = value;
        this._localJsonData.playerData.money = value;
        this._localDataChanged(this._localJsonData);

        if (this._money != original) {
            for (const observe of this._observers) {
                if (observe.playerMoneyChanged != null) {
                    observe.playerMoneyChanged(this._money - original);
                }
            }
        }
    }
    public set food(value: number) {
        const original = this._food;
        this._food = value;
        this._localJsonData.playerData.food = value;
        this._localDataChanged(this._localJsonData);

        if (this._food != original) {
            if (this._food != original) {
                for (const observe of this._observers) {
                    if (observe.playerFoodChanged != null) {
                        observe.playerFoodChanged(this._food - original);
                    }
                }
            }
        }
    }
    public set wood(value: number) {
        const original = this._wood;
        this._wood = value;
        this._localJsonData.playerData.wood = value;
        this._localDataChanged(this._localJsonData);

        if (this._wood != original) {
            for (const observe of this._observers) {
                if (observe.playerWoodChanged != null) {
                    observe.playerWoodChanged(this._wood - original);
                }
            }
        }
    }
    public set stone(value: number) {
        const original = this._stone;
        this._stone = value;
        this._localJsonData.playerData.stone = value;
        this._localDataChanged(this._localJsonData);

        if (this._stone != original) {
            for (const observe of this._observers) {
                if (observe.playerStoneChanged != null) {
                    observe.playerStoneChanged(this._stone - original);
                }
            }
        }
    }
    public set troop(value: number) {
        const original = this._troop;
        this._troop = Math.max(0, value);
        this._localJsonData.playerData.troop = this._troop;
        this._localDataChanged(this._localJsonData);

        if (this._troop != original) {
            for (const observe of this._observers) {
                if (observe.playerTroopChanged != null) {
                    observe.playerTroopChanged(this._troop - original);
                }
            }
        }
    }
    public set explorationValue(value: number) {
        const original = this._explorationValue;
        this._explorationValue = value;
        this._localJsonData.playerData.explorationValue = value;
        this._localDataChanged(this._localJsonData);

        if (this._explorationValue != original) {
            for (const observe of this._observers) {
                if (observe.playerExplorationValueChanged != null) {
                    observe.playerExplorationValueChanged(this._explorationValue - original);
                }
            }
        }
    }


    public constructor() {
        setInterval(() => {
            if (this._generateTroopInfo != null) {
                if (this._generateTroopInfo.countTime > 0) {
                    this._generateTroopInfo.countTime -= 1;
                }
                if (this._generateTroopInfo.countTime <= 0) {
                    this.troop += this._generateTroopInfo.troopNum;
                    this._generateTroopInfo = null;
                }
                for (const observe of this._observers) {
                    observe.generateTroopTimeCountChanged(this._generateTroopInfo == null ? 0 : this._generateTroopInfo.countTime);
                }
                this._localJsonData.playerData.generateTroopInfo = this._generateTroopInfo;
                this._localDataChanged(this._localJsonData);
            }
        }, 1000);
    }

    private static _instance: UserInfoMgr = null;

    private _currentTasks: any[] = [];
    private _finishedEvents: FinishedEvent[] = [];
    private _isFinishRookie: boolean = false;

    private _playerID: string = null;
    private _playerName: string = null;
    private _level: number = null;
    private _money: number = null;
    private _energy: number = null;
    private _exp: number = null;
    private _innerBuilds: Map<string, UserInnerBuildInfo> = null;

    private _food: number = null;
    private _wood: number = null
    private _stone: number = null;
    private _troop: number = null;

    private _explorationValue: number = 0;
    private _gettedExplorationRewardIds: string[] = [];

    private _generateTroopInfo: GenerateTroopInfo = null;

    private _localJsonData: any = null;

    private _observers: UserInfoEvent[] = [];
    private _localStorageKey: string = "user_Info";
    private async _initData() {
        let jsonObject: any = null;
        const localData = sys.localStorage.getItem(this._localStorageKey);
        if (localData != null) {
            jsonObject = JSON.parse(localData);

        } else {
            jsonObject = await new Promise((resolve, reject) => {
                resources.load("data_local/user_Info", (err: Error, data: any) => {
                    if (err) {
                        resolve(null);
                        return;
                    }
                    resolve(data.json);
                });
            });
            // localsave
            this._localDataChanged(jsonObject);
        }
        this._localJsonData = jsonObject;
        if (jsonObject == null) {
            return;
        }
        this._playerID = jsonObject.playerData.playerID;
        this._playerName = jsonObject.playerData.playerName;
        this._level = jsonObject.playerData.level;
        this._money = jsonObject.playerData.money;
        this._energy = jsonObject.playerData.energy;
        this._exp = jsonObject.playerData.exp;
        this._food = jsonObject.playerData.food;
        this._wood = jsonObject.playerData.wood;
        this._stone = jsonObject.playerData.stone;
        this._troop = jsonObject.playerData.troop;

        if (jsonObject.playerData.currentTasks != null) {
            this._currentTasks = jsonObject.playerData.currentTasks;
        }
        if (jsonObject.playerData.finishedEvents != null) {
            this._finishedEvents = jsonObject.playerData.finishedEvents;
        }
        if (jsonObject.playerData.isFinishRookie != null) {
            this._isFinishRookie = jsonObject.playerData.isFinishRookie;
        }
        if (jsonObject.playerData.explorationValue != null) {
            this._explorationValue = jsonObject.playerData.explorationValue;
        }
        if (jsonObject.playerData.gettedExplorationRewardIds != null) {
            this._gettedExplorationRewardIds = jsonObject.playerData.gettedExplorationRewardIds;
        }
        if (jsonObject.playerData.generateTroopInfo != null) {
            this._generateTroopInfo = jsonObject.playerData.generateTroopInfo;
        }

        this._innerBuilds = new Map();
        for (let id in jsonObject.innerBuildData) {
            const innerBuildInfo: UserInnerBuildInfo = {
                buildID: jsonObject.innerBuildData[id].buildID,
                buildLevel: jsonObject.innerBuildData[id].buildLevel,
                buildUpTime: jsonObject.innerBuildData[id].buildUpTime,
                buildName: jsonObject.innerBuildData[id].buildName,
            };
            this._innerBuilds.set(id, innerBuildInfo);
        }
    }


    private _dealWithTaskStepProgress(task: any, step: any, actionType: string, pioneerId: string): boolean {
        // step progress changed
        let taskForceOver: boolean = step.condwin.length == 0;
        if (!taskForceOver) {
            const temple = step.condwin[step.condwinStep].type.split("|");
            if (temple.length == 1) {
                if (temple[0] == actionType) {
                    step.condwinStep += 1;
                }
            } else if (temple.length == 2) {
                if (temple[0] == actionType &&
                    temple[1] == pioneerId) {
                    step.condwinStep += 1;
                }
            }
            for (const observe of this._observers) {
                observe.taskProgressChanged(task.id);
            }
        }
        if (taskForceOver ||
            (step.condwinStep > step.condwin.length - 1)) {
            // step over
            step.over = true;
            // progress
            if (step.progress != null) {
                this.explorationValue += step.progress;
            }

            // winaction
            for (const templeWinAction of step.winaction) {
                let canUseAction: boolean = true;
                if (step.winActionAndRewardAdditionStepAlias != null &&
                    templeWinAction.condi != null) {
                    let additionStepProgress: number = 0;
                    for (const templeStep of task.steps) {
                        if (templeStep.alias == step.winActionAndRewardAdditionStepAlias) {
                            additionStepProgress = templeStep.condwinStep;
                            break;
                        }
                    }
                    if (templeWinAction.condi.limitcount != additionStepProgress) {
                        canUseAction = false;
                    }
                }
                if (!canUseAction) {
                    continue;
                }
                const splitDatas = templeWinAction.type.split("|");
                if (splitDatas[0] == "gettask") {
                    this.getNewTask(TaskMgr.Instance.getTaskById(splitDatas[1]));

                } else if (splitDatas[0] == "gameover") {
                    for (const observe of this._observers) {
                        observe.gameTaskOver();
                    }
                } else {
                    for (const observe of this._observers) {
                        observe.triggerTaskStepAction(templeWinAction.type, templeWinAction.delaytime != null ? templeWinAction.delaytime : 0);
                    }
                }
            }

            // reward backpack item
            if (step.rewardBackpackItem != null) {
                const showDatas: ItemInfoShowModel[] = [];
                for (const r of step.rewardBackpackItem) {
                    let itemConf = ItemMgr.Instance.getItemConf(r.itemConfigId);
                    if (!itemConf) {
                        continue;
                    }
                    let canUseAction: boolean = true;
                    if (step.winActionAndRewardAdditionStepAlias != null &&
                        r.condi != null) {
                        let additionStepProgress: number = 0;
                        for (const templeStep of task.steps) {
                            if (templeStep.alias == step.winActionAndRewardAdditionStepAlias) {
                                additionStepProgress = templeStep.condwinStep;
                                break;
                            }
                        }
                        if (r.condi.limitcount != additionStepProgress) {
                            canUseAction = false;
                        }
                    }
                    if (!canUseAction) {
                        continue;
                    }

                    showDatas.push({
                        itemConfig: itemConf,
                        count: r.num
                    });
                }
                GameMain.inst.UI.itemInfoUI.showItem(showDatas, true);
            }
        }
        let canStepForward: boolean = false;
        if (step.addition) {
            // first change progress add condwinstep
            if (step.condwinStep == 1) {
                canStepForward = true;
            }
        } else {
            canStepForward = step.over == true;
        }
        // step can forward
        return canStepForward;
    }

    private _localDataChanged(jsonObject: any) {
        if (jsonObject != null) {
            sys.localStorage.setItem(this._localStorageKey, JSON.stringify(jsonObject));
        }
    }
}