import NotificationMgr from "../../Basic/NotificationMgr";
import ProtobufConfig from "../../Config/ProtobufConfig";
import { natrium_ws } from "../../natrium/client/natrium_ws";
import { registermsg } from "../../natrium/share/msgs/registermsg";
import CLog from "../../Utils/CLog";

export class WebsocketMsg {
    private _websocket_host: string;
    private _websocket: natrium_ws;

    public constructor(websocket_host: string = "") {
        this._websocket_host = websocket_host;
        this._websocket = new natrium_ws();
    }

    public get websocket() {
        return this._websocket;
    }

    public async websocketConnect(): Promise<boolean> {
        try {
            await this._websocket.connect(this._websocket_host);
        } catch (e) {
            CLog.error("WebsocketMsg: websocketConnect exception:", e);
            return false;
        }
        CLog.debug("WebsocketMsg: websocketConnect success");
        return true;
    }

    public init(): boolean {
        if (this._websocket_host == "") {
            CLog.error("WebsocketMsg: _websocket_host not set");
            return false;
        }

        this._websocket.init();

        if (this._websocket.connecter == null) {
            CLog.error("WebsocketMsg: _websocket init fail");
            return false;
        }

        let pcodec = this._websocket.connecter.pcodec;

        const protobuf = ProtobufConfig.getAll();
        pcodec.parse_protobuf(protobuf.c2s_user);
        pcodec.parse_protobuf(protobuf.s2c_user);
        pcodec.parse_protobuf(protobuf.share_structure);

        registermsg(pcodec);

        CLog.debug("WebsocketMsg: init success");

        return true;
    }

    public send_packet(cmd: string, data: any): void {
        if (this._websocket.connecter == null) {
            return;
        }
        CLog.debug(`WebsocketMsg, send_packet, cmd:${cmd}, data:`, data);

        let pkt = this._websocket.connecter.pcodec.create_protopkt(cmd, data);
        this._websocket.connecter.send_packet(pkt);
    }

    public login(d: c2s_user.Ilogin): void {
        this.send_packet("login", d);
    }

    public create_player(d: c2s_user.Icreate_player): void {
        this.send_packet("create_player", d);
    }

    public enter_game(d: c2s_user.Ienter_game): void {
        this.send_packet("enter_game", d);
    }

    public create_pioneer(d: c2s_user.Icreate_pioneer): void {
        //this.send_packet("create_pioneer", d);

        // pioneernft func
        this._websocket.emit("mark_data_dirty", { type: "pioneer" });
    }

    public get_pioneers(d: c2s_user.Iget_pioneers): void {
        // this.send_packet("get_pioneers", d);

        // pioneernft func
        this._websocket.emit("get_pioneers_res", {});
    }
}

export const WebsocketEvent = {
    connected: "connected",
    disconnected: "disconnected",
    shakehand: "shakehand",
    error: "error",
};

export namespace c2s_user {
    export interface Ilogin {
        /** login name */
        name: string;

        /** login uid */
        uid: string;

        /** login token */
        token: string;
    }

    export interface Icreate_player {
        /** create_player pname */
        pname: string;

        /** create_player gender */
        gender: number;
    }

    export interface Ienter_game {}

    export interface Icreate_pioneer {
        type: string;
    }

    export interface Iget_pioneers {}
}

export namespace s2c_user {
    export interface Iserver_error {
        /** server_error res */
        res: number;
    }

    export interface Ilogin_res {
        /** login_res res */
        res: number;

        /** login_res isNew */
        isNew?: boolean | null;

        /** login_res data */
        data?: share.Iuser_data | null;
    }

    export interface Icreate_player_res {
        /** create_player_res res */
        res: number;

        /** create_player_res sinfo */
        sinfo?: share.Iplayer_sinfo | null;
    }

    export interface Ienter_game_res {
        /** enter_game_res res */
        res: number;

        /** enter_game_res data */
        data?: share.Iplayer_data | null;
    }

    export interface Imark_data_dirty {
        type: string;
    }

    export interface Iget_pioneers_res {
        res: number;
        data?: share.Ipioneer_info | null;
    }
}

export namespace share {
    export interface Iuser_data {
        /** user_data name */
        name: string;

        /** user_data uid */
        uid: string;

        /** user_data wallet */
        wallet: string;

        /** user_data lastlogintm */
        lastlogintm: number;
    }

    export interface Iplayer_sinfo {
        /** player_sinfo playerid */
        playerid: number;

        /** player_sinfo pname */
        pname: string;

        /** player_sinfo gender */
        gender: number;
    }

    export interface Iplayer_data {
        /** player_data info */
        info: share.Iplayer_info;
    }

    export interface Iplayer_info {
        /** player_info sinfo */
        sinfo: share.Iplayer_sinfo;
    }

    export interface Ipioneer_info {
        type: string;
    }
}
