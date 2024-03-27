export enum EventName {
    MAP_SCALED = "MAP_SCALED",
    CHANGE_CURSOR = "CHANGE_CURSOR",
    CHANGE_GAMECAMERA_POSITION = "CHANGE_GAMECAMERA_POSITION",
    CHANGE_GAMECAMERA_ZOOM = "CHANGE_GAMECAMERA_ZOOM",


    LOADING_FINISH = "LOADING_FINISH",


    SCENE_CHANGE = "SCENE_CHANGE",

    

    CHANGE_LANG = "CHANG_LANG",

    /**
     * MainBuildUpgrade
     */
    MAIN_BUILD_LEVEL_UP = "MAIN_BUILD_LEVEL_UP",

    FIGHT_FINISHED = "FIGHT_FINISHED",
    MINING_FINISHED = "MINING_FINISHED",


    ROOKIE_GUIDE_BEGIN_EYES = "ROOKIE_GUIDE_BEGIN_EYES",
    ROOKIE_GUIDE_THIRD_EYES = "ROOKIE_GUIDE_THIRD_EYES",
    ROOKIE_GUIDE_END_PIONEER_WAKE_UP = "ROOKIE_GUIDE_END_PIONEER_WAKE_UP",

    /**
     * Artifact
     */
    ARTIFACT_CHANGE = "ARTIFACT_CHANGE",
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


export const enum ECursorStyle {
    url = "url",
    default = "default",
    auto = "auto",
    crosshair = "crosshair",
    pointer = "pointer",
    move = "move",
    e_resize = "e-resize",
    ne_resize = "ne-resize",
    nw_resize = "nw-resize",
    n_resize = "n-resize",
    se_resize = "se-resize",
    sw_resize = "sw-resize",
    s_resize = "s-resize",
    w_resize = "w-resize",
    text = "text",
    wait = "wait",
    help = "help"
}

export interface GetPropData {
    type: number,
    propId: string,
    num: number
}

export enum GetPropRankColor {
    RANK1 = "#40ffa3",
    RANK2 = "#409aff",
    RANK3 = "#dd40ff",
    RANK4 = "#ff9e40",
    RANK5 = "#ff4040",
}