// natrium
// license : MIT
// author : Sean Chen

import buffer from "buffer";
import * as pako from "pako";

import { bodylenbits, packet, packettype, prototype } from "../../interface/protocol/packet";
import { packetcodec } from "../../interface/protocol/packetcodec";
import { sys_packet_cmds, shakehand_mark } from "../../interface/protocol/protocolconsts";
import { packet_nodeimpl } from "./packet_nodeimpl";
import { _protobuf_mgr } from "./_protobuf_mgr";

export class packetcodec_nodeimpl implements packetcodec {
    public async load_protobufs(filenames: string[]): Promise<void> {
        await _protobuf_mgr.loadProtobufFiles(filenames);
    }
    public parse_protobuf(source: string): void {
        _protobuf_mgr.parseProtobuf(source);
    }
    public register_protobuf_msg(msgid: number, msgcmd: string, path: string): void {
        _protobuf_mgr.registerMsg(msgid, msgcmd, path);
    }
    public create_protopkt(c: string, d: any): packet {
        return this.create_packet(packettype.pkt_msg, prototype.proto_grpc, bodylenbits.bit8, false, { c: c, d: d }); // bodylenbits & compressed is set in encode_packet
    }

    public create_shakehandpkt(time: number): packet {
        let datas: buffer.Buffer = buffer.Buffer.alloc(9);
        datas.writeUInt8(sys_packet_cmds.spc_shakehand, 0);
        datas.writeUInt32LE(shakehand_mark, 1);
        datas.writeUInt32LE(time, 5);

        return this.create_packet(packettype.pkt_sys, prototype.proto_binary, bodylenbits.bit8, false, datas);
    }

    public create_pingpongpkt(time: number): packet {
        let datas: buffer.Buffer = buffer.Buffer.alloc(5);
        datas.writeUInt8(sys_packet_cmds.spc_pingpong, 0);
        datas.writeUInt32LE(time, 1);

        return this.create_packet(packettype.pkt_sys, prototype.proto_binary, bodylenbits.bit8, false, datas);
    }

    public create_jsonpkt(data: any): packet {
        return this.create_packet(packettype.pkt_msg, prototype.proto_json, bodylenbits.bit8, false, data); // bodylenbits & compressed is set in encode_packet
    }

    public create_stringpkt(data: string): packet {
        return this.create_packet(packettype.pkt_msg, prototype.proto_text, bodylenbits.bit8, false, data); // bodylenbits & compressed is set in encode_packet
    }

    public create_packet(pktp: packettype, prototp: prototype, bodylenbit: bodylenbits, compressed: boolean, data: any): packet {
        let h = packet_nodeimpl.make_header(pktp, prototp, bodylenbit, compressed);
        return new packet_nodeimpl(h, data);
    }

    protected _write_protocol_tobuf(p: packet): buffer.Buffer {
        switch (p.prototp) {
            case prototype.proto_binary:
                return p.data;
            case prototype.proto_grpc:
                {
                    const msgT = _protobuf_mgr.msgs[p.data.c];
                    const msg = msgT.create(p.data.d);

                    const msgbuf = msgT.encode(msg).finish();
                    const msgid = _protobuf_mgr.get_msgid_bycmd(p.data.c);

                    let buf = buffer.Buffer.alloc(2);
                    buf.writeUInt16LE(msgid, 0);
                    return buffer.Buffer.concat([buf, msgbuf]);
                }
                break;
            case prototype.proto_json:
                {
                    let jsonstr = JSON.stringify(p.data);
                    return buffer.Buffer.from(jsonstr, "utf8");
                }
                break;
            case prototype.proto_text:
                return buffer.Buffer.from(p.data as string, "utf8");
            case prototype.proto_xml:
                {
                    // TO DO : xml
                }
                break;
        }

        return p.data;
    }

    protected _decode_sys_cmd(buffer: buffer.Buffer, offset: number): Object {
        let data: any = {};

        data.cmdid = buffer.readUInt8(offset);
        offset += 1;
        switch (data.cmdid) {
            case sys_packet_cmds.spc_shakehand:
                data.mark = buffer.readUInt32LE(offset);
                offset += 4;
                data.time = buffer.readUInt32LE(offset);
                break;
            case sys_packet_cmds.spc_pingpong:
                data.time = buffer.readUInt32LE(offset);
                break;
        }

        return data;
    }

    protected _read_protocol_frombuf(p: packet_nodeimpl, buffer: buffer.Buffer, offset: number): packet {
        switch (p.prototp) {
            case prototype.proto_binary:
                {
                    if (p.pktp == packettype.pkt_sys) {
                        p.data = this._decode_sys_cmd(buffer, offset);
                    } else {
                        p.data = buffer.subarray(offset);
                    }
                }
                break;
            case prototype.proto_grpc:
                {
                    // read command id
                    const msgid = buffer.readUInt16LE(offset);
                    offset += 2;
                    const msgcmd = _protobuf_mgr.get_msgcmd_byid(msgid);
                    if (!msgcmd) {
                        console.error(`[natrium] packetcodec_nodeimpl/_read_protocol_frombuf: msgid[${msgid}] not exist!!`);
                    }
                    const data = _protobuf_mgr.msgs[msgcmd].decode(buffer.subarray(offset));
                    p.data = {
                        c: msgcmd,
                        d: data,
                    };
                }
                break;
            case prototype.proto_json:
                {
                    let jsonstr = buffer.toString("utf8", offset);
                    p.data = JSON.parse(jsonstr);
                }
                break;
            case prototype.proto_text:
                {
                    p.data = buffer.toString("utf8", offset);
                }
                break;
            case prototype.proto_xml:
                {
                    // TO DO : xml
                }
                break;
        }

        return p;
    }

    public encode_packet(p: packet): buffer.Buffer {
        let protodata: buffer.Buffer = this._write_protocol_tobuf(p);

        // TO DO : do zip in thread
        let isZiped = false;

        if (protodata.length > 1024) {
            //let zipedbuf = zlib.brotliCompressSync(protodata);
            //let zipedbuf = (new zlib.Zlib.Deflate(protodata)).compress();
            let zipedbuf = buffer.Buffer.from(pako.deflateRaw(protodata));
            if (zipedbuf.length < protodata.length) {
                protodata = zipedbuf;
                isZiped = true;
            }
        }

        let bodylenbit: bodylenbits = bodylenbits.bit8;
        let lensize = 1;
        if (protodata.length <= 0xff) {
        } else if (protodata.length > 0xff && protodata.length <= 0xffff) {
            bodylenbit = bodylenbits.bit16;
            lensize = 2;
        } else if (protodata.length > 0xffff && protodata.length <= 0xffffffff) {
            bodylenbit = bodylenbits.bit32;
            lensize = 4;
        } else {
            // TO DO : too big
            // err
            const err = `[natrium] packetcodec_nodeimpl/encode_packet: protodata.length[${protodata.length}] too big`;
            console.error(err);
            throw new Error(err);
        }

        (p as packet_nodeimpl).set_bitszipped(bodylenbit, isZiped);

        let header: buffer.Buffer = buffer.Buffer.alloc(1 + lensize);
        header.writeUInt8(p.header, 0);
        switch (lensize) {
            case 1:
                header.writeUInt8(protodata.length, 1);
                break;
            case 2:
                header.writeUInt16LE(protodata.length, 1);
                break;
            case 4:
                header.writeUInt32LE(protodata.length, 1);
                break;
        }
        return buffer.Buffer.concat([header, protodata]);
    }
    public decode_packet(buf: buffer.Buffer): packet {
        let header = buf.readUInt8(0);
        let pkt = new packet_nodeimpl(header, null);
        let len = 0;
        let offset = 1;
        switch (pkt.bodylenbit) {
            case bodylenbits.bit8:
                len = buf.readUInt8(1);
                offset = 2;
                break;
            case bodylenbits.bit16:
                len = buf.readUInt16LE(1);
                offset = 3;
                break;
            case bodylenbits.bit32:
                len = buf.readUInt32LE(1);
                offset = 5;
                break;
        }

        let bufferLenLeft = buf.length - offset;
        if (len != bufferLenLeft) {
            const err = `[natrium] packetcodec_nodeimpl/decode_packet: len[${len}] != buffer len[${bufferLenLeft}]`;
            console.error(err);
            throw new Error(err);
        }

        // TO DO : do unzip in thread

        if (pkt.compressed) {
            //buf = buffer.Buffer.from(buf.subarray(offset));
            //buf = zlib.brotliDecompressSync(buf);
            //buf = (new zlib.Zlib.Inflate(buf)).decompress();
            buf = buffer.Buffer.from(pako.inflateRaw(buf.subarray(offset)));
            offset = 0;
        }

        this._read_protocol_frombuf(pkt, buf, offset);

        return pkt;
    }
}
