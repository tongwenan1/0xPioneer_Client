import { _decorator, Button, Component, EventHandler, instantiate, Label, Layout, Node, Sprite } from 'cc';
import { GameMain } from '../../GameMain';
import PioneerMgr from '../../Manger/PioneerMgr';
import ItemMgr from '../../Manger/ItemMgr';
import ItemData, { ItemConfigData, ItemType } from '../../Model/ItemData';
import BranchEventMgr from '../../Manger/BranchEventMgr';
import { PopUpUI } from '../../BasicView/PopUpUI';
import BuildingMgr from '../../Manger/BuildingMgr';
import CountMgr, { CountType } from '../../Manger/CountMgr';
import LanMgr from '../../Manger/LanMgr';
import EventMgr from '../../Manger/EventMgr';
import { EventName, ItemConfigType } from '../../Const/ConstDefine';
import SettlementMgr from '../../Manger/SettlementMgr';
import UserInfoMgr from '../../Manger/UserInfoMgr';
import { MapPioneerAttributesChangeModel } from '../../Game/Outer/Model/MapPioneerModel';
const { ccclass, property } = _decorator;

@ccclass('EventUI')
export class EventUI extends PopUpUI {

    public eventUIShow(triggerPioneerId: string, eventBuildingId: string, event: any, fightCallback: (pioneerId: string, enemyId: string, temporaryAttributes: Map<string, MapPioneerAttributesChangeModel>, fightOver: (succeed: boolean) => void) => void, dealWithNextEvent: (event: any) => void) {
        this._triggerPioneerId = triggerPioneerId;
        this._eventBuildingId = eventBuildingId;
        this._fightCallback = fightCallback;
        this._dealWithNextEvent = dealWithNextEvent;

        this._refreshUI(event);
    }

    public override get typeName() {
        return "EventUI";
    }

    private _triggerPioneerId: string = null;
    private _eventBuildingId: string = null;
    private _temporaryAttributes: Map<string, MapPioneerAttributesChangeModel> = new Map();
    private _fightCallback: (pioneerId: string, enemyId: string, temporaryAttributes: Map<string, MapPioneerAttributesChangeModel>, fightOver: (succeed: boolean) => void) => void = null;
    private _dealWithNextEvent: (event: any) => void = null;

    private _event: any = null;

    private _contentView: Node = null;

    private _dialogView: Node = null;
    private _dialogNextButton: Node = null;
    private _dialogFightButton: Node = null;
    private _dialogSelectView: Node = null;
    private _selectItem: Node = null;

    private _dialogSelectItems: Node[] = [];

    onLoad(): void {
        this._contentView = this.node.getChildByPath("content");

        this._dialogView = this._contentView.getChildByName("dialog");
        this._dialogNextButton = this._dialogView.getChildByName("nextButton");
        this._dialogFightButton = this._dialogView.getChildByName("fightButton");
        this._dialogSelectView = this._dialogView.getChildByName("selectView");
        this._selectItem = this._dialogSelectView.getChildByName("button");
        this._selectItem.active = false;

        EventMgr.on(EventName.CHANGE_LANG, this._refreshUI, this);
    }

    start() {

    }

    update(deltaTime: number) {

    }

    onDestroy(): void {
        EventMgr.off(EventName.CHANGE_LANG, this._refreshUI, this);
    }

    private _refreshUI(event: any) {
        if (event == null) {
            return;
        }
        this._event = event;
        // type = 1：text 
        // type = 2：select
        // type = 3：fight
        // type = 4：exchange
        // type = 5：Attributes
        // type = 6：jungle

        // useLanMgr
        // this._dialogView.getChildByPath("nextButton/Label").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
        // this._dialogView.getChildByPath("fightButton/Label").getComponent(Label).string = LanMgr.Instance.getLanById("107549");

        // useLanMgr
        this._dialogView.getChildByPath("content/label").getComponent(Label).string = LanMgr.Instance.getLanById(event.text);
        // this._dialogView.getChildByPath("content/label").getComponent(Label).string = event.text;

        this._dialogNextButton.active = false;
        this._dialogFightButton.active = false;
        this._dialogSelectView.active = false;

        this._contentView.active = true;

        if (event.type == 2) {
            if (event.select != null &&
                event.select_txt != null &&
                event.select.length == event.select_txt.length) {
                this._dialogSelectView.active = true;
                for (const item of this._dialogSelectItems) {
                    item.destroy();
                }
                this._dialogSelectItems = [];
                for (let i = 0; i < event.select_txt.length; i++) {
                    const item = instantiate(this._selectItem);
                    item.active = true;
                    item.setParent(this._dialogSelectView);

                    let conditionResult = null;
                    if (event.select_cond != null && i < event.select_cond.length) {
                        conditionResult = this._checkIsSatisfiedCondition(event.select_cond[i]);
                    }

                    // useLanMgr
                    item.getChildByName("label").getComponent(Label).string = conditionResult != null ? (conditionResult.satisfy ? LanMgr.Instance.getLanById(event.select_txt[i]) : conditionResult.tipText) : LanMgr.Instance.getLanById(event.select_txt[i]);
                    // item.getChildByName("label").getComponent(Label).string = conditionResult != null ? (conditionResult.satisfy ? event.select_txt[i] : conditionResult.tipText) : event.select_txt[i];

                    item.getComponent(Sprite).grayscale = conditionResult != null ? !conditionResult.satisfy : false;
                    item.getComponent(Button).interactable = conditionResult != null ? conditionResult.satisfy : true;
                    item.getComponent(Button).clickEvents[0].customEventData = event.select[i];
                    this._dialogSelectItems.push(item);
                }
                this._dialogSelectView.getComponent(Layout).updateLayout();
            }
        } else if (event.type == 3) {
            this._dialogFightButton.active = true;
            this._dialogFightButton.getComponent(Button).clickEvents[0].customEventData = event.enemy;
        } else {
            this._dialogNextButton.active = true;
            this._dialogNextButton.getComponent(Button).clickEvents[0].customEventData = event.result;
            if (event.type == 4) {
                let showTip: string = "";
                if (event.cost != null) {
                    showTip += this._loseOrGainItemAndResource(event.cost, true);
                }
                if (event.reward != null) {
                    showTip += this._loseOrGainItemAndResource(event.reward, false);
                }
                GameMain.inst.UI.ShowTip(showTip);
            } else if (event.type == 5) {
                if (event.change != null) {
                    let showTip: string = "";
                    for (const tempChange of event.change) {
                        const isPlayer: boolean = tempChange[0] == "-1";
                        const pioneerId: string = isPlayer ? this._triggerPioneerId : tempChange[0];
                        // 1-hp 2-attack
                        const changedType: number = tempChange[1];
                        // 1-add 2-multi
                        const changeMethod: number = tempChange[2];
                        const changedValue: number = tempChange[3];

                        if (isPlayer && changedType == 1) {
                            PioneerMgr.instance.pioneerChangeHpMax(pioneerId, { type: changeMethod, value: changedValue });
                        } else {
                            this._temporaryAttributes.set(pioneerId + "|" + changedType, { type: changeMethod, value: changedValue });
                        }
                        if (isPlayer) {
                            if (changedType == 1) {

                                // useLanMgr
                                showTip += LanMgr.Instance.getLanById("207001") + "\n";
                                // showTip += "Your HP has changed\n";
                            }
                            else {
                                // useLanMgr
                                showTip += LanMgr.Instance.getLanById("207002") + "\n";
                                // showTip += "Your Attack has changed\n";
                            }
                        }
                        else {
                            const pioneerInfo = PioneerMgr.instance.getPioneerById(pioneerId);
                            if (pioneerInfo == null) {
                                if (changedType == 1) {
                                    // useLanMgr
                                    showTip += LanMgr.Instance.getLanById("207003") + "\n";
                                    // showTip += "Enemy's HP has changed\n";
                                }
                                else {
                                    // useLanMgr
                                    showTip += LanMgr.Instance.getLanById("207004") + "\n";
                                    // showTip += "Enemy's Attack has changed\n";
                                }
                            }
                            else {
                                if (changedType == 1) {
                                    // useLanMgr
                                    showTip += LanMgr.Instance.replaceLanById("207005", [pioneerInfo.name]) + "\n";
                                    // showTip += pioneerInfo.name + " HP has changed\n";
                                }
                                else {
                                    // useLanMgr
                                    showTip += LanMgr.Instance.replaceLanById("207006", [pioneerInfo.name]) + "\n";
                                    // showTip += pioneerInfo.name + " Attack has changed\n";
                                }
                            }
                        }

                    }
                    GameMain.inst.UI.ShowTip(showTip);
                }
            }
        }

        CountMgr.instance.addNewCount({
            type: CountType.showEvent,
            timeStamp: new Date().getTime(),
            data: {
                eventId: event.id
            }
        });

        if (event.map_building_refresh != null) {
            for (const [buidingId, type] of event.map_building_refresh) {
                if (type == 1) {
                    BuildingMgr.instance.showBuilding(buidingId);
                } else {
                    BuildingMgr.instance.hideBuilding(buidingId);
                }
            }
        }
        if (event.map_pioneer_unlock != null) {
            for (const [pioneerId, type] of event.map_pioneer_unlock) {
                if (type == 1) {
                    PioneerMgr.instance.showPioneer(pioneerId);
                } else {
                    PioneerMgr.instance.hidePioneer(pioneerId);
                }
            }
        }
    }

    private _checkIsSatisfiedCondition(condition: any[]): { satisfy: boolean, tipText: string } {
        const temple: { satisfy: boolean, tipText: string } = { satisfy: true, tipText: "" };
        if (condition.length == 3) {
            const type: number = condition[0];
            const id: string = condition[1];
            const num: number = condition[2];

            if (type == ItemConfigType.Item) {
                const currentNum = ItemMgr.Instance.getOwnItemCount(id);
                if (currentNum >= num) {
                    temple.satisfy = true;
                } else {
                    temple.satisfy = false;
                    const itemConf = ItemMgr.Instance.getItemConf(id);
                    if (itemConf != null) {
                        // useLanMgr
                        temple.tipText = LanMgr.Instance.replaceLanById("207007", [num]) + LanMgr.Instance.getLanById(itemConf.itemName);
                        // temple.tipText = "you need AT LEAST " + num + " " + itemConf.itemName;
                    }
                }
            } else if (type == ItemConfigType.Artifact) {
                // xx wait artifact
            }
            // reserved for later
            // } else if (type == 3) {
            //     if (this._triggerPioneerId != null) {
            //         const pioneer = PioneerMgr.instance.getPioneerById(this._triggerPioneerId);
            //         if (id == 1) {
            //             // hp
            //             if (pioneer.hp > num) {
            //                 // only hp need left 1
            //                 temple.satisfy = true;
            //             } else {
            //                 temple.satisfy = false;

            //                 // useLanMgr
            //                 // temple.tipText = LanMgr.Instance.replaceLanById("107549", [num+1]);
            //                 temple.tipText = "you need AT LEAST " + (num + 1) + " HP";
            //             }

            //         } else if (id == 2) {
            //             // attack
            //             if (pioneer.attack >= num) {
            //                 temple.satisfy = true;
            //             } else {
            //                 temple.satisfy = false;

            //                 // useLanMgr
            //                 // temple.tipText = LanMgr.Instance.replaceLanById("107549", [num]);
            //                 temple.tipText = "you need AT LEAST " + num + " Attack";
            //             }
            //         }
            //     }
            // }
        }
        return temple;
    }

    private _loseOrGainItemAndResource(datas: any[], cost: boolean): string {
        let showTip: string = "";
        const itemDatas: ItemData[] = [];
        for (const temple of datas) {
            if (temple.length == 3) {
                const type: number = temple[0];
                const id: string = temple[1];
                const num = temple[2];
                if (type == ItemConfigType.Item) {
                    // item
                    if (cost) {
                        for (const item of ItemMgr.Instance.localItemDatas) {
                            if (item.itemConfigId == id) {
                                const itemConf = ItemMgr.Instance.getItemConf(id);
                                ItemMgr.Instance.subItem(item.itemConfigId, num);

                                // useLanMgr
                                showTip += LanMgr.Instance.replaceLanById("207008", [num, LanMgr.Instance.getLanById(itemConf.itemName)]) + "\n";
                                // showTip += ("You lost" + num + " " + itemConf.itemName + "\n");

                                break;
                            }
                        }
                    } else {
                        itemDatas.push(new ItemData(id, num));
                        const itemConf = ItemMgr.Instance.getItemConf(id);
                        // useLanMgr
                        showTip += LanMgr.Instance.replaceLanById("207009", [num, LanMgr.Instance.getLanById(itemConf.itemName)]) + "\n";
                        // showTip += ("You obtained" + num + " " + itemConf.itemName + "\n");
                    }
                } else if (type == ItemConfigType.Artifact) {
                    // wait artifact
                }
            }
        }
        if (itemDatas.length > 0) {
            ItemMgr.Instance.addItem(itemDatas);

            let hasItem: boolean = false;
            for (const item of itemDatas) {
                const config = ItemMgr.Instance.getItemConf(item.itemConfigId);
                if (config != null && config.itemType != ItemType.Resource) {
                    hasItem = true;
                    break;
                }
            }
            if (hasItem) {
                this._contentView.active = false;
                GameMain.inst.UI.itemInfoUI.showItem(itemDatas, true, () => {
                    this._contentView.active = true;
                });
            }
        }
        return showTip;
    }

    private _nextEvent(eventId: string) {
        // console.log(`_nextEvent, current: ${this._event.id}, next: ${eventId}`);
        BranchEventMgr.Instance.latestActiveEventState.prevEventId = this._event.id;
        BranchEventMgr.Instance.latestActiveEventState.eventId = eventId;

        if (eventId == "-1" ||
            eventId == "-2") {
            // clear temp attributes
            this._temporaryAttributes = new Map();

            if (this._eventBuildingId != null) {
                if (eventId == "-1") {
                    BuildingMgr.instance.changeBuildingEventId(this._eventBuildingId, null);
                    BuildingMgr.instance.hideBuilding(this._eventBuildingId);

                } else if (eventId == "-2") {
                    const building = BuildingMgr.instance.getBuildingById(this._eventBuildingId);

                    if (building != null) {
                        BuildingMgr.instance.changeBuildingEventId(this._eventBuildingId, building.originalEventId);
                    }
                }
            }
            SettlementMgr.instance.insertSettlement({
                level: UserInfoMgr.Instance.level,
                newPioneerIds: [],
                killEnemies: 0,
                gainResources: 0,
                exploredEvents: 1,
            });

            if (this._triggerPioneerId != null) {
                PioneerMgr.instance.pioneerToIdle(this._triggerPioneerId);
            }
            // useLanMgr
            GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("207010"));
            // GameMain.inst.UI.ShowTip("Event Ended");
            this.show(false);
        } else {
            const event = BranchEventMgr.Instance.getEventById(eventId);
            if (event.length > 0) {
                BuildingMgr.instance.changeBuildingEventId(this._eventBuildingId, event[0].id);
                this.show(false);
                if (this._dealWithNextEvent != null) {
                    this._dealWithNextEvent(event[0]);
                }
            }
        }
    }

    //------------------------------------------------ action
    private onTapNext(actionEvent: Event, customEventData: string) {
        const eventId = customEventData;
        const hasNextStep = eventId != "-1";
        // console.log(`eventStepEnd, source: onTapNext, eventId: ${this._event.id}`);
        BranchEventMgr.Instance.fireOnBranchEventStepEnd(this._event.id, hasNextStep);

        this._nextEvent(eventId);
    }
    private onTapFight(event: Event, customEventData: string) {
        const pioneerId = customEventData;
        this._contentView.active = false;
        if (this._fightCallback != null) {
            this._fightCallback(this._triggerPioneerId, pioneerId, this._temporaryAttributes, (succeed: boolean) => {
                let eventId = null;
                if (this._event != null &&
                    this._event.enemy_result != null && this._event.enemy_result.length == 2) {
                    eventId = succeed ? this._event.enemy_result[0] : this._event.enemy_result[1];
                }

                if (succeed) {

                } else {
                    const event = BranchEventMgr.Instance.getEventById(eventId);
                    if (event.length > 0) {
                        eventId = event[0].result;
                    }
                }
                const hasNextStep = eventId != null;
                if (this._event) {
                    // console.log(`eventStepEnd, source: onTapFight, eventId: ${this._event.id}`);
                    BranchEventMgr.Instance.fireOnBranchEventStepEnd(this._event.id, hasNextStep);
                }
                if (hasNextStep) {
                    this._nextEvent(eventId);
                } else {
                    this._contentView.active = true;
                }
            });
        } else {
            this._contentView.active = true;
        }
    }
    private onTapSelect(actionEvent: Event, customEventData: string) {
        const eventId = customEventData;
        const event = BranchEventMgr.Instance.getEventById(eventId);
        let hasNextStep = event.length > 0;

        // console.log(`eventStepEnd, source: onTapSelect, eventId: ${this._event.id}`);
        BranchEventMgr.Instance.fireOnBranchEventStepEnd(this._event.id, hasNextStep);

        this._nextEvent(eventId);
    }
}


