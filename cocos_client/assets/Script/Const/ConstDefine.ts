export enum EventName {
    LOADING_FINISH = "LOADING_FINISH",

    SCENE_CHANGE = "SCENE_CHANGE",

    MAP_SCALED = "MAP_SCALED",

    CHANGE_LANG = "CHANG_LANG",

    /**
     * MainBuildUpgrade
     */
    BUILD_BEGIN_UPGRADE = "BUILD_BEGIN_UPGRADE",
    MAIN_BUILD_LEVEL_UP = "MAIN_BUILD_LEVEL_UP",

    FIGHT_FINISHED = "FIGHT_FINISHED",
    MINING_FINISHED = "MINING_FINISHED",


    ROOKIE_GUIDE_BEGIN_EYES = "ROOKIE_GUIDE_BEGIN_EYES",
    ROOKIE_GUIDE_THIRD_EYES = "ROOKIE_GUIDE_THIRD_EYES",
    ROOKIE_GUIDE_END_PIONEER_WAKE_UP = "ROOKIE_GUIDE_END_PIONEER_WAKE_UP"
}

export enum ResourceCorrespondingItem {
    Food = "8001",
    Wood = "8002",
    Stone = "8003",
    Troop = "8004",
    Energy = "8005",
    Gold = "8006"
}

export enum ItemConfigType {
    Item = 1,
    Artifact = 3,
    Drop = 4
}

export enum NPCNameLangType {
    Prophetess = "502001",
    DefaultPlayer = "502002",
    DoomsdayGangSpy = "502003",
    Hunter = "502004",
    SecretGuard = "502005",
    DoomsdayGangBigTeam = "502006",
    Artisan = "502007"
}
