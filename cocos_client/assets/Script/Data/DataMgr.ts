import NotificationMgr from "../Basic/NotificationMgr";
import ChainConfig from "../Config/ChainConfig";
import { NotificationName } from "../Const/Notification";
import { NetworkMgr } from "../Net/NetworkMgr";
import { EthereumEventData_accountChanged, EthereumEventData_chainChanged, EthereumEventData_init, EthereumEventType } from "../Net/ethers/Ethereum";
import { c2s_user, s2c_user, share } from "../Net/msg/WebsocketMsg";
import CLog from "../Utils/CLog";

export class DataMgr {
    public static n: NetworkMgr;
    public static s: StoreData;

    public static async init(): Promise<boolean> {
        const chainConfig = ChainConfig.getCurrentChainConfig();
        const init_http = !!chainConfig.api.init_http;
        const init_ws = !!chainConfig.api.init_ws;
        const init_ethereum = !!chainConfig.api.init_ethereum;

        DataMgr.n = new NetworkMgr();
        DataMgr.s = new StoreData();

        // init ethereum
        if (init_ethereum) {
            if (!DataMgr.n.init_ethereum()) {
                return false;
            }

            // add ethereum listener
            DataMgr.n.ethereum.on(EthereumEventType.accountChanged, this.accountChanged_res);
            DataMgr.n.ethereum.on(EthereumEventType.chainChanged, this.chainChanged_res);
            DataMgr.n.ethereum.on(EthereumEventType.init, this.init_res);
        } else {
            CLog.warn("DataMgr: ethereum init skipped");
        }

        // init http
        if (init_http) {
            if (!DataMgr.n.init_http(chainConfig.api.http_host)) {
                return false;
            }
        } else {
            CLog.warn("DataMgr: http init skipped");
        }

        // init websocket
        if (init_ws) {
            if (!DataMgr.n.init_ws(chainConfig.api.ws_host)) {
                return false;
            }

            // add websocket listener
            DataMgr.n.websocket.on("disconnected", this.disconnected);
            DataMgr.n.websocket.on("connected", this.connected);

            DataMgr.n.websocket.on("login_res", this.login_res);
            DataMgr.n.websocket.on("create_player_res", this.create_player_res);
            DataMgr.n.websocket.on("enter_game_res", this.enter_game_res);

            DataMgr.n.websocketConnect(); // async
        } else {
            CLog.warn("DataMgr: websocket init skipped");
            NotificationMgr.triggerEvent(NotificationName.GAME_INITED);
        }

        return true;
    }
    public static async loginServer(account: string, walletType: string) {
        let r = await DataMgr.n.LoginServer(account, walletType);
        if (r?.token) {
            DataMgr.s.wallet.type = walletType;
            DataMgr.s.loginInfo = r;
        }
    }

    ///////////////// ethereum
    private static accountChanged_res = (e: any) => {
        CLog.error("accountChanged", e);
        let d: EthereumEventData_accountChanged = e.data;
        let newAccount = d.changedAccount;

        DataMgr.s.wallet.addr = "";
        DataMgr.s.wallet.type = "";
    };
    private static chainChanged_res = (e: any) => {
        CLog.error("chainChanged", e);
        let d: EthereumEventData_chainChanged = e.data;
        let newChainId = d.changedChainId;

        DataMgr.s.wallet.addr = "";
        DataMgr.s.wallet.type = "";
    };

    ///////////////// websocket
    public static async logout() {
        DataMgr.s = new StoreData();
        DataMgr.n.websocket.disconnect();
    }
    public static async reconnect() {
        CLog.info(`DataMgr, reconnect, count: ${DataMgr.s.reconnects++}`);
        DataMgr.s.reconnects++;
        let r = await DataMgr.n.websocketConnect();
        if (r) {
            CLog.info(`DataMgr, reconnect success`);
            if (DataMgr.s.wallet.addr) {
                CLog.info(`DataMgr, reconnect login`);
                DataMgr.n.websocketMsg.login(DataMgr.s.loginInfo);
            }
        }
    }
    private static connected = (e: any) => {
        NotificationMgr.triggerEvent(NotificationName.GAME_INITED);
    };
    private static disconnected = (e: any) => {
        CLog.error("DataMgr, disconnected, e: ", e);
        if (DataMgr.s.reconnects < 3) {
            DataMgr.reconnect();
        } else {
            CLog.error("Connecting Failed!!!");
        }
    };
    private static init_res = (e: any) => {
        let d: EthereumEventData_init = e.data;
        if (d.res === 0) {
            this.loginServer(d.account, d.walletType);
        }
    };
    private static login_res = (e: any) => {
        let p: s2c_user.Ilogin_res = e.data;
        if (p.res === 1) {
            if (!p.data?.uid) return;
            DataMgr.s.wallet.addr = p.data.wallet;
            if (p.isNew) {
                DataMgr.n.websocketMsg.create_player({ pname: `Pioneer_${p.data.uid}`, gender: 0 });
            } else {
                DataMgr.n.websocketMsg.enter_game({});
            }
        }
    };
    private static create_player_res = (e: any) => {
        let p: s2c_user.Icreate_player_res = e.data;
        if (p.res === 1) {
            DataMgr.n.websocketMsg.enter_game({});
        }
    };
    private static enter_game_res = (e: any) => {
        let p: s2c_user.Ienter_game_res = e.data;
        if (p.res === 1) {
            if (p.data) {
                DataMgr.s.userInfo = p.data.info.sinfo;
                NotificationMgr.triggerEvent(NotificationName.USER_LOGIN_SUCCEED);
            }
            // reconnect
            if (DataMgr.s.reconnects > 0) {
                DataMgr.s.reconnects = 0;
            }
        }
    };
}

export class StoreData {
    wallet: walletData = {
        addr: "",
        type: "",
    };

    reconnects: number = 0;

    loginInfo: c2s_user.Ilogin = {
        name: "",
        uid: "",
        token: "",
    };

    userInfo: share.Iplayer_sinfo = {
        playerid: 0,
        pname: "",
        gender: 0
    };

    // pending: share.Itran_data[];
    // pendingHistory: pendingHistoryData;

    height: number = 0;
    l1height: number = 0;
}

export interface walletData {
    addr: string;
    type: string;
}
