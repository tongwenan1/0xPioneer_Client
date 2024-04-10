// natrium
// license : MIT
// author : Sean Chen

export enum protobuf_c2s {
    login = 1,
    create_player = 2,
    enter_game = 3,
}

export enum protobuf_s2c {
    server_error = 10000,
    login_res = 10001,
    create_player_res = 10002,
    enter_game_res = 10003,
}
