import { packetcodec } from "../../interface/protocol/packetcodec";
import { protobuf_c2s, protobuf_s2c } from "./protobufmsgs";

export const registermsg = (pcodec: packetcodec) => {

    // --- register server msg
    let msg_server = 0;
    for (const key in protobuf_s2c) {
        if (Number.isInteger(Number(key))) {
            const msgid = Number(key);
            const msgcmd = protobuf_s2c[key];
            const path = `s2c_user.${msgcmd}`;
            pcodec.register_protobuf_msg(Number(msgid), msgcmd, path);
            msg_server++;
        }
    }

    // --- register client msg
    let msg_client = 0;
    for (const key in protobuf_c2s) {
        if (Number.isInteger(Number(key))) {
            const msgid = Number(key);
            const msgcmd = protobuf_c2s[key];
            const path = `c2s_user.${msgcmd}`;
            pcodec.register_protobuf_msg(Number(msgid), msgcmd, path);
            msg_client++;
        }
    }
};
