import { resources, sys } from "cc";
import ItemData, { ItemConfigData, ItemType } from "../Model/ItemData";
import UserInfoMgr, { FinishedEvent } from "./UserInfoMgr";
import { ItemConfigType } from "../Const/ConstDefine";
import { ItemInfoShowModel } from "../UI/ItemInfoUI";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";

export enum ItemArrangeType {
    Recently = "Recently",
    Rarity = "Rarity",
    Type = "Type",
}

export interface ItemMgrEvent {
    itemChanged(): void;
}

export default class ItemMgr {

    public getItemConf(itemConfigId: string): ItemConfigData {
        let key = itemConfigId;
        if (key in this._itemConfs) {
            return this._itemConfs[key];
        }
        return null;
    }
    public getOwnItemCount(itemConfigId: string): number {
        let count: number = 0;
        for (const item of this._localItemDatas) {
            if (item.itemConfigId == itemConfigId) {
                count += item.count;
            }
        }
        return count;
    }

    public get itemIsFull(): boolean {
        let count: number = 0;
        for (const temple of this._localItemDatas) {
            if (this.getItemConf(temple.itemConfigId).itemType != ItemType.Resource) {
                count += 1;
            }
        }
        return count >= this._maxItemLength;
    }
    public get localItemDatas(): ItemData[] {
        return this._localItemDatas;
    }

    public addItem(items: ItemData[]): void {
        if (items.length <= 0) {
            return;
        }
        let changed: boolean = false;
        for (const item of items) {
            const itemConfig = this.getItemConf(item.itemConfigId);
            if (itemConfig == null) {

            } else {
                if (itemConfig.itemType == ItemType.Resource) {

                } else if (this.itemIsFull) {
                    continue;
                }
                changed = true;
                if (item.itemConfigId == "9") {
                    //get master key
                    UserInfoMgr.Instance.finishEvent(FinishedEvent.BecomeCityMaster);
                }
                // add timestamp
                if (itemConfig.itemType == ItemType.Resource) {
                    const exsitItems = this._localItemDatas.filter(v => v.itemConfigId == item.itemConfigId);
                    if (exsitItems.length > 0) {
                        exsitItems[0].count += item.count;
                        exsitItems[0].addTimeStamp = new Date().getTime();
                    } else {
                        item.addTimeStamp = new Date().getTime();
                        this._localItemDatas.push(item);
                    }

                } else {
                    item.addTimeStamp = new Date().getTime();
                    this._localItemDatas.push(item);
                }
            }
        }
        if (changed) {
            for (const observe of this._observers) {
                observe.itemChanged();
            }
            sys.localStorage.setItem(this._localStorageKey, JSON.stringify(this._localItemDatas));
        }
    }
    public subItem(itemConfigId: string, count: number): boolean {
        let idx = this._localItemDatas.findIndex((v) => {
            return v.itemConfigId == itemConfigId;
        });

        if (idx < 0) {
            return false;
        }

        if (this._localItemDatas[idx].count < count) {
            return false;
        }

        this._localItemDatas[idx].count -= count;

        const itemConfig = this.getItemConf(itemConfigId);
        if (itemConfig != null) {
            // if (itemConfig.itemType == ItemType.AddProp) {
            //     const exsitItems = this._localItemDatas.filter(v => v.itemConfigId.toString() == itemConfig.gainPropId);
            //     if (exsitItems.length > 0) {
            //         exsitItems[0].count += itemConfig.gainPropCount;
            //         exsitItems[0].addTimeStamp = new Date().getTime();
            //     } else {
            //         const newItem = new ItemData(itemConfig.gainPropId, itemConfig.gainPropCount);
            //         newItem.addTimeStamp = new Date().getTime();
            //         this._localItemDatas.push(newItem);
            //     }
            // }
            if (itemConfig.gain_item != null) {
                ItemConfigDropTool.getItemByConfig([itemConfig.gain_item]);
            }
        }

        if (this._localItemDatas[idx].count <= 0) {
            this._localItemDatas.splice(idx, 1);
        }
        for (const observe of this._observers) {
            observe.itemChanged();
        }
        sys.localStorage.setItem(this._localStorageKey, JSON.stringify(this._localItemDatas));

        return true;
    }
    public arrange(sortType: ItemArrangeType): void {
        if (sortType == ItemArrangeType.Recently) {
            this._localItemDatas.sort((a, b) => {
                return b.addTimeStamp - a.addTimeStamp;
            });

        } else if (sortType == ItemArrangeType.Rarity) {
            //bigger in front
            this._localItemDatas.sort((a, b) => {
                return this.getItemConf(b.itemConfigId).grade - this.getItemConf(a.itemConfigId).grade;
            });

        } else if (sortType == ItemArrangeType.Type) {
            //smaller in front
            this._localItemDatas.sort((a, b) => {
                return this.getItemConf(a.itemConfigId).itemType - this.getItemConf(b.itemConfigId).itemType;
            });
        }
        for (const observe of this._observers) {
            observe.itemChanged();
        }
    }

    public addObserver(observer: ItemMgrEvent) {
        this._observers.push(observer);
    }
    public removeObserver(observer: ItemMgrEvent) {
        const index: number = this._observers.indexOf(observer);
        if (index != -1) {
            this._observers.splice(index, 1);
        }
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new ItemMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }





    private _observers: ItemMgrEvent[] = [];
    public constructor() {

    }

    private _maxItemLength: number = 100;
    private _localStorageKey: string = "item_data";
    private _localItemDatas: ItemData[] = [];

    private static _instance: ItemMgr = null;
    private _itemConfs = {};
    private async _initData() {
        // read item config
        const obj = await new Promise((resolve) => {
            resources.load("data_local/itemconf", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        })
        if (obj != null) {
            // format config
            let jsonObj = obj as object;

            for (var id in jsonObj) {
                let jd = jsonObj[id];
                let d = new ItemConfigData();
                for (var key in jd) {
                    if (!d.hasOwnProperty(key)) {
                        continue;
                    }
                    d[key] = jd[key];
                }
                d.configId = jd.id;
                this._itemConfs[id] = d;
            }
        }

        // load local item data
        let jsonStr = sys.localStorage.getItem(this._localStorageKey);
        if (!jsonStr) {
            this._localItemDatas = [];
        }
        else {
            this._localItemDatas = JSON.parse(jsonStr);
        }
    }
}