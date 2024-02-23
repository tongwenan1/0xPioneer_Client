//import { Web3, Web3Eth, providers } from "web3"

export class Web3Helper {
    private static _pubaddr: string;

    private static _chainID: string;
    private static _chainName: string;
    //private static _web3: Web3;
    static getPubAddr(): string {
        return this._pubaddr;
    }
    static getChainID(): string {
        return this._chainID;
    }
    static getChainName(): string {
        return this._chainName;
    }
    static async LinkWallet(): Promise<boolean> {
        let provider = (window as any)["ethereum"] as any;//providers.http.HttpProvider;

        if (provider == undefined) {
            // console.warn('[LinkWallet]no metamask.');
            return false;
        }
        else {
            // console.log("[LinkWallethave metamask");

            try {
                var accounts = await provider.request({ method: "eth_requestAccounts" }) //pull up meta mask
                this._pubaddr = (accounts as any[0]).toString();
                // console.log("[LinkWallet]get acount:" + this._pubaddr);
                // this._web3 = new Web3(provider);
                // this._chainID =  (await this._web3.eth.getChainId()).toString();
                // this._chainName = this._web3.eth.defaultChain;
                // console.log("[LinkWallet]chain:" + this._chainName+"("+this._chainID+")");
                return true;
            }
            catch {
                this._pubaddr = "";
                // console.log("[LinkWallet]get acount + error");
                return false;
            }

        }
    }
    // static async getOwnerBalance():Promise<bigint>
    // {
    //     let b = await this._web3.eth.getBalance(this._pubaddr);
    //     console.log("[LinkWallet]balance = " + b);
    //     return b;
    // }

}