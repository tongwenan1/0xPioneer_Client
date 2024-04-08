import { resources } from "cc";
import CLog from "../Utils/CLog";
import { AbiConfigData } from "../Const/Abi";

export default class AbiConfig {
    private static _confs: AbiConfigData;

    public static async init(abiFileName: string): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/" + abiFileName, (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("AbiConfig init error, fileName: " + abiFileName);
            return false;
        }

        this._confs = obj as AbiConfigData;
        CLog.debug("AbiConfig init success", this._confs);
        return true;
    }
}
