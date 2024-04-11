// natrium
// license : MIT
// author : Sean Chen

import { sys_packet_cmds, shakehand_mark } from "../../interface/protocol/protocolconsts";
import { wsconnecter, wsconnecter_handler } from "../../interface/network/wsconnecter";
import { connection_close_code } from "../../interface/network/networkconsts";
import { packet, packettype } from "../../interface/protocol/packet";
import { packetcodec } from "../../interface/protocol/packetcodec";
import buffer from "buffer";
import { Log } from "../../util/Log";

export class wsconnecter_nodeimpl implements wsconnecter {
    protected _host: string = "";
    protected _handler: wsconnecter_handler;
    protected _pcodec: packetcodec;
    protected _ws: WebSocket | null = null;

    protected _lastpingtm = 0;
    protected _lastpongtm = 0;
    protected _latency = 0;
    protected _servertickfromstart = 0;

    constructor(h: wsconnecter_handler, p: packetcodec) {
        this._handler = h;
        this._pcodec = p;
    }

    public get host() {
        return this._host;
    }
    public get handler() {
        return this._handler;
    }
    public get pcodec() {
        return this._pcodec;
    }
    public get latency() {
        return this._latency;
    }
    public get server_tick() {
        return this._servertickfromstart + (Date.now() - this._lastpongtm);
    }

    public connect(host: string): boolean {
        if (this._pcodec == null) {
            Log.error("[natrium] wsconnecter_nodeimpl/connect: _pcodec is null");
            return false;
        }
        if (this._handler == null) {
            Log.error("[natrium] wsconnecter_nodeimpl/connect: _handler is null");
            return false;
        }

        this._host = host;
        // this._heartbeatCheck = 0;

        Log.debug(`[natrium] wsconnecter_nodeimpl/connect: try connect to [${host}]`);

        this._ws = new WebSocket(host);
        this._ws.binaryType = "arraybuffer";

        let thisptr = this;

        this._ws.onerror = (evt) => {
            thisptr._on_socket_error(evt);
        };
        this._ws.onopen = () => {
            thisptr._on_socket_connected();
        };
        this._ws.onclose = () => {
            thisptr._on_socket_close();
        };
        this._ws.onmessage = (evt) => {
            try {
                const binary = buffer.Buffer.from(evt.data, undefined, undefined);
                thisptr._on_socket_message(binary);
            } catch (e) {
                let err: Error = e as Error;
                Log.error(`[natrium] wsconnecter_nodeimpl/connect: _on_socket_message error:${err.message}\r\n${err.stack}`);
            }
        };

        return true;
    }
    public disconnect(reason: string): void {
        this._handler.stop_heartbeat();
        if (this._ws == null) {
            Log.error(`[natrium] wsconnecter_nodeimpl/disconnect: ws not connect`);
            return;
        }

        Log.debug(`[natrium] wsconnecter_nodeimpl/disconnect: disconnected`);
        this._ws.close(connection_close_code.client_close, reason);
    }
    public send_packet(p: packet): void {
        if (this._ws == null) {
            Log.error(`[natrium] wsconnecter_nodeimpl/send_packet: ws not connect`);
            return;
        }

        var data: buffer.Buffer = this._pcodec.encode_packet(p);
        if (data == null) {
            return;
        }

        this._ws.send(data.buffer);
    }
    public shakehand(): void {
        let p = this._pcodec.create_shakehandpkt(0); // fisrt msg, no servertime saved

        this._lastpingtm = Date.now();
        this.send_packet(p);
    }

    // private _heartbeatCheck = 0;
    public ping(): void {
        // if (this._heartbeatCheck >= 1) {
        // 	NetWorkManager.Disconnect();
        // 	return;
        // }
        let p = this._pcodec.create_pingpongpkt(this.server_tick);

        this._lastpingtm = Date.now();
        // this._heartbeatCheck++;
        this.send_packet(p);
    }
    public login(uid: string, token: string): void {}

    protected _on_socket_connected(): void {
        Log.debug(`[natrium] wsconnecter_nodeimpl/_on_socket_connected, [${this._host}] connected`);

        this._handler.on_connected();
    }

    protected _handle_sys_cmd(p: packet): void {
        switch (p.data.cmdid) {
            case sys_packet_cmds.spc_shakehand:
                {
                    // TO DO : check shakehand msg
                    if (p.data.mark == shakehand_mark) {
                        Log.debug(`[natrium] wsconnecter_nodeimpl/_handle_sys_cmd: shakehand over`);

                        this._lastpongtm = Date.now();
                        this._latency = this._lastpongtm - this._lastpingtm;
                        this._servertickfromstart = p.data.time;

                        this._handler.on_shakehand();
                    } else {
                        // Endian not same
                        Log.debug(`[natrium] wsconnecter_nodeimpl/_handle_sys_cmd: shakehand edian wrong`);
                    }
                }
                break;
            case sys_packet_cmds.spc_pingpong:
                {
                    // this._heartbeatCheck--;
                    this._lastpongtm = Date.now();
                    this._latency = this._lastpongtm - this._lastpingtm;
                    this._servertickfromstart = p.data.time;

                    Log.debug(`[natrium] wsconnecter_nodeimpl/_handle_sys_cmd: pingpong`);
                }
                break;
        }
    }

    protected _on_socket_message(data: buffer.Buffer): void {
        var p: packet = this._pcodec.decode_packet(data);
        if (p.pktp == packettype.pkt_sys) {
            this._handle_sys_cmd(p);
        } else {
            this._handler.on_packet(p);
        }
    }

    protected async _on_socket_error(err: Event): Promise<void> {
        Log.error("[natrium] wsconnecter_nodeimpl/_on_socket_error: err ", err);
    }

    protected _on_socket_close(): void {
        this._handler.on_disconnected("");
    }
}
