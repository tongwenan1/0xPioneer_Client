import { c2s_user, share } from "../Net/msg/WebsocketMsg";

export class RunData {
    inited: boolean = false;

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
    // pending: share.Itran_data[];
    // pendingHistory: pendingHistoryData;

    height: number = 0;
    l1height: number = 0;

    public constructor() {

    }
}

export interface walletData {
    addr: string;
    type: string;
}
