import {
    CountActionBuildingData,
    CountActionPioneerData,
    CountBuildInnerBuildingData,
    CountData,
    CountGenerateTroopsData,
    CountOpenBoxData,
    CountSelectDialogData,
    CountShowEventData,
    CountType,
    CountUseItemData,
} from "../../Const/Count";
import CLog from "../../Utils/CLog";

export class CountDataMgr {
    private _data: CountData[];
    private _key = "localCount";

    public async loadObj() {
        if (this._data == null) {
            this._data = [];
            const data = localStorage.getItem(this._key);
            if (data) {
                for (const d of JSON.parse(data)) {
                    this._data.push(d);
                }
            }
        }
        CLog.debug("CountDataMgr: loadObj, ", this._data);
    }

    public getObj() {
        return this._data;
    }

    private addObj(data: CountData) {
        this._data.push(data);
    }
    public addObj_actionPioneer(data: CountActionPioneerData) {
        this.addObj({
            type: CountType.actionPioneer,
            timeStamp: new Date().getTime(),
            data: data,
        });
        this.saveObj();
    }
    public addObj_actionBuilding(data: CountActionBuildingData) {
        this.addObj({
            type: CountType.actionBuilding,
            timeStamp: new Date().getTime(),
            data: data,
        });
        this.saveObj();
    }
    public addObj_openBox(data: CountOpenBoxData) {
        this.addObj({
            type: CountType.openBox,
            timeStamp: new Date().getTime(),
            data: data,
        });
        this.saveObj();
    }
    public addObj_selectDialog(data: CountSelectDialogData) {
        this.addObj({
            type: CountType.selectDialog,
            timeStamp: new Date().getTime(),
            data: data,
        });
        this.saveObj();
    }
    public addObj_showEvent(data: CountShowEventData) {
        this.addObj({
            type: CountType.showEvent,
            timeStamp: new Date().getTime(),
            data: data,
        });
        this.saveObj();
    }
    public addObj_buildInnerBuilding(data: CountBuildInnerBuildingData) {
        this.addObj({
            type: CountType.buildInnerBuilding,
            timeStamp: new Date().getTime(),
            data: data,
        });
        this.saveObj();
    }
    public addObj_generateTroops(data: CountGenerateTroopsData) {
        this.addObj({
            type: CountType.generateTroops,
            timeStamp: new Date().getTime(),
            data: data,
        });
        this.saveObj();
    }
    public addObj_useItem(data: CountUseItemData) {
        this.addObj({
            type: CountType.useItem,
            timeStamp: new Date().getTime(),
            data: data,
        });
        this.saveObj();
    }

    public async saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
    }
}
