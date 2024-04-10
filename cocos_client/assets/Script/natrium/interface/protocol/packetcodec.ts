// natrium
// license : MIT
// author : Sean Chen

import buffer from "buffer";
import { bodylenbits, packet, packettype, prototype } from "./packet";

export interface packetcodec {
    load_protobufs(filenames: string[]): Promise<void>;
    parse_protobuf(source: string): void;
    register_protobuf_msg(msgid: number, msgcmd: string, path: string): void;
    create_protopkt(c: string, d: any): packet;

    create_shakehandpkt(time: number): packet;
    create_pingpongpkt(time: number): packet;
    create_jsonpkt(data: any): packet;
    create_stringpkt(data: string): packet;
    create_packet(pktp: packettype, prototp: prototype, bodylenbit: bodylenbits, compressed: boolean, data: object | null): packet;

    encode_packet(p: packet): buffer.Buffer;
    decode_packet(buffer: buffer.Buffer): packet;
}
