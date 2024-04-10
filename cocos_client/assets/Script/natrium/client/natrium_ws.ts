// natrium
// license : MIT
// author : Sean Chen

import { EventEmitter } from "../util/event_emmiter";
import { nat } from "../natrium";
import { wsconnecter, wsconnecter_handler } from "../interface/network/wsconnecter";
import { packet, prototype } from "../interface/protocol/packet";
import { Log } from "../util/Log";

export class natrium_ws extends EventEmitter implements wsconnecter_handler {
    protected _connecter: wsconnecter | null = null;

    protected _connect_resolve: any = null;
    protected _connect_reject: any = null;

    protected _ping_tm: number = 10000; // 10 sec

    constructor() {
        super();
    }

    public get connecter() {
        return this._connecter;
    }

    public init(): void {
        var c = nat.create_packetcodec();
        this._connecter = nat.create_wsconnecter(this, c);
    }

    public disconnect() {
        if (this._connecter == null) {
            return;
        }

        this._connecter.disconnect("disconnect");

        this._connect_reject = null;
        this._connect_resolve = null;
    }

    public async connect(uri: string): Promise<void> {
        if (this._connecter == null) {
            return;
        }

        this._connecter.connect(uri);

        let thisptr = this;
        return new Promise<void>((resolve, reject) => {
            thisptr._connect_resolve = resolve;
            thisptr._connect_reject = reject;
        });
    }

    on_connected(): void {
        Log.info(`natrium_ws on_connected`);

        this.stop_reconnect();
        this._connecter?.shakehand();

        this.emit("connected");
    }

    private _reconnect_timer: any = 0;
    private _reconnect_count = 0;
    // private _reconnetTimeOut = 5000;
    start_reconnect(uri: string, timerOut: number): void {
        this._reconnect_timer = setTimeout(() => {
            this._connecter?.disconnect("reconnect");
            this.connect(uri);
            this._reconnect_count++;
        }, timerOut);
    }

    stop_reconnect(): void {
        clearTimeout(this._reconnect_timer);
        this._reconnect_timer = 0;
        this._reconnect_count = 0;
    }

    private _heartbeat_timer: any = 0;
    start_heartbeat(): void {
        let thisptr = this;
        this._heartbeat_timer = setInterval(function () {
            thisptr._connecter?.ping();
        }, thisptr._ping_tm);
    }
    stop_heartbeat(): void {
        clearInterval(this._heartbeat_timer);
        this._heartbeat_timer = 0;
    }
    reset_heartbeat(): void {
        this.stop_heartbeat();
        this.start_heartbeat();
    }

    on_shakehand(): void {
        Log.info(`natrium_ws on_shakehand`);

        this.start_heartbeat();

        this.emit("shakehand");

        if (this._connect_resolve != null) {
            this._connect_resolve();

            this._connect_resolve = null;
            this._connect_reject = null;
        }
    }
    on_disconnected(reason: string): void {
        Log.info(`natrium_ws on_disconnected reason:${reason}`);

        if (this._connect_reject != null) {
            this._connect_reject();

            this._connect_resolve = null;
            this._connect_reject = null;
        }

        this.emit("disconnected", reason);
    }
    on_packet(p: packet): void {
        this.emit("onmsg", p);
        Log.debug("on_packet", p);
        // server did not use heartbeat so we use it to judge the server connection
        // this.reset_heartbeat();
        if (p.prototp == prototype.proto_json || p.prototp == prototype.proto_grpc) {
            this.emit(p.data.c, p.data.d);
        }
    }
}
