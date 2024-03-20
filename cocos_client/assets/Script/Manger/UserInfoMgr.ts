import { Asset, __private, resources, sys } from "cc";
import ItemData, { ItemType } from "../Model/ItemData";
import { GameMain } from "../GameMain";
import { ResourceCorrespondingItem } from "../Const/ConstDefine";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";
import ArtifactData from "../Model/ArtifactData";
import { UserInfoEvent, FinishedEvent, InnerBuildingType, UserInnerBuildInfo, GenerateTroopInfo } from "../Const/Manager/UserInfoDefine";
import { BuildingMgr, CountMgr, ItemMgr, LvlupMgr, PioneerMgr, TaskMgr } from "../Utils/Global";
import { CountType } from "../Const/Manager/CountDefine";

export default class UserInfoMgr {

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
        task.currentStep = 0;
        const step = task.steps[task.currentStep];
        for (const templeWinAction of step.startaction) {
            for (const observe of this._observers) {
                if (observe.triggerTaskStepAction) {
                    observe.triggerTaskStepAction(templeWinAction.type, templeWinAction.delaytime != null ? templeWinAction.delaytime : 0);
                }
            }
        }
        this._currentTasks.push(task);
        this._localJsonData.playerData.currentTasks = this._currentTasks;
        this._localDataChanged(this._localJsonData);
        for (const observer of this._observers) {
            if (observer.getNewTask) {
                observer.getNewTask(task);
            }
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
                            if (observe.triggerTaskStepAction) {
                                observe.triggerTaskStepAction(templeStartAction.type, templeStartAction.delaytime != null ? templeStartAction.delaytime : 0);
                            }
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
                        if (observe.taskFailed) {
                            observe.taskFailed(task.id);
                        }
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
                        if (observe.taskFailed) {
                            observe.taskFailed(task.id);
                        }
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
                if (observer.finishEvent) {
                    observer.finishEvent(step);
                }
            }
        }
    }
    public upgradeBuild(buildID: InnerBuildingType) {
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

            CountMgr.addNewCount({
                type: CountType.buildInnerBuilding,
                timeStamp: new Date().getTime(),
                data: {
                    bId: buildID,
                    level: buildInfo.buildLevel,
                }
            });
        }
    }
    public getExplorationReward(boxId: string) {
        this._gettedExplorationRewardIds.push(boxId);
        this._localJsonData.playerData.gettedExplorationRewardIds = this._gettedExplorationRewardIds;
        this._localDataChanged(this._localJsonData);

        CountMgr.addNewCount({
            type: CountType.openBox,
            timeStamp: new Date().getTime(),
            data: {
                id: boxId
            }
        });
    }

    public beginGenerateTroop(leftTime: number, troopNum: number) {
        this._generateTroopInfo = {
            countTime: leftTime,
            troopNum: troopNum
        };
        this._localJsonData.playerData.generateTroopInfo = this._generateTroopInfo;
        this._localDataChanged(this._localJsonData);

        CountMgr.addNewCount({
            type: CountType.generateTroops,
            timeStamp: new Date().getTime(),
            data: {
                num: troopNum
            }
        });
    }

    public get afterTalkItemGetData() {
        return this._afterTalkItemGetData;
    }
    public get afterCivilizationClosedShowItemDatas() {
        return this._afterCivilizationClosedShowItemDatas;
    }
    public get afterCivilizationClosedShowArtifactDatas() {
        return this._afterCivilizationClosedShowArtifactDatas;
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
    public get exp() {
        return this._exp;
    }
    public get cityVision() {
        return this._cityVision;
    }
    public get innerBuilds(): Map<string, UserInnerBuildInfo> {
        return this._innerBuilds;
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
        this._isFinishRookie = value;
        this._localJsonData.playerData.isFinishRookie = value;
        if (value) {
            this.finishEvent(FinishedEvent.FirstTalkToProphetess);
        }
        this._localDataChanged(this._localJsonData);
    }
    public set playerName(value: string) {
        this._playerName = value;
        this._localJsonData.playerData.playerName = value;
        this._localDataChanged(this._localJsonData);

        for (const observe of this._observers) {
            if (observe.playerNameChanged) {
                observe.playerNameChanged(value);
            }
        }
    }
    public set exp(value: number) {
        const original = this._exp;
        this._exp = value;

        let isLvlup: boolean = false;
        let parseLv: boolean = true;
        const nextLvConfigs = [];
        do {
            const lvlConfig = LvlupMgr.getConfigByLvl(this._level);
            const nextLvConfig = LvlupMgr.getConfigByLvl(this._level + 1);
            if (nextLvConfig != null) {
                if (this._exp >= lvlConfig[0].exp) {
                    isLvlup = true;
                    this._level += 1;
                    this._exp -= lvlConfig[0].exp;
                    this.cityVision += nextLvConfig[0].city_vision;

                    nextLvConfigs.push(nextLvConfig);
                }
                else {
                    parseLv = false;
                }
            }
            else {
                parseLv = false;
            }
        }
        while (parseLv);

        this._localJsonData.playerData.exp = this._exp;
        this._localJsonData.playerData.level = this._level;
        this._localDataChanged(this._localJsonData);

        if (value != original) {
            for (const observe of this._observers) {
                if (observe.playerExpChanged != null) {
                    observe.playerExpChanged(value - original);
                }
            }
        }

        if (isLvlup) {
            for (let i = 0; i < nextLvConfigs.length; i++) {
                const nextLvConfig = nextLvConfigs[i];

                for (const observe of this._observers) {
                    if (observe.playerLvlupChanged != null) {
                        observe.playerLvlupChanged(this._level);
                    }
                }

                // hpmax
                if (nextLvConfig[0].hp_max > 0) {
                    PioneerMgr.pioneerChangeAllPlayerOriginalHpMax(nextLvConfig[0].hp_max);
                }

                // event_building
                if (nextLvConfig[0].event_building != null) {
                    for (const buidingId of nextLvConfig[0].event_building) {
                        BuildingMgr.showBuilding(buidingId);
                    }
                }

                // reward
                if (nextLvConfig[0].reward != null) {
                    ItemConfigDropTool.getItemByConfig(nextLvConfig[0].reward, false);
                }
            }
        }
    }
    public set cityVision(value: number) {
        const original = this._cityVision;
        this._cityVision = value;
        this._localJsonData.playerData.cityVision = value;
        this._localDataChanged(this._localJsonData);
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
    public set afterCivilizationClosedShowItemDatas(itemDatas: ItemData[]) {
        this._afterCivilizationClosedShowItemDatas = itemDatas;
    }
    public set afterCivilizationClosedShowArtifactDatas(artifactDatas: ArtifactData[]) {
        this._afterCivilizationClosedShowArtifactDatas = artifactDatas;
    }

    public constructor() {
        setInterval(() => {
            if (this._generateTroopInfo != null) {
                if (this._generateTroopInfo.countTime > 0) {
                    this._generateTroopInfo.countTime -= 1;
                }
                if (this._generateTroopInfo.countTime <= 0) {
                    ItemMgr.addItem([new ItemData(ResourceCorrespondingItem.Troop, this._generateTroopInfo.troopNum)]);
                    this._generateTroopInfo = null;
                }
                for (const observe of this._observers) {
                    if (observe.generateTroopTimeCountChanged) {
                        observe.generateTroopTimeCountChanged(this._generateTroopInfo == null ? 0 : this._generateTroopInfo.countTime);
                    }
                }
                this._localJsonData.playerData.generateTroopInfo = this._generateTroopInfo;
                this._localDataChanged(this._localJsonData);
            }
        }, 1000);
    }


    private _afterTalkItemGetData: Map<string, ItemData[]> = new Map();
    private _afterCivilizationClosedShowItemDatas: ItemData[] = [];
    private _afterCivilizationClosedShowArtifactDatas: ArtifactData[] = [];

    private _currentTasks: any[] = [];
    private _finishedEvents: FinishedEvent[] = [];
    private _isFinishRookie: boolean = false;

    private _playerID: string = null;
    private _playerName: string = null;
    private _level: number = null;
    private _exp: number = null;
    private _cityVision: number = null;
    private _innerBuilds: Map<string, UserInnerBuildInfo> = null;

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
        this._exp = jsonObject.playerData.exp;
        this._cityVision = jsonObject.playerData.cityVision;

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
                if (observe.taskProgressChanged) {
                    observe.taskProgressChanged(task.id);
                }
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
            // task exp
            if (step.exp != null) {
                this.exp += step.exp;
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
                    this.getNewTask(TaskMgr.getTaskById(splitDatas[1]));

                } else if (splitDatas[0] == "gameover") {
                    for (const observe of this._observers) {
                        if (observe.gameTaskOver) {
                            observe.gameTaskOver();
                        }
                    }
                } else {
                    for (const observe of this._observers) {
                        if (observe.triggerTaskStepAction) {
                            observe.triggerTaskStepAction(templeWinAction.type, templeWinAction.delaytime != null ? templeWinAction.delaytime : 0);
                        }
                    }
                }
            }

            // reward backpack item
            if (step.rewardBackpackItem != null) {
                const addItems: ItemData[] = [];
                for (const r of step.rewardBackpackItem) {
                    let itemConf = ItemMgr.getItemConf(r.itemConfigId);
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
                    addItems.push(new ItemData(r.itemConfigId, r.num));
                }
                if (addItems.length > 0) {
                    ItemMgr.addItem(addItems);
                    setTimeout(()=> {
                        if (GameMain.inst.UI.civilizationLevelUpUI.node.active) {
                            this.afterCivilizationClosedShowItemDatas.push(...addItems);
                        } else {
                            GameMain.inst.UI.itemInfoUI.showItem(addItems, true);
                        }
                    });
                }
            }

            if (step.afterTalkRewardItem != null) {
                let talkId: string = null;
                const addItems: ItemData[] = [];
                for (const r of step.afterTalkRewardItem) {
                    let itemConf = ItemMgr.getItemConf(r.itemConfigId);
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
                    talkId = r.talkId;
                    addItems.push(new ItemData(r.itemConfigId, r.num));
                }
                ItemMgr.addItem(addItems);
                if (talkId != null) {
                    this._afterTalkItemGetData.set(talkId, addItems);
                }
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

    private _levelup() {

    }
}