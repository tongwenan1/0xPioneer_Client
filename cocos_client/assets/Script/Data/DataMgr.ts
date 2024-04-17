import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import { s2c_user, share } from "../Net/msg/WebsocketMsg";
import CLog from "../Utils/CLog";
import { RunData } from "./RunData";
import { SaveData } from "./SaveData";

export class DataMgr {
    public static r: RunData;
    public static s: SaveData;

    public static async init(): Promise<boolean> {
        DataMgr.r = new RunData();
        DataMgr.s = new SaveData();

        return true;
    }

    public static async load() {
        await this.s.load();
    }

    public static async save() {
        await this.s.save();
    }

    ///////////////// websocket
    public static onmsg = (e: any) => {
        CLog.debug("DataMgr/onmsg: e => " + JSON.stringify(e));
    };

    public static enter_game_res = (e: any) => {
        let p: s2c_user.Ienter_game_res = e.data;
        if (p.res === 1) {
            if (p.data) {
                DataMgr.r.userInfo = p.data.info.sinfo;
                NotificationMgr.triggerEvent(NotificationName.USER_LOGIN_SUCCEED);
            }
            // reconnect
            if (DataMgr.r.reconnects > 0) {
                DataMgr.r.reconnects = 0;
            }
        }
    };

    public static get_pioneers_res = (e: any) => {
        let p: s2c_user.Iget_pioneers_res = e.data;
        // TODO: update all pioneers data

        
    };
}
