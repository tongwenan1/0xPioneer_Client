// natrium
// license : MIT
// author : Sean Chen

import { bodylenbits, packet, packettype, prototype } from "../../interface/protocol/packet";

export class packet_nodeimpl implements packet {
    protected _header: number = 0;
    protected _data: any = null;

    public static make_header(pktp: packettype, prototp: prototype, bodylenbit: bodylenbits, compressed: boolean): number {
        return (pktp << 6) | (prototp << 3) | (bodylenbit << 1) | (compressed ? 1 : 0);
    }

    constructor(h: number, d: any) {
        this._header = h;
        this._data = d;
    }

    // packettype, 2bit
    public get pktp(): packettype {
        return this._header >> 6;
    }
    // prototype, 3bit
    public get prototp(): prototype {
        return (this._header >> 3) & 0x7;
    }
    // bodylenbits, 2bit
    public get bodylenbit(): bodylenbits {
        return (this._header >> 1) & 0x3;
    }
    // 1bit
    public get compressed(): boolean {
        return (this._header & 0x1) == 1;
    }

    public get header(): number {
        return this._header;
    }

    public get data(): any {
        return this._data;
    }

    public set data(v: any) {
        this._data = v;
    }

    public set_bitszipped(bodylenbit: bodylenbits, compressed: boolean) {
        this._header = (this._header & 0xf8) | (bodylenbit << 1) | (compressed ? 1 : 0);
    }
}
