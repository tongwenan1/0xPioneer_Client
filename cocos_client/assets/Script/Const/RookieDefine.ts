export enum RookieStep {
    WAKE_UP = 0,

    NPC_TALK_1 = 10,

    NPC_TALK_3 = 20,

    PIOT_TO_HEAT = 30,

    LOCAL_ANIM_PIOT_FROM_TOP_TO_HEAT = 31,

    NPC_TALK_4 = 40,

    OPEN_BOX_1 = 50,

    NPC_TALK_5 = 60,

    TASK_SHOW_TAP_1 = 70,

    ENEMY_FIGHT = 80,

    TASK_SHOW_TAP_2 = 90,

    NPC_TALK_6 = 100,

    OPEN_BOX_2 = 110,

    NPC_TALK_7 = 120,

    ENTER_INNER = 130,

    MAIN_BUILDING_TAP_1 = 140,

    TASK_SHOW_TAP_3 = 150,

    NPC_TALK_19 = 160,

    RESOURCE_COLLECT = 170,

    ENTER_INNER_2 = 180,

    MAIN_BUILDING_TAP_2 = 190,

    SYSTEM_TALK_20 = 200,

    OPEN_BOX_3 = 210,

    SYSTEM_TALK_21 = 220,

    MAIN_BUILDING_TAP_3 = 230,

    SYSTEM_TALK_22 = 240,

    ENTER_OUTER = 250,

    WORMHOLE_ATTACK = 260,

    SYSTEM_TALK_23 = 270,
    
    DEFEND_TAP = 280,

    SYSTEM_TALK_24 = 290,

    LOCAL_DEFEND_TAP_CLOSE = 300,

    FINISH = 999999,
}

export enum RookieResourceAnim {
    PIONEER_0_TO_GOLD,
    GOLD_TO_HEAT,
    BOX_1_TO_PSYC,
    BOX_2_TO_PSYC,
    BOX_3_TO_PSYC,
}

export interface RookieResourceAnimStruct {
    animType: RookieResourceAnim;
    callback: () => void;
}
