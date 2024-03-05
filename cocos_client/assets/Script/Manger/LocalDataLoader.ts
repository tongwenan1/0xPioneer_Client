import BoxMgr from "./BoxMgr";
import EventMgr from "./EventMgr";
import BuildingMgr from "./BuildingMgr";
import ConfigMgr from "./ConfigMgr";
import DropMgr from "./DropMgr";
import InnerBuildingMgr from "./InnerBuildingMgr";
import ItemMgr from "./ItemMgr";
import PioneerMgr from "./PioneerMgr";
import TalkMgr from "./TalkMgr";
import TaskMgr from "./TaskMgr";
import UserInfo from "./UserInfoMgr";
import BranchEventMgr from "./BranchEventMgr";
import LvlupMgr from "./LvlupMgr";
import LanMgr from "./LanMgr";

export default class LocalDataLoader {

    public static get instance() {
        if (!this._instance) {
            this._instance = new LocalDataLoader();
        }
        return this._instance;
    }

    public async loadLocalDatas() {
        this._loadStatus = 1;
        await LanMgr.Instance.initData();
        await BranchEventMgr.Instance.initData();
        await DropMgr.Instance.initData();
        await BoxMgr.Instance.initData();
        await InnerBuildingMgr.Instance.initData();
        await TalkMgr.Instance.initData();
        await UserInfo.Instance.initData();
        await BuildingMgr.instance.initData();
        await TaskMgr.Instance.initData();
        await PioneerMgr.instance.initData();
        await ItemMgr.Instance.initData();
        await ConfigMgr.Instance.initData();
        await LvlupMgr.Instance.initData();
        this._loadStatus = 2;
    }

    /**
     * 0-noload 
     * 1-loading 
     * 2-loaded
     */
    public get loadStatus() {
        return this._loadStatus;
    }

    public set loadStatus(value) {
        this._loadStatus = value;
    }

    private static _instance: LocalDataLoader = null;
    private _loadStatus: number = 0;
}