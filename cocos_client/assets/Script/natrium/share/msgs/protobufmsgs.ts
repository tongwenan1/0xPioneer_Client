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
}