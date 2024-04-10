import ProtobufConfig from "../../../Config/ProtobufConfig";
import { natrium_ws } from "../../../natrium/client/natrium_ws";
import { registermsg } from "../../../natrium/share/msgs/registermsg";
import CLog from "../../../Utils/CLog";

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
            CLog.error("WebsocketMsg, wsConnect, exception:", e);
            return false;
        }
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

        return true;
    }

    public send_packet(cmd: string, data: any): void {
        if (this._websocket.connecter == null) {
            return;
        }
        CLog.info(`WebsocketMsg, send_packet, cmd:${cmd}, data:`, data);

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
}
