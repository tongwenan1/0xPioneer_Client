import { resources, sys } from "cc";
import ItemData, { ItemConfigData } from "../Model/ItemData";
import UserInfoMgr, { FinishedEvent } from "./UserInfoMgr";

export default class ItemMgr {

    public getItemConf(itemConfigId: number):ItemConfigData {
        let key = itemConfigId.toString();
        if(key in this._itemConfs){
            return this._itemConfs[key];
        }
        return null;
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

    public constructor() {

    }

    public get localItemDatas():ItemData[] {
        return this._localItemDatas;
    }

    public modityItemData(itemDatas:ItemData[]) {
        this._localItemDatas = itemDatas;
        for (const item of itemDatas) {
            if (item.itemConfigId == 9) {
                UserInfoMgr.Instance.finishEvent(FinishedEvent.BecomeCityMaster);
            }
        }
        sys.localStorage.setItem(this._localStorageKey, JSON.stringify(itemDatas));
    }
    
    public allocItemId():number {
        let id = this._itemIdSeed;
        ++this._itemIdSeed;
        sys.localStorage.setItem(this._itemIdSeedStorageKey, this._itemIdSeed);

        return id;
    }

    private _itemIdSeedStorageKey: string = "item_id_seed";
    private _itemIdSeed = 1;
    
    private _localStorageKey: string = "item_data";
    private _localItemDatas:ItemData[] = [];

    private static _instance: ItemMgr = null;
    private _itemConfs={};
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

                for(var key in jd){
                    if (!d.hasOwnProperty(key)) {
                        continue;
                    }
                    d[key] = jd[key];
                }
                d["Id"] = parseInt(jd.id);
                this._itemConfs[id] = d;
            }
        }

        // load local item data
        
        let jsonStr = sys.localStorage.getItem(this._localStorageKey);
        if(!jsonStr) {
            this._localItemDatas = [];
        }
        else {
            this._localItemDatas = JSON.parse(jsonStr);
        }

        this._itemIdSeed = sys.localStorage.getItem(this._itemIdSeedStorageKey);
        if(!this._itemIdSeed) {
            this._itemIdSeed = 1;
        }
    }
}