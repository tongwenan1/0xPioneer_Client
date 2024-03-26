import EvaluationConfig from "../Config/EvaluationConfig";
import { EvaluationCondOperation, EvaluationCondType } from "../Const/Evaluation";

export default class EvaluationMgr {
    public constructor() {}

    public getEvaluation(newPioneer: number, killEnemies: number, gainResources: number, exploredEvents: number) {
        const configs = EvaluationConfig.getAll();
        for (let i = 0; i < configs.length; i++) {
            const conf = configs[i];
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
