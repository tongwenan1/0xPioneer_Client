// natrium
// license : MIT
// author : Sean Chen

import { inatrium } from "../interface/inatrium";
import { wsconnecter, wsconnecter_handler } from "../interface/network/wsconnecter";
import { packetcodec } from "../interface/protocol/packetcodec";
import { wsconnecter_nodeimpl } from "./network/wsconnecter_nodeimpl";
import { packetcodec_nodeimpl } from "./protocol/packetcodec_nodeimpl";

export class natrium_nodeimpl implements inatrium {
    public static readonly impl: natrium_nodeimpl = new natrium_nodeimpl();

    constructor() {}

    public create_wsconnecter(h: wsconnecter_handler, p: packetcodec): wsconnecter {
        return new wsconnecter_nodeimpl(h, p);
    }

    public create_packetcodec(): packetcodec {
        return new packetcodec_nodeimpl();
    }
}
