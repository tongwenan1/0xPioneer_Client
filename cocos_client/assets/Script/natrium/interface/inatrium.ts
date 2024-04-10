// natrium
// license : MIT
// author : Sean Chen

import { wsconnecter, wsconnecter_handler } from "./network/wsconnecter";
import { packetcodec } from "./protocol/packetcodec";

export interface inatrium {
    create_wsconnecter(h: wsconnecter_handler, p: packetcodec): wsconnecter;

    create_packetcodec(): packetcodec;
}
