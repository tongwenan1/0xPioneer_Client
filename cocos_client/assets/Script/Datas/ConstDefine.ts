export enum EventName{
    SCENE_CHANGE = "SCENE_CHANGE",

    /**
     * MainBuildUpgrade
     */
    MAIN_BUILD_LEVEL_UP = "MAIN_BUILD_LEVEL_UP",

    BUILD_LEVEL_UP = "BUILD_LEVEL_UP",

    /**
     * PlayerStatusChanged
     */
    PIONEER_STATUS_CHNAGE = "PIONEER_STATUS_CHNAGE",

    ENERGY_CHANGE = "ENERGY_CHANGE",

    COIN_CHANGE = "COIN_CHANGE",
} 

export enum PioneerStatus {
    /**
     * idle
     */
    IN_TOWN = "IN_TOWN",
    /**
     * moveing
     */
    MOVING = "MOVING",
    /**
     * inRes
     */
    IN_RES = "IN_RES",
}

export enum OprateType {
    ResPoint= 0,
    Monster =1,
    SearchPoint = 2,
    MinePoint = 3,
    CampPoint = 4,
}

export enum ResPointType {
    /**
     * camp(occupied)
     */
    RES_CAMP = "RES_CAMP",

    /**
     * collect
     */
    RES_MINE = "RES_MINE",

    /**
     * treasure(battle)
     */
    RES_TREASURE = "RES_TREASURE",

    /**
     * monster
     */
    RES_MONSTER = "RES_MONSTER"
}

export enum ItemType{
    Energy = 0,
    Coin,
}