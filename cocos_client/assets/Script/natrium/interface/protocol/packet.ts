// natrium
// license : MIT
// author : Sean Chen

export enum packettype {
    pkt_sys = 1,
    pkt_route = 2,
    pkt_msg = 3,
}

export enum prototype {
    proto_text = 1,
    proto_json = 2,
    proto_xml = 3,
    proto_grpc = 4,
    proto_binary = 5,
}

export enum bodylenbits {
    bit8 = 0,
    bit16 = 1,
    bit32 = 2,
}

// packet
// 8bit header
// 8-32bit byte length
// body[byte length]
export interface packet {
    readonly pktp: packettype; // packettype, 2bit
    readonly prototp: prototype; // prototype, 3bit
    readonly bodylenbit: bodylenbits; // bodylenbits, 2bit
    readonly compressed: boolean; // 1bit

    readonly header: number; // 2+3+1+2 = 8 bit

    readonly data: any; // from body data
}
