import { resources, sys } from "cc";
import ItemData, { ItemConfigData, ItemType } from "../Model/ItemData";
import UserInfoMgr, { FinishedEvent } from "./UserInfoMgr";

export enum ItemArrangeType {
    Recently = "Recently",
    Rarity = "Rarity",
    Type = "Type",
}

export interface ItemMgrEvent {
    itemChanged(): void;
}

export default class ItemMgr {

    public getItemConf(itemConfigId: number): ItemConfigData {
        let key = itemConfigId.toString();
        if (key in this._itemConfs) {
            return this._itemConfs[key];
        }
        return null;
    }
    public get itemIsFull(): boolean {
        return this._localItemDatas.length >= this._maxItemLength;
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
            if (this.itemIsFull) {
                break;
            }
            changed = true;
            if (item.itemConfigId == 9) {
                //get master key
                UserInfoMgr.Instance.finishEvent(FinishedEvent.BecomeCityMaster);
            }
            // add timestamp
            item.addTimeStamp = new Date().getTime();
            this._localItemDatas.push(item);
        }
        if (changed) {
            for (const observe of this._observers) {
                observe.itemChanged();
            }
            sys.localStorage.setItem(this._localStorageKey, JSON.stringify(this._localItemDatas));
        }
    }
    public subItem(itemConfigId: number, count: number): boolean {
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
            if (itemConfig.itemType == ItemType.AddProp) {
                switch (itemConfig.gainPropName) {
                    case "wood":
                        UserInfoMgr.Instance.wood += itemConfig.gainPropCount;
                        break;
                    case "food":
                        UserInfoMgr.Instance.food += itemConfig.gainPropCount;
                        break;
                    case "troop":
                        UserInfoMgr.Instance.troop += itemConfig.gainPropCount;
                        break;
                    case "stone":
                        UserInfoMgr.Instance.stone += itemConfig.gainPropCount;
                        break;
                }
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
                d.configId = parseInt(jd.id);
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