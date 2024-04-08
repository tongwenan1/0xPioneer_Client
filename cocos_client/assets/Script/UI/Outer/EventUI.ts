import { _decorator, Button, Component, EventHandler, instantiate, Label, Layout, Node, Sprite } from 'cc';
import { BuildingMgr, CountMgr, ItemMgr, LanMgr, PioneerMgr, SettlementMgr, UserInfoMgr } from '../../Utils/Global';
import { MapPioneerAttributesChangeModel } from '../../Const/Model/MapPioneerModelDefine';
import ViewController from '../../BasicView/ViewController';
import { UIName } from '../../Const/ConstUIDefine';
import { UIHUDController } from '../UIHUDController';
import NotificationMgr from '../../Basic/NotificationMgr';
import { CountType } from '../../Const/Count';
import EventConfig from '../../Config/EventConfig';
import { EventConfigData, EventCost, EventReward, EventSelectCond, EventSelectCondId, EventSelectCondNum } from '../../Const/Event';
import GlobalData from '../../Data/GlobalData';
import ItemData, { ItemConfigType, ItemType } from '../../Const/Item';
import ItemConfig from '../../Config/ItemConfig';
import { NotificationName } from '../../Const/Notification';
import { ItemGettedUI } from '../ItemGettedUI';
import Config from '../../Const/Config';
import UIPanelManger from '../../Basic/UIPanelMgr';
const { ccclass, property } = _decorator;

@ccclass('EventUI')
export class EventUI extends ViewController {

    public eventUIShow(triggerPioneerId: string, eventBuildingId: string, event: EventConfigData, fightCallback: (pioneerId: string, enemyId: string, temporaryAttributes: Map<string, MapPioneerAttributesChangeModel>, fightOver: (succeed: boolean) => void) => void, dealWithNextEvent: (event: EventConfigData) => void) {
        this._triggerPioneerId = triggerPioneerId;
        this._eventBuildingId = eventBuildingId;
        this._fightCallback = fightCallback;
        this._dealWithNextEvent = dealWithNextEvent;

        this._refreshUI(event);
    }

    private _triggerPioneerId: string = null;
    private _eventBuildingId: string = null;
    private _temporaryAttributes: Map<string, MapPioneerAttributesChangeModel> = new Map();
    private _fightCallback: (pioneerId: string, enemyId: string, temporaryAttributes: Map<string, MapPioneerAttributesChangeModel>, fightOver: (succeed: boolean) => void) => void = null;
    private _dealWithNextEvent: (event: EventConfigData) => void = null;

    private _event: EventConfigData = null;

    private _contentView: Node = null;

    private _dialogView: Node = null;
    private _dialogNextButton: Node = null;
    private _dialogFightButton: Node = null;
    private _dialogSelectView: Node = null;
    private _selectItem: Node = null;

    private _dialogSelectItems: Node[] = [];

    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._contentView = this.node.getChildByPath("content");

        this._dialogView = this._contentView.getChildByName("dialog");
        this._dialogNextButton = this._dialogView.getChildByName("nextButton");
        this._dialogFightButton = this._dialogView.getChildByName("fightButton");
        this._dialogSelectView = this._dialogView.getChildByName("selectView");
        this._selectItem = this._dialogSelectView.getChildByName("button");
        this._selectItem.active = false;

        NotificationMgr.addListener(NotificationName.CHANGE_LANG, this._refreshUI, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.CHANGE_LANG, this._refreshUI, this);
    }

    private async _refreshUI(event: EventConfigData) {
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
        // this._dialogView.getChildByPath("nextButton/Label").getComponent(Label).string = LanMgr.getLanById("107549");
        // this._dialogView.getChildByPath("fightButton/Label").getComponent(Label).string = LanMgr.getLanById("107549");

        // useLanMgr
        this._dialogView.getChildByPath("content/bg/label").getComponent(Label).string = LanMgr.getLanById(event.text);
        // this._dialogView.getChildByPath("content/bg/label").getComponent(Label).string = event.text;
        let localLastTip = null;
        if (this._triggerPioneerId != null) {
            localLastTip = localStorage.getItem("local_event_last_title_" + this._triggerPioneerId);
        }
        this._dialogView.getChildByPath("content/title").getComponent(Label).string = localLastTip == null ? "" : LanMgr.getLanById(localLastTip);

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
                    item.getChildByName("label").getComponent(Label).string = conditionResult != null ? (conditionResult.satisfy ? LanMgr.getLanById(event.select_txt[i]) : conditionResult.tipText) : LanMgr.getLanById(event.select_txt[i]);
                    // item.getChildByName("label").getComponent(Label).string = conditionResult != null ? (conditionResult.satisfy ? event.select_txt[i] : conditionResult.tipText) : event.select_txt[i];

                    item.getComponent(Sprite).grayscale = conditionResult != null ? !conditionResult.satisfy : false;
                    item.getComponent(Button).interactable = conditionResult != null ? conditionResult.satisfy : true;
                    item.getComponent(Button).clickEvents[0].customEventData = event.select[i] + "|" + event.select_txt[i];
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
                    showTip += await this._loseOrGainItemAndResource(event.cost, true);
                }
                if (event.reward != null) {
                    showTip += await this._loseOrGainItemAndResource(event.reward, false);
                }
                UIHUDController.showCenterTip(showTip);
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
                            PioneerMgr.pioneerChangeHpMax(pioneerId, { type: changeMethod, value: changedValue });
                        } else {
                            this._temporaryAttributes.set(pioneerId + "|" + changedType, { type: changeMethod, value: changedValue });
                        }
                        if (isPlayer) {
                            if (changedType == 1) {

                                // useLanMgr
                                showTip += LanMgr.getLanById("207001") + "\n";
                                // showTip += "Your HP has changed\n";
                            }
                            else {
                                // useLanMgr
                                showTip += LanMgr.getLanById("207002") + "\n";
                                // showTip += "Your Attack has changed\n";
                            }
                        }
                        else {
                            const pioneerInfo = PioneerMgr.getPioneerById(pioneerId);
                            if (pioneerInfo == null) {
                                if (changedType == 1) {
                                    // useLanMgr
                                    showTip += LanMgr.getLanById("207003") + "\n";
                                    // showTip += "Enemy's HP has changed\n";
                                }
                                else {
                                    // useLanMgr
                                    showTip += LanMgr.getLanById("207004") + "\n";
                                    // showTip += "Enemy's Attack has changed\n";
                                }
                            }
                            else {
                                if (changedType == 1) {
                                    // useLanMgr
                                    showTip += LanMgr.replaceLanById("207005", [pioneerInfo.name]) + "\n";
                                    // showTip += pioneerInfo.name + " HP has changed\n";
                                }
                                else {
                                    // useLanMgr
                                    showTip += LanMgr.replaceLanById("207006", [pioneerInfo.name]) + "\n";
                                    // showTip += pioneerInfo.name + " Attack has changed\n";
                                }
                            }
                        }
                    }
                    UIHUDController.showCenterTip(showTip);
                }
            }
        }

        CountMgr.addNewCount({
            type: CountType.showEvent,
            timeStamp: new Date().getTime(),
            data: {
                eventId: event.id
            }
        });

        if (event.map_building_refresh != null) {
            for (const [buidingId, type] of event.map_building_refresh) {
                if (type == 1) {
                    BuildingMgr.showBuilding(buidingId);
                } else {
                    BuildingMgr.hideBuilding(buidingId);
                }
            }
        }
        if (event.map_pioneer_unlock != null) {
            for (const [pioneerId, type] of event.map_pioneer_unlock) {
                if (type == 1) {
                    PioneerMgr.showPioneer(pioneerId);
                } else {
                    PioneerMgr.hidePioneer(pioneerId);
                }
            }
        }
    }

    private _checkIsSatisfiedCondition(condition: EventSelectCond): { satisfy: boolean, tipText: string } {
        const temple: { satisfy: boolean, tipText: string } = { satisfy: true, tipText: "" };
        const type: ItemConfigType = condition[0];
        const id: EventSelectCondId = condition[1];
        const num: EventSelectCondNum = condition[2];

        if (type == ItemConfigType.Item) {
            const currentNum = ItemMgr.getOwnItemCount(id);
            if (currentNum >= num) {
                temple.satisfy = true;
            } else {
                temple.satisfy = false;
                const itemConf = ItemConfig.getById(id);
                if (itemConf != null) {
                    // useLanMgr
                    temple.tipText = LanMgr.replaceLanById("207007", [num]) + LanMgr.getLanById(itemConf.itemName);
                    // temple.tipText = "you need AT LEAST " + num + " " + itemConf.itemName;
                }
            }
        } else if (type == ItemConfigType.Artifact) {
            // xx wait artifact
        }
        // reserved for later
        // } else if (type == 3) {
        //     if (this._triggerPioneerId != null) {
        //         const pioneer = PioneerMgr.getPioneerById(this._triggerPioneerId);
        //         if (id == 1) {
        //             // hp
        //             if (pioneer.hp > num) {
        //                 // only hp need left 1
        //                 temple.satisfy = true;
        //             } else {
        //                 temple.satisfy = false;

        //                 // useLanMgr
        //                 // temple.tipText = LanMgr.replaceLanById("107549", [num+1]);
        //                 temple.tipText = "you need AT LEAST " + (num + 1) + " HP";
        //             }

        //         } else if (id == 2) {
        //             // attack
        //             if (pioneer.attack >= num) {
        //                 temple.satisfy = true;
        //             } else {
        //                 temple.satisfy = false;

        //                 // useLanMgr
        //                 // temple.tipText = LanMgr.replaceLanById("107549", [num]);
        //                 temple.tipText = "you need AT LEAST " + num + " Attack";
        //             }
        //         }
        //     }
        // }
        return temple;
    }

    private async _loseOrGainItemAndResource(datas: (EventReward | EventCost)[], cost: boolean): Promise<string> {
        let showTip: string = "";
        const itemDatas: ItemData[] = [];
        for (const temple of datas) {
            const type: ItemConfigType = temple[0];
            const id: string = temple[1];
            const num: number = temple[2];
            if (type == ItemConfigType.Item) {
                // item
                if (cost) {
                    for (const item of ItemMgr.localItemDatas) {
                        if (item.itemConfigId == id) {
                            const itemConf = ItemConfig.getById(id);
                            ItemMgr.subItem(item.itemConfigId, num);

                            // useLanMgr
                            showTip += LanMgr.replaceLanById("207008", [num, LanMgr.getLanById(itemConf.itemName)]) + "\n";
                            // showTip += ("You lost" + num + " " + itemConf.itemName + "\n");

                            break;
                        }
                    }
                } else {
                    itemDatas.push(new ItemData(id, num));
                    const itemConf = ItemConfig.getById(id);
                    // useLanMgr
                    showTip += LanMgr.replaceLanById("207009", [num, LanMgr.getLanById(itemConf.itemName)]) + "\n";
                    // showTip += ("You obtained" + num + " " + itemConf.itemName + "\n");
                }
            } else if (type == ItemConfigType.Artifact) {
                // donn't need support wait function 
            }
        }
        if (itemDatas.length > 0) {
            ItemMgr.addItem(itemDatas);

            let hasItem: boolean = false;
            for (const item of itemDatas) {
                const config = ItemConfig.getById(item.itemConfigId);
                if (config != null && config.itemType != ItemType.Resource) {
                    hasItem = true;
                    break;
                }
            }
            if (hasItem) {
                this._contentView.active = false;
                const result = await UIPanelManger.inst.pushPanel(UIName.ItemGettedUI);
                if (result.success) {
                    result.node.getComponent(ItemGettedUI).showItem(itemDatas, () => {
                        this._contentView.active = true;
                    });
                }
            }
        }
        return showTip;
    }

    private _nextEvent(eventId: string) {
        // console.log(`_nextEvent, current: ${this._event.id}, next: ${eventId}`);
        GlobalData.latestActiveEventState.prevEventId = this._event.id;
        GlobalData.latestActiveEventState.eventId = eventId;

        if (eventId == "-1" ||
            eventId == "-2") {
            // clear temp attributes
            this._temporaryAttributes = new Map();

            if (this._triggerPioneerId != null) {
                localStorage.removeItem("local_event_last_title_" + this._triggerPioneerId);
            }
            if (this._eventBuildingId != null) {
                if (eventId == "-1") {
                    BuildingMgr.changeBuildingEventId(this._eventBuildingId, null);
                    BuildingMgr.hideBuilding(this._eventBuildingId);

                } else if (eventId == "-2") {
                    const building = BuildingMgr.getBuildingById(this._eventBuildingId);

                    if (building != null) {
                        BuildingMgr.changeBuildingEventId(this._eventBuildingId, building.originalEventId);
                    }
                }
            }
            SettlementMgr.insertSettlement({
                level: UserInfoMgr.level,
                newPioneerIds: [],
                killEnemies: 0,
                gainResources: 0,
                consumeResources: 0,
                gainTroops: 0,
                consumeTroops: 0,
                gainEnergy: 0,
                consumeEnergy: 0,
                exploredEvents: 1
            });

            if (this._triggerPioneerId != null) {
                PioneerMgr.pioneerToIdle(this._triggerPioneerId);
            }
            // useLanMgr
            UIHUDController.showCenterTip(LanMgr.getLanById("207010"));
            // UIHUDController.showCenterTip("Event Ended");
            UIPanelManger.inst.popPanel();
        } else {
            const event = EventConfig.getById(eventId);
            if (event != null) {
                BuildingMgr.changeBuildingEventId(this._eventBuildingId, event.id);
                UIPanelManger.inst.popPanel();
                if (this._dealWithNextEvent != null) {
                    this._dealWithNextEvent(event);
                }
            }
        }
    }

    //------------------------------------------------ action
    private onTapNext(actionEvent: Event, customEventData: string) {
        const eventId = customEventData;
        const hasNextStep = eventId != "-1";
        // console.log(`eventStepEnd, source: onTapNext, eventId: ${this._event.id}, next: ${eventId}`);
        NotificationMgr.triggerEvent(NotificationName.EVENT_STEPEND, [this._event.id, hasNextStep]);

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
                    const event = EventConfig.getById(eventId);
                    if (event != null) {
                        eventId = event.result;
                    }
                }
                if (this._event) {
                    const hasNextStep = eventId != null && eventId != -1 && eventId != -2;
                    // console.log(`eventStepEnd, source: onTapFight, eventId: ${this._event.id}, next: ${eventId}`);
                    NotificationMgr.triggerEvent(NotificationName.EVENT_STEPEND, [this._event.id, hasNextStep]);
                }
                if (eventId != null) {
                    this._nextEvent(eventId);
                } else {
                    this._contentView.active = true;
                }
            });
        } else {
            this._contentView.active = true;
        }
    }
    private onTapSelect(actionEvent: Event, customEventData: string, use: string) {
        const datas = customEventData.split("|");
        const eventId = datas[0];
        const event = EventConfig.getById(eventId);

        if (this._triggerPioneerId != null) {
            if (Config.canSaveLocalData) {
                localStorage.setItem("local_event_last_title_" + this._triggerPioneerId, datas[1]);
            }
        }
        let hasNextStep = event != null;

        // console.log(`eventStepEnd, source: onTapSelect, eventId: ${this._event.id}, next: ${eventId}`);
        NotificationMgr.triggerEvent(NotificationName.EVENT_STEPEND, [this._event.id, hasNextStep]);

        this._nextEvent(eventId);
    }
}


