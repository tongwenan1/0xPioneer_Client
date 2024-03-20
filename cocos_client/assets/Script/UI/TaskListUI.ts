import { _decorator, Button, color, Color, Component, instantiate, Label, Layout, Node, setDisplayStats, Sprite, tween, v3, Vec3 } from 'cc';
import { PopUpUI } from '../BasicView/PopUpUI';
import { GameMain } from '../GameMain';
import CommonTools from '../Tool/CommonTools';
import { EventName } from '../Const/ConstDefine';
import MapHelper from "db://assets/Script/Utils/MapHelper";
import { BuildingMgr, EventMgr, LanMgr, PioneerMgr, UserInfoMgr } from '../Utils/Global';

const { ccclass, property } = _decorator;

@ccclass('TaskListUI')
export class TaskListUI extends PopUpUI {


    public refreshUI() {

        // useLanMgr
        // this._actionTaskView.getChildByPath("Bg/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailTaskView.getChildByPath("Bg/Title").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailTaskView.getChildByPath("ToDoButton/Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailTaskView.getChildByPath("CompletedButton/Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailProgressFinishTitleItem.getChildByName("Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailProgressToDoTitleItem.getChildByName("Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._detailProgressUndoneTitleItem.getChildByName("Label").getComponent(Label).string = LanMgr.getLanById("107549");

        // clear
        for (const action of this._actionTaskList) {
            action.destroy();
        }
        this._actionTaskList = [];

        for (const detail of this._detailTaskList) {
            detail.destroy();
        }
        this._detailTaskList = [];
        for (const progress of this._detailProgressList) {
            progress.destroy();
        }
        this._detailProgressList = [];

        const taskInfo = UserInfoMgr.currentTasks;

        const finishedTasks = [];
        const toDoTasks = [];
        for (const task of taskInfo) {
            if (task.finished ||
                (task.fail != null && task.fail)) {
                finishedTasks.push(task);
            } else {
                toDoTasks.push(task);
            }
        }
        let actionTaskShowCount: number = 0;
        for (let i = toDoTasks.length - 1; i >= 0; i--) {
            if (actionTaskShowCount >= 3) {
                break;
            }
            actionTaskShowCount += 1;

            const curStep = toDoTasks[i].steps[toDoTasks[i].currentStep];
            const curStepCondIndex = curStep.condwinStep == null ? 0 : curStep.condwinStep;
            const action = instantiate(this._actionItem);
            action.active = true;

            // useLanMgr
            action.getChildByName("Title").getComponent(Label).string = LanMgr.getLanById(toDoTasks[i].name);
            action.getChildByName("SubTitle").getComponent(Label).string = LanMgr.getLanById(curStep.name);
            // action.getChildByName("Title").getComponent(Label).string = toDoTasks[i].name;
            // action.getChildByName("SubTitle").getComponent(Label).string = curStep.name;

            action.getChildByName("Progress").getComponent(Label).string = curStepCondIndex + "/" + curStep.condwin.length;
            action.getComponent(Button).clickEvents[0].customEventData = JSON.stringify(curStep);
            action.setParent(this._actionItem.getParent());
            this._actionTaskList.push(action);
        }

        // useLanMgr
        this._actionTaskView.getChildByPath("DetailButton/TaskNum").getComponent(Label).string = LanMgr.replaceLanById("202003", [taskInfo.length]) + " >>";
        // this._actionTaskView.getChildByPath("DetailButton/TaskNum").getComponent(Label).string = "All " + taskInfo.length + " Tasks";

        this._detailTaskView.active = this._isDetailShow;
        if (this._isDetailShow) {
            let showTasks = null;
            if (this._isDetailToDoShow) {
                showTasks = toDoTasks;
            } else {
                showTasks = finishedTasks;
            }
            showTasks.sort((a, b) => a.id.localeCompare(b.id));
            for (let i = 0; i < showTasks.length; i++) {
                const detail = instantiate(this._detailTaskItem);
                detail.active = true;

                // useLanMgr
                detail.getChildByName("Label").getComponent(Label).string = LanMgr.getLanById(showTasks[i].name);
                // detail.getChildByName("Label").getComponent(Label).string = showTasks[i].name;

                detail.getChildByName("Selected").active = i == this._detailSelectedIndex;
                detail.getComponent(Button).clickEvents[0].customEventData = i.toString();
                detail.setParent(this._detailTaskItem.getParent());
                this._detailTaskList.push(detail);
            }
            this._detailTaskItem.getParent().getComponent(Layout).updateLayout();

            if (this._detailSelectedIndex < showTasks.length) {
                this._detailTaskView.getChildByName("ProgressList").active = true;
                const curTask = showTasks[this._detailSelectedIndex];
                if (curTask.fail != null && curTask.fail) {
                    const unDoneTitleItem = instantiate(this._detailProgressUndoneTitleItem);
                    unDoneTitleItem.active = true;
                    unDoneTitleItem.setParent(this._detailProgressFinishTitleItem.getParent());
                    this._detailProgressList.push(unDoneTitleItem);
                } else {
                    // check has task finished
                    // 1- finished title 
                    // 2- finished task
                    // 3- todo title
                    // 4- todo task
                    const finishedDatas: { status: number, stepData: any }[] = [];
                    const todoDatas: { status: number, stepData: any }[] = [];
                    let hasFinishedTitle: boolean = false;
                    let hasToDoTitle: boolean = false;
                    for (let i = 0; i < curTask.steps.length; i++) {
                        const curStep = curTask.steps[i];
                        if (curStep.over == true) {
                            if (!hasFinishedTitle) {
                                hasFinishedTitle = true;
                                finishedDatas.push({ status: 1, stepData: null });
                            }
                            finishedDatas.push({ status: 2, stepData: curStep });

                        } else {
                            let additionStepBelongStepFinished: boolean = false;
                            if (curStep.addition) {
                                for (let j = 0; j < curTask.steps.length; j++) {
                                    const tempcurstep = curTask.steps[j];
                                    if (tempcurstep.alias != null &&
                                        tempcurstep.alias == curStep.belong &&
                                        tempcurstep.over) {
                                        additionStepBelongStepFinished = true;
                                        break;
                                    }
                                }
                            }
                            if (additionStepBelongStepFinished) {
                                if (!hasFinishedTitle) {
                                    hasFinishedTitle = true;
                                    finishedDatas.push({ status: 1, stepData: null });
                                }
                                finishedDatas.push({ status: 2, stepData: curStep });
                            } else {
                                if (!hasToDoTitle) {
                                    hasToDoTitle = true;
                                    todoDatas.push({ status: 3, stepData: null });
                                }
                                todoDatas.push({ status: 4, stepData: curStep });
                            }
                        }
                    }
                    for (const temple of [...finishedDatas, ...todoDatas]) {
                        if (temple.status == 1) {
                            const finishTitleItem = instantiate(this._detailProgressFinishTitleItem);
                            finishTitleItem.active = true;
                            finishTitleItem.setParent(this._detailProgressFinishTitleItem.getParent());
                            this._detailProgressList.push(finishTitleItem);
                            
                        } else if (temple.status == 2) {
                            const curStepCondIndex = temple.stepData.condwinStep == null ? 0 : temple.stepData.condwinStep;
                            const finish = instantiate(this._detailProgressFinishItem);
                            finish.active = true;
                            finish.setParent(this._detailProgressFinishItem.getParent());

                            // useLanMgr
                            finish.getChildByName("Title").getComponent(Label).string = LanMgr.getLanById(temple.stepData.name);
                            // finish.getChildByName("Title").getComponent(Label).string = temple.stepData.name;

                            finish.getChildByName("Progress").getComponent(Label).string = curStepCondIndex + "/" + temple.stepData.condwin.length;
                            this._detailProgressList.push(finish);

                        } else if (temple.status == 3) {
                            const toDoTitleItem = instantiate(this._detailProgressToDoTitleItem);
                            toDoTitleItem.active = true;
                            toDoTitleItem.setParent(this._detailProgressToDoTitleItem.getParent());
                            this._detailProgressList.push(toDoTitleItem);

                        } else if (temple.status == 4) {
                            const curStepCondIndex = temple.stepData.condwinStep == null ? 0 : temple.stepData.condwinStep;
                            const finish = instantiate(this._detailProgressToDoItem);
                            finish.active = true;
                            finish.setParent(this._detailProgressToDoItem.getParent());

                            // useLanMgr
                            finish.getChildByName("Title").getComponent(Label).string = LanMgr.getLanById(temple.stepData.name);
                            // finish.getChildByName("Title").getComponent(Label).string = temple.stepData.name;

                            finish.getChildByName("Progress").getComponent(Label).string = curStepCondIndex + "/" + temple.stepData.condwin.length;
                            this._detailProgressList.push(finish);
                        }
                    }
                }
                this._detailProgressToDoItem.getParent().getComponent(Layout).updateLayout();

            } else {
                this._detailTaskView.getChildByName("ProgressList").active = false;
            }
            this._toDoButton.getChildByName("Focus").active = this._isDetailToDoShow;
            this._toDoButton.getChildByName("Common").active = !this._isDetailToDoShow;
            this._toDoButton.getChildByName("Label").getComponent(Label).color = this._isDetailToDoShow ? new Color(66, 53, 36, 255) : new Color(123, 115, 112, 255);

            this._completedButton.getChildByName("Focus").active = !this._isDetailToDoShow;
            this._completedButton.getChildByName("Common").active = this._isDetailToDoShow;
            this._completedButton.getChildByName("Label").getComponent(Label).color = !this._isDetailToDoShow ? new Color(66, 53, 36, 255) : new Color(123, 115, 112, 255);
        }
    }

    private _isDetailShow: boolean = false;
    private _isDetailToDoShow: boolean = true;
    private _detailSelectedIndex: number = 0;

    private _actionTaskList: Node[] = [];
    private _detailTaskList: Node[] = [];
    private _detailProgressList: Node[] = [];

    private _actionTaskView: Node = null;
    private _detailTaskView: Node = null;
    private _actionItem: Node = null;
    private _detailTaskItem: Node = null;
    private _detailProgressFinishTitleItem: Node = null;
    private _detailProgressToDoTitleItem: Node = null;
    private _detailProgressUndoneTitleItem: Node = null;
    private _detailProgressFinishItem: Node = null;
    private _detailProgressToDoItem: Node = null;

    private _toDoButton: Node = null;
    private _completedButton: Node = null;

    public override get typeName(): string {
        return "TaskListUI";
    }

    onLoad(): void {
        this._actionTaskView = this.node.getChildByName("ActionTaskView");
        this._detailTaskView = this.node.getChildByName("TaskDetailView");

        this._actionItem = this._actionTaskView.getChildByPath("List/Item");
        this._actionItem.active = false;

        this._detailTaskItem = this._detailTaskView.getChildByPath("TaskList/view/content/Item");
        this._detailTaskItem.active = false;

        this._detailProgressFinishTitleItem = this._detailTaskView.getChildByPath("ProgressList/view/content/FinishTitle");
        this._detailProgressFinishTitleItem.active = false;
        this._detailProgressToDoTitleItem = this._detailTaskView.getChildByPath("ProgressList/view/content/ToDoTitle");
        this._detailProgressToDoTitleItem.active = false;
        this._detailProgressUndoneTitleItem = this._detailTaskView.getChildByPath("ProgressList/view/content/UnDoneTitle");
        this._detailProgressUndoneTitleItem.active = false;
        this._detailProgressFinishItem = this._detailTaskView.getChildByPath("ProgressList/view/content/FinishedItem");
        this._detailProgressFinishItem.active = false;
        this._detailProgressToDoItem = this._detailTaskView.getChildByPath("ProgressList/view/content/ToDoItem");
        this._detailProgressToDoItem.active = false;

        this._toDoButton = this.node.getChildByPath("TaskDetailView/ToDoButton");
        this._completedButton = this.node.getChildByPath("TaskDetailView/CompletedButton");

        EventMgr.on(EventName.CHANGE_LANG, this.refreshUI, this);

    }

    start() {
        this.refreshUI();
    }

    update(deltaTime: number) {

    }

    onDestroy(): void {
        EventMgr.off(EventName.CHANGE_LANG, this.refreshUI, this);
    }



    //---------------------------------------------------
    // action
    private onTapClose() {
        GameMain.inst.UI.taskListUI.show(false);
    }
    private onTapShowDetail() {
        if (this._isDetailShow) {
            return;
        }
        this._isDetailShow = true;
        this._detailSelectedIndex = 0;
        this.refreshUI();
    }
    private onTapActionItem(event: Event, customEventData: string) {
        const actionTaskCurStep = JSON.parse(customEventData);
        const curCondwinStep = actionTaskCurStep.condwinStep == null ? 0 : actionTaskCurStep.condwinStep;
        if (actionTaskCurStep.condwin != null && curCondwinStep < actionTaskCurStep.condwin.length) {
            const curCond = actionTaskCurStep.condwin[curCondwinStep];
            let currentMapPos = null;
            if (curCond.type == "buildhouse") {
                // not action
            } else if (curCond.type == "getresourcereached") {
                // resource
                const resourceBuildings = BuildingMgr.getResourceBuildings();
                const randomResourceBuilding = resourceBuildings[CommonTools.getRandomInt(0, resourceBuildings.length - 1)];
                currentMapPos = randomResourceBuilding.stayMapPositions[0];

            } else if (curCond.type.includes("|") && curCond.type.includes("building")) {
                // building
                const buildingId = curCond.type.split("|")[1];
                const currentBuilding = BuildingMgr.getBuildingById(buildingId);
                if (currentBuilding != null) {
                    currentMapPos = currentBuilding.stayMapPositions[0];
                }

            } else if (curCond.type.includes("|")) {
                // pioneer
                const pioneerId = curCond.type.split("|")[1];
                const currentPioneer = PioneerMgr.getPioneerById(pioneerId);
                if (currentPioneer != null) {
                    currentMapPos = currentPioneer.stayPos;
                }
            }
            if (currentMapPos != null) {
                MapHelper.highlightPosOnOuterMap(currentMapPos);
            }
        }
    }


    private onTapCloseDetail() {
        if (!this._isDetailShow) {
            return;
        }
        this._isDetailShow = false;
        this.refreshUI();
    }
    private onTapDetailToDo() {
        if (this._isDetailToDoShow) {
            return;
        }
        this._isDetailToDoShow = true;
        this._detailSelectedIndex = 0;
        this.refreshUI();
    }
    private onTapDetailCompleted() {
        if (!this._isDetailToDoShow) {
            return;
        }
        this._isDetailToDoShow = false;
        this._detailSelectedIndex = 0;

        this.refreshUI();
    }
    private onTapDetailTaskItem(event: Event, customEventData: string) {
        const index = parseInt(customEventData);
        if (index == this._detailSelectedIndex) {
            return;
        }
        this._detailSelectedIndex = index;
        this.refreshUI();
    }
}

