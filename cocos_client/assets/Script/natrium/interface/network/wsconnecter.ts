// natrium
// license : MIT
// author : Sean Chen

import { packet } from "../protocol/packet";
import { packetcodec } from "../protocol/packetcodec";

export interface wsconnecter_handler {
    on_connected(): void;
    on_shakehand(): void;
    on_disconnected(reason: string): void;
    on_packet(p: packet): void;
    start_heartbeat(): void;
    stop_heartbeat(): void;
    reset_heartbeat(): void;
}

export interface wsconnecter {
    readonly host: string;
    readonly handler: wsconnecter_handler;
    readonly pcodec: packetcodec;
    readonly latency: number;
    readonly server_tick: number;

    connect(host: string): boolean;
    disconnect(reason: string): void;
    send_packet(p: packet): void;
    shakehand(): void;
    ping(): void;
    login(uid: string, token: string): void;
}
