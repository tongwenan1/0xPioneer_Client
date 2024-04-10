import { resources } from "cc";
import CLog from "../Utils/CLog";
import { ChainConfigData, ChainConfigsConfigData } from "../Const/Chain";

export default class ChainConfig {
    private static _confs: ChainConfigData;

    public static async init(): Promise<boolean> {
        const obj: any = await new Promise((resolve) => {
            resources.load("data_local/chain", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (!obj) {
            CLog.error("ChainConfig init error");
            return false;
        }

        this._confs = obj as ChainConfigData;
        CLog.debug("ChainConfig init success", this._confs);
        return true;
    }

    public static getCurrentChainId(): string {
        return this._confs.currentChainId;
    }
    public static getCurrentChainConfig(): ChainConfigsConfigData | null {
        return this.getByChainId(this.getCurrentChainId());
    }

    public static getByChainId(chainId: string): ChainConfigsConfigData | null {
        if (chainId in this._confs.configs) {
            return this._confs.configs[chainId];
        }
        CLog.error(`ChainConfig getByChainId error, chainId[${chainId}] not exist`);
        return null;
    }
}
