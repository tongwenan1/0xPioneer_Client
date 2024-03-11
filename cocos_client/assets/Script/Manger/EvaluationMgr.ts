import { resources } from "cc";

export enum EvaluationCondType {
    newPioneer = 1,
    killEnemies = 2,
    gainResources = 3,
    exploredEvents = 4,
}
export enum EvaluationCondOperation {
    Greater = 1,
    LessEqual = 2,
}

export default class EvaluationMgr {
    public getConfigById(configId: string) {
        return this._configs.filter((config) => {
            return config.id == configId;
        });
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new EvaluationMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    public constructor() {}

    private static _instance: EvaluationMgr = null;
    private _configs: any = [];
    private async _initData() {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/evaluation", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (obj == null) {
            console.error("evaluation config err");
            return;
        }

        for (let k in obj) {
            this._configs.push(obj[k]);
        }

        this._configs.sort((a, b) => {
            // rank
            if (a.rank > b.rank) return 1;
            if (a.rank < b.rank) return -1;

            // id
            const aId = Number(a.id);
            const bId = Number(b.id);
            if (aId > bId) return 1;
            if (aId < bId) return -1;
            return 0;
        });
    }

    public getEvaluation(newPioneer: number, killEnemies: number, gainResources: number, exploredEvents: number) {
        for (let i = 0; i < this._configs.length; i++) {
            const conf = this._configs[i];
            if (conf.cond == null) {
                return conf;
            }

            for (let x = 0; x < conf.cond.length; x++) {
                const cd = conf.cond[x];
                const type = cd[0];
                const op = cd[1];
                const para = cd[2];

                let checkValue = null;
                if (type == EvaluationCondType.newPioneer) {
                    checkValue = newPioneer;
                } else if (type == EvaluationCondType.killEnemies) {
                    checkValue = killEnemies;
                } else if (type == EvaluationCondType.gainResources) {
                    checkValue = gainResources;
                } else if (type == EvaluationCondType.exploredEvents) {
                    checkValue = exploredEvents;
                } else {
                    break;
                }

                if (op == EvaluationCondOperation.Greater) {
                    if (checkValue <= para) {
                        break;
                    }
                } else if (op == EvaluationCondOperation.LessEqual) {
                    if (newPioneer > para) {
                        break;
                    }
                }
            }

            return conf;
        }
    }
}
