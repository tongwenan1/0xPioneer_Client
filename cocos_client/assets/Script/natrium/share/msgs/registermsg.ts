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
    pcodec.register_protobuf_msg(protobuf_s2c.player_talk_select_res, "player_talk_select_res", "s2c_user.player_talk_select_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_gather_res, "player_gather_res", "s2c_user.player_gather_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_explore_res, "player_explore_res", "s2c_user.player_explore_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_fight_res, "player_fight_res", "s2c_user.player_fight_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_event_select_res, "player_event_select_res", "s2c_user.player_event_select_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_item_use_res, "player_item_use_res", "s2c_user.player_item_use_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_treasure_open_res, "player_treasure_open_res", "s2c_user.player_treasure_open_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_artifact_equip_res, "player_artifact_equip_res", "s2c_user.player_artifact_equip_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_artifact_remove_res, "player_artifact_remove_res", "s2c_user.player_artifact_remove_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_building_levelup_res, "player_building_levelup_res", "s2c_user.player_building_levelup_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_get_auto_energy_res, "player_get_auto_energy_res", "s2c_user.player_get_auto_energy_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_generate_energy_res, "player_generate_energy_res", "s2c_user.player_generate_energy_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_generate_troop_res, "player_generate_troop_res", "s2c_user.player_generate_troop_res");
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_building_delegate_nft_res,
        "player_building_delegate_nft_res",
        "s2c_user.player_building_delegate_nft_res"
    );
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_point_treasure_open_res,
        "player_point_treasure_open_res",
        "s2c_user.player_point_treasure_open_res"
    );
    pcodec.register_protobuf_msg(protobuf_s2c.player_nft_lvlup_res, "player_nft_lvlup_res", "s2c_user.player_nft_lvlup_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_nft_rankup_res, "player_nft_rankup_res", "s2c_user.player_nft_rankup_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_nft_skill_learn_res, "player_nft_skill_learn_res", "s2c_user.player_nft_skill_learn_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_nft_skill_forget_res, "player_nft_skill_forget_res", "s2c_user.player_nft_skill_forget_res");
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_world_treasure_lottery_res,
        "player_world_treasure_lottery_res",
        "s2c_user.player_world_treasure_lottery_res"
    );
    pcodec.register_protobuf_msg(protobuf_s2c.player_heat_value_change_res, "player_heat_value_change_res", "s2c_user.player_heat_value_change_res");
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_world_treasure_pool_change_res,
        "player_world_treasure_pool_change_res",
        "s2c_user.player_world_treasure_pool_change_res"
    );
    pcodec.register_protobuf_msg(protobuf_s2c.player_add_heat_value_res, "player_add_heat_value_res", "s2c_user.player_add_heat_value_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_rookie_finish_res, "player_rookie_finish_res", "s2c_user.player_rookie_finish_res");
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_wormhole_set_defender_res,
        "player_wormhole_set_defender_res",
        "s2c_user.player_wormhole_set_defender_res"
    );
    pcodec.register_protobuf_msg(
        protobuf_s2c.player_wormhole_set_attacker_res,
        "player_wormhole_set_attacker_res",
        "s2c_user.player_wormhole_set_attacker_res"
    );
    pcodec.register_protobuf_msg(protobuf_s2c.player_wormhole_fight_res, "player_wormhole_fight_res", "s2c_user.player_wormhole_fight_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_bind_nft_res, "player_bind_nft_res", "s2c_user.player_bind_nft_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_pioneer_change_show_res, "player_pioneer_change_show_res", "s2c_user.player_pioneer_change_show_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_event_res, "player_event_res", "s2c_user.player_event_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_treasure_info_res, "get_treasure_info_res", "s2c_user.get_treasure_info_res");
    pcodec.register_protobuf_msg(protobuf_s2c.get_battle_report_res, "get_battle_report_res", "s2c_user.get_battle_report_res");

    pcodec.register_protobuf_msg(protobuf_s2c.storhouse_change, "storhouse_change", "s2c_user.storhouse_change");
    pcodec.register_protobuf_msg(protobuf_s2c.player_exp_change, "player_exp_change", "s2c_user.player_exp_change");
    pcodec.register_protobuf_msg(protobuf_s2c.player_treasure_progress_change, "player_treasure_progress_change", "s2c_user.player_treasure_progress_change");

    pcodec.register_protobuf_msg(protobuf_s2c.fetch_user_psyc_res, "fetch_user_psyc_res", "s2c_user.fetch_user_psyc_res");
    pcodec.register_protobuf_msg(protobuf_s2c.player_actiontype_change, "player_actiontype_change", "s2c_user.player_actiontype_change");

    pcodec.register_protobuf_msg(protobuf_s2c.player_heat_change, "player_heat_change", "s2c_user.player_heat_change");

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
    pcodec.register_protobuf_msg(protobuf_c2s.player_talk_select, "player_talk_select", "c2s_user.player_talk_select");
    pcodec.register_protobuf_msg(protobuf_c2s.player_gather, "player_gather", "c2s_user.player_gather");
    pcodec.register_protobuf_msg(protobuf_c2s.player_explore, "player_explore", "c2s_user.player_explore");
    pcodec.register_protobuf_msg(protobuf_c2s.player_fight, "player_fight", "c2s_user.player_fight");
    pcodec.register_protobuf_msg(protobuf_c2s.player_event_select, "player_event_select", "c2s_user.player_event_select");
    pcodec.register_protobuf_msg(protobuf_c2s.player_item_use, "player_item_use", "c2s_user.player_item_use");
    pcodec.register_protobuf_msg(protobuf_c2s.player_treasure_open, "player_treasure_open", "c2s_user.player_treasure_open");
    pcodec.register_protobuf_msg(protobuf_c2s.player_artifact_equip, "player_artifact_equip", "c2s_user.player_artifact_equip");
    pcodec.register_protobuf_msg(protobuf_c2s.player_artifact_remove, "player_artifact_remove", "c2s_user.player_artifact_remove");
    pcodec.register_protobuf_msg(protobuf_c2s.player_building_levelup, "player_building_levelup", "c2s_user.player_building_levelup");
    pcodec.register_protobuf_msg(protobuf_c2s.player_get_auto_energy, "player_get_auto_energy", "c2s_user.player_get_auto_energy");
    pcodec.register_protobuf_msg(protobuf_c2s.player_generate_energy, "player_generate_energy", "c2s_user.player_generate_energy");
    pcodec.register_protobuf_msg(protobuf_c2s.player_generate_troop, "player_generate_troop", "c2s_user.player_generate_troop");
    pcodec.register_protobuf_msg(protobuf_c2s.player_building_delegate_nft, "player_building_delegate_nft", "c2s_user.player_building_delegate_nft");
    pcodec.register_protobuf_msg(protobuf_c2s.player_point_treasure_open, "player_point_treasure_open", "c2s_user.player_point_treasure_open");
    pcodec.register_protobuf_msg(protobuf_c2s.player_nft_lvlup, "player_nft_lvlup", "c2s_user.player_nft_lvlup");
    pcodec.register_protobuf_msg(protobuf_c2s.player_nft_rankup, "player_nft_rankup", "c2s_user.player_nft_rankup");
    pcodec.register_protobuf_msg(protobuf_c2s.player_nft_skill_learn, "player_nft_skill_learn", "c2s_user.player_nft_skill_learn");
    pcodec.register_protobuf_msg(protobuf_c2s.player_nft_skill_forget, "player_nft_skill_forget", "c2s_user.player_nft_skill_forget");
    pcodec.register_protobuf_msg(
        protobuf_c2s.player_world_treasure_lottery,
        "player_world_treasure_lottery",
        "c2s_user.player_world_treasure_lottery"
    );
    pcodec.register_protobuf_msg(protobuf_c2s.player_add_heat_value, "player_add_heat_value", "c2s_user.player_add_heat_value");
    pcodec.register_protobuf_msg(protobuf_c2s.player_rookie_finish, "player_rookie_finish", "c2s_user.player_rookie_finish");
    pcodec.register_protobuf_msg(protobuf_c2s.player_wormhole_set_defender, "player_wormhole_set_defender", "c2s_user.player_wormhole_set_defender");
    pcodec.register_protobuf_msg(protobuf_c2s.player_wormhole_set_attacker, "player_wormhole_set_attacker", "c2s_user.player_wormhole_set_attacker");
    pcodec.register_protobuf_msg(protobuf_c2s.player_wormhole_fight, "player_wormhole_fight", "c2s_user.player_wormhole_fight");
    pcodec.register_protobuf_msg(protobuf_c2s.player_bind_nft, "player_bind_nft", "c2s_user.player_bind_nft");
    pcodec.register_protobuf_msg(protobuf_c2s.player_pioneer_change_show, "player_pioneer_change_show", "c2s_user.player_pioneer_change_show");
    pcodec.register_protobuf_msg(protobuf_c2s.player_event, "player_event", "c2s_user.player_event");
    pcodec.register_protobuf_msg(protobuf_c2s.get_treasure_info, "get_treasure_info", "c2s_user.get_treasure_info");
    pcodec.register_protobuf_msg(protobuf_c2s.get_battle_report, "get_battle_report", "c2s_user.get_battle_report");

    pcodec.register_protobuf_msg(protobuf_c2s.fetch_user_psyc, "fetch_user_psyc", "c2s_user.fetch_user_psyc");
};
