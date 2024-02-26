import { _decorator, Button, Component, EventHandler, instantiate, Label, Layout, Node, Sprite } from 'cc';
import { GameMain } from '../../GameMain';
import PioneerMgr from '../../Manger/PioneerMgr';
import UserInfo from '../../Manger/UserInfoMgr';
import ItemMgr from '../../Manger/ItemMgr';
import ItemData, { ItemConfigData } from '../../Model/ItemData';
import BranchEventMgr from '../../Manger/BranchEventMgr';
import { PopUpUI } from '../../BasicView/PopUpUI';
import { ItemInfoShowModel } from '../ItemInfoUI';
import BuildingMgr from '../../Manger/BuildingMgr';
const { ccclass, property } = _decorator;

@ccclass('EventUI')
export class EventUI extends PopUpUI {

    public eventUIShow(triggerPioneerId: string, eventBuildingId: string, event: any, fightCallback: (pioneerId: string, enemyId: string, temporaryAttributes: Map<string, number>, fightOver: (succeed: boolean) => void) => void) {
        this._triggerPioneerId = triggerPioneerId;
        this._eventBuildingId = eventBuildingId;
        this._temporaryAttributes = new Map();
        this._fightCallback = fightCallback;

        this._refreshUI(event);
    }

    public override get typeName() {
        return "EventUI";
    }

    private _triggerPioneerId: string = null;
    private _eventBuildingId: string = null;  
    private _temporaryAttributes: Map<string, number> = null;
    private _fightCallback: (pioneerId: string, enemyId: string, temporaryAttributes: Map<string, number>, fightOver: (succeed: boolean) => void) => void = null;

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
    }

    start() {

    }

    update(deltaTime: number) {

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
        this._dialogView.getChildByPath("content/label").getComponent(Label).string = event.text;

        this._dialogNextButton.active = false;
        this._dialogFightButton.active = false;
        this._dialogSelectView.active = false;
        if (event.type == 2) {
            // select_cond wait todo
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
                    item.getChildByName("label").getComponent(Label).string = conditionResult != null ? (conditionResult.satisfy ? event.select_txt[i] : conditionResult.tipText) : event.select_txt[i];
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

                        let useChangedValue: number = 0;
                        const pioneerInfo = PioneerMgr.instance.getPioneerById(pioneerId);
                        if (pioneerInfo != null) {
                            if (changeMethod == 1) {
                                useChangedValue = changedValue;

                            } else if (changeMethod == 2) {
                                if (changedValue > 0) {
                                    // only use positive multi
                                    if (changedType == 1) {
                                        useChangedValue = pioneerInfo.hpMax * (changedValue - 1);
                                    } else {
                                        useChangedValue = pioneerInfo.attack * (changedValue - 1);
                                    }
                                }
                            }
                        }
                        if (isPlayer && changedType == 1) {
                            // player hp is used forever
                            PioneerMgr.instance.pioneerChangeHpMax(pioneerId, useChangedValue);
                        } else {
                            // other is temporary
                            this._temporaryAttributes.set(pioneerId + "|" + changedType, useChangedValue);
                        }
                        showTip += ((isPlayer ? "Your" : (pioneerInfo == null ? "Enemy's" : pioneerInfo.name + "'s")) + " " + (changedType == 1 ? "HP" : "Attack") + " has changed\n");
                    }
                    GameMain.inst.UI.ShowTip(showTip);
                }
            }
        }
    }

    private _checkIsSatisfiedCondition(condition: any[]): { satisfy: boolean, tipText: string } {
        const temple: { satisfy: boolean, tipText: string } = { satisfy: true, tipText: "" };
        if (condition.length == 3) {
            const type: number = condition[0];
            const id: number | string = condition[1];
            const num: number = condition[2];
            if (type == 1) {
                // resource
                const resourceId: string = id as string;
                if (resourceId == "resource_01") {
                    if (UserInfo.Instance.wood >= num) {
                        temple.satisfy = true;
                    } else {
                        temple.satisfy = false;
                        temple.tipText = "you need AT LEAST " + num + " wood";
                    }

                } else if (resourceId == "resource_02") {
                    if (UserInfo.Instance.stone >= num) {
                        temple.satisfy = true;
                    } else {
                        temple.satisfy = false;
                        temple.tipText = "you need AT LEAST " + num + " stone";
                    }

                } else if (resourceId == "resource_03") {
                    if (UserInfo.Instance.food >= num) {
                        temple.satisfy = true;
                    } else {
                        temple.satisfy = false;
                        temple.tipText = "you need AT LEAST " + num + " food";
                    }

                } else if (resourceId == "resource_04") {
                    if (UserInfo.Instance.troop >= num) {
                        temple.satisfy = true;
                    } else {
                        temple.satisfy = false;
                        temple.tipText = "you need AT LEAST " + num + " troop";
                    }
                }
            } else if (type == 2) {
                // item
                const itemId: number = id as number;
                let satisfy: boolean = false;
                for (const item of ItemMgr.Instance.localItemDatas) {
                    if (item.itemConfigId == itemId) {
                        if (item.count >= num) {
                            satisfy = true;
                        }
                        break;
                    }
                }
                if (satisfy) {
                    temple.satisfy = true;
                } else {
                    temple.satisfy = false;
                    const itemConf = ItemMgr.Instance.getItemConf(itemId);
                    if (itemConf != null) {
                        temple.tipText = "you need AT LEAST " + num + " " + itemConf.itemName;
                    }
                }
            } else if (type == 3) {
                if (this._triggerPioneerId != null) {
                    const pioneer = PioneerMgr.instance.getPioneerById(this._triggerPioneerId);
                    if (id == 1) {
                        // hp
                        if (pioneer.hp > num) {
                            // only hp need left 1
                            temple.satisfy = true;
                        } else {
                            temple.satisfy = false;
                            temple.tipText = "you need AT LEAST " + (num + 1) + " HP";
                        }

                    } else if (id == 2) {
                        // attack
                        if (pioneer.attack >= num) {
                            temple.satisfy = true;
                        } else {
                            temple.satisfy = false;
                            temple.tipText = "you need AT LEAST " + num + " Attack";
                        }
                    }
                }
            }
        }
        return temple;
    }

    private _loseOrGainItemAndResource(datas: any[], cost: boolean): string {
        let showTip: string = "";
        const itemInfoShows: ItemInfoShowModel[] = [];

        for (const temple of datas) {
            if (temple.length == 3) {
                const type: number = temple[0];
                const id: number | string = temple[1];
                const num = temple[2];
                if (type == 1) {
                    // item
                    if (cost) {
                        for (const item of ItemMgr.Instance.localItemDatas) {
                            if (item.itemConfigId == id) {
                                const itemConf = ItemMgr.Instance.getItemConf(id as number);
                                ItemMgr.Instance.subItem(item.itemConfigId, num);
                                showTip += ("You lost" + num + " " + itemConf.itemName + "\n");
                                break;
                            }
                        }
                    } else {
                        const itemConf = ItemMgr.Instance.getItemConf(id as number);
                        if (itemConf != null) {
                            itemInfoShows.push({
                                itemConfig: itemConf,
                                count: num
                            });
                        }
                        showTip += ("You obtained" + num + " " + itemConf.itemName + "\n");
                    }
                } else if (type == 2) {
                    // resource
                    const resourceId: string = id as string;
                    if (resourceId == "resource_01") {
                        if (cost) {
                            UserInfo.Instance.wood -= num;
                            showTip += ("You lost" + num + " wood\n");
                        } else {
                            UserInfo.Instance.wood += num;
                            showTip += ("You obtained" + num + " wood\n");
                        }

                    } else if (resourceId == "resource_02") {
                        if (cost) {
                            UserInfo.Instance.stone -= num;
                            showTip += ("You lost" + num + " stone\n");
                        } else {
                            UserInfo.Instance.stone += num;
                            showTip += ("You obtained" + num + " stone\n");
                        }

                    } else if (resourceId == "resource_03") {
                        if (cost) {
                            UserInfo.Instance.food -= num;
                            showTip += ("You lost" + num + " food\n");
                        } else {
                            UserInfo.Instance.food += num;
                            showTip += ("You obtained" + num + " food\n");
                        }

                    } else if (resourceId == "resource_04") {
                        if (cost) {
                            UserInfo.Instance.troop -= num;
                            showTip += ("You lost" + num + " troop\n");
                        } else {
                            UserInfo.Instance.troop += num;
                            showTip += ("You obtained" + num + " troop\n");
                        }
                    }
                }
            }
        }
        if (itemInfoShows.length > 0) {
            this._contentView.active = false;
            const items = [];
            for (const temple of itemInfoShows) {
                items.push(new ItemData(temple.itemConfig.configId, temple.count));
            }
            ItemMgr.Instance.addItem(items);
            GameMain.inst.UI.itemInfoUI.showItem(itemInfoShows, true, ()=> {
                this._contentView.active = true;
            });
        }
        return showTip;
    }

    //------------------------------------------------ action
    private onTapNext(actionEvent: Event, customEventData: string) {
        const eventId = customEventData;
        if (eventId == "-1") {
            if (this._eventBuildingId != null) {
                BuildingMgr.instance.hideBuilding(this._eventBuildingId);
            }
            GameMain.inst.UI.ShowTip("Event Ended");
            this.show(false);
        } else {
            const event = BranchEventMgr.Instance.getEventById(eventId);
            if (event.length > 0) {
                this._refreshUI(event[0]);
            }
        }
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
                if (eventId != null) {
                    const event = BranchEventMgr.Instance.getEventById(eventId);
                    if (event.length > 0) {
                        this._contentView.active = true;
                        this._refreshUI(event[0]);
                    } else {
                        this._contentView.active = true;
                    }
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
        if (event.length > 0) {
            this._refreshUI(event[0]);
        }
    }
}


