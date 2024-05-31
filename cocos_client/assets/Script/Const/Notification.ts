export enum NotificationName {
    //------------------------------------ init and login
    CONFIG_LOADED = 100,
    GAME_INITED,
    USER_LOGIN_SUCCEED,

    //------------------------------------ rookie guide
    ROOKIE_GUIDE_BEGIN_EYES,
    ROOKIE_GUIDE_THIRD_EYES,
    ROOKIE_GUIDE_END_PIONEER_WAKE_UP,

    //------------------------------------ game sence
    CHANGE_CURSOR,
    GAME_SHOW_RESOURCE_TYPE_TIP,
    GAME_CAMERA_POSITION_CHANGED,
    GAME_CAMERA_ZOOM_CHANGED,
    GAME_INNER_AND_OUTER_CHANGED,
    GAME_INNER_BUILDING_LATTICE_EDIT_CHANGED,
    GAME_INNER_LATTICE_EDIT_ACTION_MOUSE_DOWN,
    GAME_INNER_LATTICE_EDIT_ACTION_MOUSE_UP,
    GAME_INNER_LATTICE_EDIT_ACTION_MOUSE_MOVE,
    
    //---------------------- userInfo
    USERINFO_DID_CHANGE_NAME,
    USERINFO_DID_CHANGE_EXP,
    USERINFO_DID_CHANGE_LEVEL,
    USERINFO_DID_CHANGE_TREASURE_PROGRESS,
    USERINFO_DID_CHANGE_HEAT,

    //---------------------- settlement
    SETTLEMENT_DATA_CHANGE,

    //------------------------------------ inner building
    INNER_BUILDING_UPGRADE_FINISHED,
    INNER_BUILDING_DATA_CHANGE,

    //------------------------------------ language
    CHANGE_LANG,

    //------------------------------------ item
    RESOURCE_GETTED,
    RESOURCE_CONSUMED,
    ITEM_CHANGE,

    //------------------------------------ artifact
    ARTIFACT_CHANGE,
    ARTIFACT_EQUIP_DID_CHANGE,

    //------------------------------------ battle report
    FIGHT_FINISHED,
    MINING_FINISHED,
    EVENT_STEPEND,
    BATTLE_REPORT_LIST_CHANGED,

    //---------------------- task
    TASK_CANNOTGET,
    TASK_DID_CHANGE,
    TASK_NEW_GETTED,
    TASK_LIST,

    //------------------------------------ map building
    MAP_BUILDING_SHOW_CHANGE,
    MAP_BUILDING_FACTION_CHANGE,
    MAP_BUILDING_WORMHOLE_ATTACKER_CHANGE,
    MAP_BUILDING_WORMHOLE_ATTACK_COUNT_DONW_TIME_CHANGE,
    MAP_BUILDING_ACTION_PIONEER_CHANGE,

    //---------------------- map pioneer
    MAP_FAKE_FIGHT_SHOW,
    MAP_PIONEER_EVENTID_CHANGE,

    MAP_PIONEER_FIGHT_BEGIN,
    MAP_PIONEER_FIGHT_END,
    
    MAP_PIONEER_BEGIN_MOVE,
    MAP_PLAYER_PIONEER_DID_MOVE_STEP,
    MAP_PIONEER_MOVE_MEETTED,
    MAP_PIONEER_SHOW_CHANGED,
    MAP_PIONEER_TALK_CHANGED,
    MAP_PIONEER_FACTION_CHANGED,
    MAP_PIONEER_ACTIONTYPE_CHANGED,
    MAP_PIONEER_STAY_POSITION_CHANGE,
    MAP_PIONEER_HP_CHANGED,

    //---------------------- nft
    NFT_LEVEL_UP,
    NFT_RANK_UP,
    NFT_LEARN_SKILL,
    NFT_FORGET_SKILL,
    NFT_DELEGATE_BUILDING,
}
