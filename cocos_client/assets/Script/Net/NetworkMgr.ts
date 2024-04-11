import { natrium_http } from "../natrium/client/natrium_http";
import { natrium_ws } from "../natrium/client/natrium_ws";

import { HttpMsg } from "./msg/HttpMsg";

import { Ethereum, EthereumEventType, WalletType } from "./ethers/Ethereum";

import CLog from "../Utils/CLog";
import ChainConfig from "../Config/ChainConfig";
import { WebsocketEvent, WebsocketMsg, c2s_user } from "./msg/WebsocketMsg";
import { EthereumMsg } from "./msg/EthereumMsg";

export class NetworkMgr {
    private _httpmsg: HttpMsg;
    private _websocketMsg: WebsocketMsg;
    private _ethereumMsg: EthereumMsg;

    public get websocketMsg(): WebsocketMsg {
        return this._websocketMsg;
    }
    public get websocket(): natrium_ws {
        return this._websocketMsg.websocket;
    }

    public get ethereumMsg(): EthereumMsg {
        return this._ethereumMsg;
    }
    public get ethereum(): Ethereum {
        return this._ethereumMsg.ethereum;
    }

    public get httpMsg(): HttpMsg {
        return this._httpmsg;
    }
    public get http(): natrium_http {
        return this._httpmsg.http;
    }

    public init_http(http_host: string): boolean {
        this._httpmsg = new HttpMsg(http_host);
        return this._httpmsg.init();
    }
    public init_ws(ws_host: string): boolean {
        this._websocketMsg = new WebsocketMsg(ws_host);
        return this._websocketMsg.init();
    }
    public init_ethereum(): boolean {
        this._ethereumMsg = new EthereumMsg();
        return true;
    }

    public async websocketConnect(): Promise<boolean> {
        return await this.websocketMsg.websocketConnect();
    }

    public async walletInit(walletType: WalletType = WalletType.ethereum): Promise<void> {
        await this.ethereum.init(walletType);
    }

    public async LoginServer(account: string, walletType: string): Promise<c2s_user.Ilogin | null> {
        const signMessage = "Ethereum Signed Message:\n    Welcome to 0xPioneer\n    Login by address\n" + Math.floor(Date.now() / 1000);
        const signature = await this.ethereumMsg.signMessage(signMessage);

        CLog.info(`NetworkMgr, LoginServer, signature: ${signature}`);

        let r = await this.httpMsg.verify(account, signMessage, ChainConfig.getCurrentChainId(), signature, walletType);
        CLog.info("NetworkMgr, LoginServer, r: ", r);

        if (r.res == "OK") {
            let d: c2s_user.Ilogin = { name: "", uid: r.data.uid, token: r.data.token };
            this.websocketMsg.login(d);
            return d;
        }
        return null;
    }

    private _onerror() {
        CLog.error("websocket error ...");
    }
}
