import { resources } from "cc";
import { EvaluationConfigData } from "../Const/Evaluation";
import CLog from "../Utils/CLog";

export default class EvaluationConfig {
    private static _confs: EvaluationConfigData[] = [];

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/evaluation", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("EvaluationConfig init error");
            return false;
        }

        for (let k in obj) {
            this._confs.push(obj[k]);
        }

        this._confs.sort((a, b) => {
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

        CLog.debug("EvaluationConfig init success", this._confs);
        return true;
    }

    public static getById(evaluationId: string): EvaluationConfigData | null {
        const findConf = this._confs.filter((conf) => {
            return conf.id === evaluationId;
        });
        if (findConf.length > 0) {
            return findConf[0];
        }
        return null;
    }

    public static getAll(): EvaluationConfigData[] {
        return this._confs;
    }
}
