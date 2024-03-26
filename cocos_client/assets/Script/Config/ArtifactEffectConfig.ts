import { resources } from "cc";
import { ArtifactEffectConfigData } from "../Const/Artifact";
import CLog from "../Utils/CLog";

export default class ArtifactEffectConfig {
    private static _confs: { [index: string]: ArtifactEffectConfigData } = {};

    public static async init(): Promise<boolean> {
        // read artifact effect config
        const effobj = await new Promise((resolve) => {
            resources.load("data_local/artifact_effect", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });

        if (!effobj) {
            CLog.error("ArtifactEffectConfig init error");
            return false;
        }

        // format config
        let jsonObj = effobj as object;

        for (var id in jsonObj) {
            let jd = jsonObj[id];
            let d = new ArtifactEffectConfigData();
            for (var key in jd) {
                if (!d.hasOwnProperty(key)) {
                    continue;
                }
                d[key] = jd[key];
            }
            d.effectId = jd.id;
            this._confs[id] = d;
        }
        CLog.debug("ArtifactEffectConfig init success", this._confs);
        return true;
    }

    public static getById(effectConfigId: string): ArtifactEffectConfigData {
        if (effectConfigId in this._confs) {
            return this._confs[effectConfigId];
        }
        console.error(`ArtifactEffectConfig geConfigById error, config[${effectConfigId}] not exist`);
        return null;
    }
}
