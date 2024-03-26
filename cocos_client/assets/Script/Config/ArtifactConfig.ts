import { resources } from "cc";
import { ArtifactConfigData } from "../Const/Artifact";
import CLog from "../Utils/CLog";

export default class ArtifactConfig {
    private static _confs: { [index: string]: ArtifactConfigData } = {};

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

        if (!obj) {
            CLog.error("ArtifactConfig init error");
            return false;
        }

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
    }

    public static getById(artifactConfigId: string): ArtifactConfigData {
        if (artifactConfigId in this._confs) {
            return this._confs[artifactConfigId];
        }
        CLog.error(`ArtifactConfig getConfigById error, config[${artifactConfigId}] not exist`);
        return null;
    }
}
