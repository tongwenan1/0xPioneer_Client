// natrium
// license : MIT
// author : Sean Chen

export enum protobuf_c2s {
    login = 1,
    create_player = 2,
    enter_game = 3,
    save_archives = 4,

    get_pending = 119,
    upload_pending = 121,
    get_pending_history = 122,
    get_block_height = 124,

    player_move = 200,
    player_talk_select = 201,
    player_gather = 202,
    player_explore = 203,
    player_fight = 204,
    player_event_select = 205,
    player_item_use = 206,
    player_treasure_open = 207,
    player_artifact_equip = 208,
    player_artifact_remove = 209,
    player_building_levelup = 210,
    player_get_auto_energy = 211,
    player_generate_energy = 212,
    player_generate_troop = 213,
    player_building_delegate_nft = 214,
    get_battle_report = 299,
}

export enum protobuf_s2c {
    server_error = 10000,
    login_res = 10001,
    create_player_res = 10002,
    enter_game_res = 10003,
    save_archives_res = 10004,

    get_pending_res = 10135,
    pending_change = 10136,
    upload_pending_res = 10138,
    get_pending_history_res = 10139,
    get_block_height_res = 10142,

    player_move_res = 20000,
    player_talk_select_res = 20201,
    player_gather_res = 20202,
    player_explore_res = 20203,
    player_fight_res = 20204,
    player_event_select_res = 20205,
    player_item_use_res = 20206,
    player_treasure_open_res = 20207,
    player_artifact_equip_res = 20208,
    player_artifact_remove_res = 20209,
    player_building_levelup_res = 20210,
    player_get_auto_energy_res = 20211,
    player_generate_energy_res = 20212,
    player_generate_troop_res = 20213,
    player_building_delegate_nft_res = 20214,
    get_battle_report_res = 20299,
}