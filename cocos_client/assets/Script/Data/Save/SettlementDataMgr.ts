import ItemConfig from "../../Config/ItemConfig";
import { SettlementModel } from "../../Const/Manager/SettlementMgrDefine";

export class SettlementDataMgr {
    private _data: SettlementModel[];
    private _baseKey: string = "localSettlement";
    private _key: string = "";

    public async loadObj(walletAddr: string) {
        this._key = walletAddr + "|" + this._baseKey;
        if (this._data == null) {
            this._data = [];
            const data = localStorage.getItem(this._key);
            if (data) {
                this._data = JSON.parse(data);
            }
        }
    }

    public getObj(beginLevel: number, endLevel: number) {
        const newSettlement: SettlementModel = {
            level: -1,
            newPioneerIds: [],
            killEnemies: 0,
            gainResources: 0,
            consumeResources: 0,
            gainTroops: 0,
            consumeTroops: 0,
            gainEnergy: 0,
            consumeEnergy: 0,
            exploredEvents: 0,
        };
        for (const temple of this._data) {
            if (temple.level >= beginLevel && temple.level <= endLevel) {
                newSettlement.newPioneerIds = newSettlement.newPioneerIds.concat(temple.newPioneerIds);
                newSettlement.killEnemies += temple.killEnemies;
                newSettlement.gainResources += temple.gainResources;
                newSettlement.consumeResources += temple.consumeResources;
                newSettlement.gainTroops += temple.gainTroops;
                newSettlement.consumeTroops += temple.consumeTroops;
                newSettlement.gainEnergy += temple.gainEnergy;
                newSettlement.consumeEnergy += temple.consumeEnergy;
                newSettlement.exploredEvents += temple.exploredEvents;
            }
        }
        return newSettlement;
    }

    public addObj(newSettlement: SettlementModel) {
        const index = this._data.findIndex(s => s.level == newSettlement.level);
        if (index >= 0) {
            const temple = this._data[index];
            temple.newPioneerIds = temple.newPioneerIds.concat(newSettlement.newPioneerIds);
            temple.killEnemies += newSettlement.killEnemies;
            temple.gainResources += newSettlement.gainResources;
            temple.consumeResources += newSettlement.consumeResources;
            temple.gainTroops += newSettlement.gainTroops;
            temple.consumeTroops += newSettlement.consumeTroops;
            temple.gainEnergy += newSettlement.gainEnergy;
            temple.consumeEnergy += newSettlement.consumeEnergy;
            temple.exploredEvents += newSettlement.exploredEvents;
        } else {
            this._data.push(newSettlement);
        }

        this.saveObj()
    }

    public async saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
    }
}
