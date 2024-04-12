import { resources } from "cc";
import { NFTPioneerNameConfigData } from "../Const/PioneerDevelopDefine";

export default class NFTPioneerNameConfig {
    private static _confs: { [index: string]: NFTPioneerNameConfigData } = {};

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/name", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });

        if (!obj) {
            return false;
        }
        this._confs = obj;
        return true;
    }

    public static getById(id: string): NFTPioneerNameConfigData | null {
        if (id in this._confs) {
            return this._confs[id];
        }
        return null;
    }
}
