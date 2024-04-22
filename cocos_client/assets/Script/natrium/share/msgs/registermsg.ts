import { packetcodec } from "../../interface/protocol/packetcodec";
import { protobuf_c2s, protobuf_s2c } from "./protobufmsgs";

export const registermsg = (pcodec: packetcodec) => {
    // register server msg
    pcodec.register_protobuf_msg(protobuf_s2c.server_error, "server_error", "s2c_user.server_error");
    pcodec.register_protobuf_msg(protobuf_s2c.login_res, "login_res", "s2c_user.login_res");
    pcodec.register_protobuf_msg(protobuf_s2c.create_player_res, "create_player_res", "s2c_user.create_player_res");
    pcodec.register_protobuf_msg(protobuf_s2c.enter_game_res, "enter_game_res", "s2c_user.enter_game_res");
    pcodec.register_protobuf_msg(protobuf_s2c.save_archives_res, "save_archives_res", "s2c_user.save_archives_res");

    pcodec.register_protobuf_msg(protobuf_s2c.get_pending_res, "get_pending_res", "s2c_user.get_pending_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_pending_history_res, "get_pending_history_res", "s2c_user.get_pending_history_res");
    pcodec.register_protobuf_msg(protobuf_s2c.pending_change, "pending_change", "s2c_user.pending_change");
    pcodec.register_protobuf_msg(protobuf_s2c.upload_pending_res, "upload_pending_res", "s2c_user.upload_pending_res");

    pcodec.register_protobuf_msg(protobuf_s2c.player_move_res, "player_move_res", "s2c_user.player_move_res");

    // register client msg
    pcodec.register_protobuf_msg(protobuf_c2s.login, "login", "c2s_user.login");
    pcodec.register_protobuf_msg(protobuf_c2s.create_player, "create_player", "c2s_user.create_player");
    pcodec.register_protobuf_msg(protobuf_c2s.enter_game, "enter_game", "c2s_user.enter_game");
    pcodec.register_protobuf_msg(protobuf_c2s.save_archives, "save_archives", "c2s_user.save_archives");

    pcodec.register_protobuf_msg(protobuf_c2s.get_pending, "get_pending", "c2s_user.get_pending");
    pcodec.register_protobuf_msg(protobuf_c2s.get_pending_history, "get_pending_history", "c2s_user.get_pending_history");
    pcodec.register_protobuf_msg(protobuf_c2s.upload_pending, "upload_pending", "c2s_user.upload_pending");
    pcodec.register_protobuf_msg(protobuf_c2s.get_block_height, "get_block_height", "c2s_user.get_block_height");

    pcodec.register_protobuf_msg(protobuf_c2s.player_move, "player_move", "c2s_user.player_move");
}