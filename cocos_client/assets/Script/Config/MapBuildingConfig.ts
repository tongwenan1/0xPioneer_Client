import { resources } from "cc";
import CLog from "../Utils/CLog";
import { MapBuildingConfigData } from "../Const/MapBuilding";

export default class MapBuildingConfig {
    private static _confs: MapBuildingConfigData[] = [];

    public static async init(): Promise<boolean> {
        // read config
        const obj = await new Promise((resolve) => {
            resources.load("data_local/map_building", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });

        if (!obj) {
            CLog.error("MapBuildingConfig init error");
            return false;
        }

        this._confs = obj as [];
        CLog.debug("MapBuildingConfig init success", this._confs);
        return true;
    }

    public static getAll(): MapBuildingConfigData[] {
        return this._confs;
    }

    public static getById(id: string): MapBuildingConfigData | undefined {
        return this._confs.find((conf) => conf.id === id);
    }
}
