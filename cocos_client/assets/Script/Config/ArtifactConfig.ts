import { resources } from "cc";
import { ArtifactConfigData } from "../Const/Model/ArtifactModelDefine";
import CLog from "../Utils/CLog";

export default class ArtifactConfig {
    private static _confs = {};

    public static async init(): Promise<boolean> {
        // read artifact config
        const obj = await new Promise((resolve) => {
            resources.load("data_local/artifact", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (obj != null) {
            // format config
            let jsonObj = obj as object;

            for (var id in jsonObj) {
                let jd = jsonObj[id];
                let d = new ArtifactConfigData();
                for (var key in jd) {
                    if (!d.hasOwnProperty(key)) {
                        continue;
                    }
                    d[key] = jd[key];
                }
                d.configId = jd.id;
                this._confs[id] = d;
            }
            CLog.debug("ArtifactConfig init success", this._confs);
            return true;
        } else {
            CLog.error("ArtifactConfig init error");
        }
        return false;
    }

    public static getById(artifactConfigId: string): ArtifactConfigData {
        let key = artifactConfigId;
        if (key in this._confs) {
            return this._confs[key];
        }
        CLog.error(`ArtifactConfig getConfigById error, config[${key}] not exist`);
        return null;
    }
}
