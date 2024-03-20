import { SettlementModel } from "../Const/Manager/SettlementMgrDefine";

export default class SettlementMgr {
    public insertSettlement(newSettlement: SettlementModel) {
        const index = this._settlements.findIndex(s => s.level == newSettlement.level);
        if (index >= 0) {
            const temple = this._settlements[index];
            temple.newPioneerIds = temple.newPioneerIds.concat(newSettlement.newPioneerIds);
            temple.killEnemies += newSettlement.killEnemies;
            temple.gainResources += newSettlement.gainResources;
            temple.exploredEvents += newSettlement.exploredEvents;
        } else {
            this._settlements.push(newSettlement);
        }
        localStorage.setItem(this._localSettleKey, JSON.stringify(this._settlements));
    }
    public getSettlement(beginLevel: number, endLevel: number) {
        const newSettlement: SettlementModel = {
            level: -1,
            newPioneerIds: [],
            killEnemies: 0,
            gainResources: 0,
            exploredEvents: 0,
        };
        for (const temple of this._settlements) {
            if (temple.level >= beginLevel && temple.level <= endLevel) {
                newSettlement.newPioneerIds = newSettlement.newPioneerIds.concat(temple.newPioneerIds);
                newSettlement.killEnemies += temple.killEnemies;
                newSettlement.gainResources += temple.gainResources;
                newSettlement.exploredEvents += temple.exploredEvents;
            }
        }
        return newSettlement;
    }

    private _settlements: SettlementModel[] = null;
    private _localSettleKey: string = "localSettlement";
    public constructor() {
        this._settlements = [];
        const localData = localStorage.getItem(this._localSettleKey);
        if (localData != null) {
            this._settlements = JSON.parse(localData);
        }
    }
}