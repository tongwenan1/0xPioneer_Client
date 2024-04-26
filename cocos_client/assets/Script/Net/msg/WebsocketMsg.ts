import { Vec2 } from "cc";
import ProtobufConfig from "../../Config/ProtobufConfig";
import { MapPioneerActionType, MapPioneerAttributesChangeModel, MapPioneerObject } from "../../Const/PioneerDefine";
import { natrium_ws } from "../../natrium/client/natrium_ws";
import { registermsg } from "../../natrium/share/msgs/registermsg";
import CLog from "../../Utils/CLog";
import { TilePos } from "../../Game/TiledMap/TileTool";
import ItemData from "../../Const/Item";
import { InnerBuildingType } from "../../Const/BuildingDefine";
import ArtifactData from "../../Model/ArtifactData";
import { EventConfigData } from "../../Const/Event";
import { MapBuildingObject } from "../../Const/MapBuilding";

export class WebsocketMsg {
    private _websocket_host: string;
    private _websocket: natrium_ws;

    public constructor(websocket_host: string = "") {
        this._websocket_host = websocket_host;
        this._websocket = new natrium_ws();
    }

    public get websocket() {
        return this._websocket;
    }

    public async websocketConnect(): Promise<boolean> {
        try {
            await this._websocket.connect(this._websocket_host);
        } catch (e) {
            CLog.error("WebsocketMsg: websocketConnect exception:", e);
            return false;
        }
        CLog.debug("WebsocketMsg: websocketConnect success");
        return true;
    }

    public init(): boolean {
        if (this._websocket_host == "") {
            CLog.error("WebsocketMsg: _websocket_host not set");
            return false;
        }

        this._websocket.init();

        if (this._websocket.connecter == null) {
            CLog.error("WebsocketMsg: _websocket init fail");
            return false;
        }

        let pcodec = this._websocket.connecter.pcodec;

        const protobuf = ProtobufConfig.getAll();
        pcodec.parse_protobuf(protobuf.c2s_user);
        pcodec.parse_protobuf(protobuf.s2c_user);
        pcodec.parse_protobuf(protobuf.share_structure);

        registermsg(pcodec);

        CLog.debug("WebsocketMsg: init success");

        return true;
    }

    public send_packet(cmd: string, data: any): void {
        if (this._websocket.connecter == null) {
            return;
        }
        CLog.debug(`WebsocketMsg, send_packet, cmd:${cmd}, data:`, data);

        let pkt = this._websocket.connecter.pcodec.create_protopkt(cmd, data);
        this._websocket.connecter.send_packet(pkt);
    }

    public login(d: c2s_user.Ilogin): void {
        this.send_packet("login", d);
    }

    public create_player(d: c2s_user.Icreate_player): void {
        this.send_packet("create_player", d);
    }

    public enter_game(d: c2s_user.Ienter_game): void {
        this.send_packet("enter_game", d);
    }

    // public create_pioneer(d: c2s_user.Icreate_pioneer): void {
    //     //this.send_packet("create_pioneer", d);

    //     // pioneernft func
    //     this._websocket.emit("mark_data_dirty", { type: "pioneer" });
    // }

    // public get_pioneers(d: c2s_user.Iget_pioneers): void {
    //     // this.send_packet("get_pioneers", d);

    //     // pioneernft func
    //     this._websocket.emit("get_pioneers_res", {});
    // }

    // public change_pioneer(d: c2s_user.Ichange_pioneer) {
    //     this._websocket.emit("change_pioneer_res", d);
    // }
    // public begin_pioneer_move(d: c2s_user.Ibegin_pioneer_move) {
    //     this._websocket.emit("begin_pioneer_move_res", d);
    // }

    public player_move(d: c2s_user.Iplayer_move) {
        this.send_packet("player_move", d);
    }
    public player_talk_select(d: c2s_user.Iplayer_talk_select) {
        this.send_packet("player_talk_select", d);
    }
    public player_gather(d: c2s_user.Iplayer_gather) {
        this.send_packet("player_gather", d);
    }
    public player_explore(d: c2s_user.Iplayer_explore) {
        this.send_packet("player_explore", d);
    }
    public player_fight(d: c2s_user.Iplayer_fight) {
        this.send_packet("player_fight", d);
    }
    public player_event_select(d: c2s_user.Iplayer_event_select) {
        this.send_packet("player_event_select", d);
    }
    public player_item_use(d: c2s_user.Iplayer_item_use) {
        this.send_packet("player_item_use", d);
    }
    public player_treasure_open(d: c2s_user.Iplayer_treasure_open) {
        this.send_packet("player_treasure_open", d);
    }
    public player_point_treasure_open(d: c2s_user.Iplayer_point_treasure_open) {
        this.send_packet("player_point_treasure_open", d);
    }
    public player_artifact_equip(d: c2s_user.Iplayer_artifact_equip) {
        this.send_packet("player_artifact_equip", d);
    }
    public player_artifact_remove(d: c2s_user.Iplayer_artifact_remove) {
        this.send_packet("player_artifact_remove", d);
    }
    public player_building_levelup(d: c2s_user.Iplayer_building_levelup) {
        this.send_packet("player_building_levelup", d);
    }
    public player_get_auto_energy(d: c2s_user.Iplayer_get_auto_energy) {
        this.send_packet("player_get_auto_energy", d);
    }
    public player_generate_energy(d: c2s_user.Iplayer_generate_energy) {
        this.send_packet("player_generate_energy", d);
    }
    public player_generate_troop(d: c2s_user.Iplayer_generate_troop) {
        this.send_packet("player_generate_troop", d);
    }
    public player_building_delegate_nft(d: c2s_user.Iplayer_building_delegate_nft) {
        this.send_packet("player_building_delegate_nft", d);
    }
}

export const WebsocketEvent = {
    connected: "connected",
    disconnected: "disconnected",
    shakehand: "shakehand",
    error: "error",
};

export enum Ichange_pioneer_type {
    showHide,
    GetNewTalk,
    actionType,
}
export interface Ichange_pioneer_showHide {
    show: boolean;
}
export interface Ichange_pioneer_actionType {
    type: MapPioneerActionType;
}
export interface Ichange_pioneer_newTalk {
    talkId: string;
}

export namespace c2s_user {
    export interface Ilogin {
        /** login name */
        name: string;

        /** login uid */
        uid: string;

        /** login token */
        token: string;
    }

    export interface Icreate_player {
        /** create_player pname */
        pname: string;

        /** create_player gender */
        gender: number;
    }

    export interface Ienter_game {}

    export interface Icreate_pioneer {
        type: string;
    }

    export interface Iget_pioneers {}

    export interface Ichange_pioneer {
        type: Ichange_pioneer_type;
        pioneerId: string;
        showHide?: Ichange_pioneer_showHide;
        actionType?: Ichange_pioneer_actionType;
        newTalk?: Ichange_pioneer_newTalk;
    }
    export interface Ibegin_pioneer_move {
        pioneerId: string;
        targetPos: Vec2;
    }

    export interface Iplayer_move {
        pioneerId: string;
        movePath: string;
        targetPos: string;
    }
    export interface Iplayer_talk_select {
        talkId: string;
        selectIndex: number;
    }
    export interface Iplayer_gather {
        pioneerId: string;
        resourceBuildingId: string;
    }
    export interface Iplayer_explore {
        pioneerId: string;
        isExporeBuilding: boolean;
        exploreId: string;
    }
    export interface Iplayer_fight {
        isTakeTheInitiative: boolean;
        isBuildingDefender: boolean;
        attackerId: string;
        defenderId: string;
    }
    export interface Iplayer_event_select {
        pioneerId: string;
        buildingId: string;
        eventId: string;
    }
    export interface Iplayer_item_use {
        itemId: string;
        num: number;
    }
    export interface Iplayer_treasure_open {
        boxId: string;
    }
    export interface Iplayer_point_treasure_open {
        boxId: string;
    }
    export interface Iplayer_artifact_equip {
        artifactId: string;
    }
    export interface Iplayer_artifact_remove {
        artifactId: string;
    }
    export interface Iplayer_building_levelup {
        innerBuildingId: string;
    }
    export interface Iplayer_get_auto_energy {}
    export interface Iplayer_generate_energy {
        num: number;
    }
    export interface Iplayer_generate_troop {
        num: number;
    }
    export interface Iplayer_building_delegate_nft {
        innerBuildingId: string;
        nftId: string;
    }
}

export namespace s2c_user {
    export interface Iserver_error {
        /** server_error res */
        res: number;
    }

    export interface Ilogin_res {
        /** login_res res */
        res: number;

        /** login_res isNew */
        isNew?: boolean | null;

        /** login_res data */
        data?: share.Iuser_data | null;
    }

    export interface Icreate_player_res {
        /** create_player_res res */
        res: number;

        /** create_player_res sinfo */
        sinfo?: share.Iplayer_sinfo | null;
    }

    export interface Ienter_game_res {
        /** enter_game_res res */
        res: number;

        /** enter_game_res data */
        data?: share.Iplayer_data | null;
    }

    export interface Imark_data_dirty {
        type: string;
    }

    export interface Iget_pioneers_res {
        res: number;
        data?: share.Ipioneer_info | null;
    }

    export interface Ichange_pioneer_res {
        res: number;
        type: Ichange_pioneer_type;
        pioneerId: string;
        showHide?: Ichange_pioneer_showHide;
        actionType?: Ichange_pioneer_actionType;
        newTalk: Ichange_pioneer_newTalk;
    }

    export interface Ibegin_pioneer_move_res {
        res: number;
        pioneerId: string;
        targetPos: Vec2;
    }

    export interface Iplayer_talk_select_res {
        talkId: string;
        selectIndex: number;
    }
    export interface Iplayer_gather_res {
        pioneerId: string;
        buildingId: string;
    }
    export interface Iplayer_explore_res {
        pioneerId: string;
        isExporeBuilding: boolean;
        exploreId: string;
        actionType: MapPioneerActionType;
    }
    export interface Iplayer_fight_res {
        isAttackBuilding: boolean,
        isSelfAttack: boolean;
        attacker: MapPioneerObject;
        pioneerDefender: MapPioneerObject;
        buildingDefender: MapBuildingObject;
        isEventFight?: boolean;
        eventCenterPositions?: Vec2[];
        temporaryAttributes?: Map<string, MapPioneerAttributesChangeModel>;
        fightOverCallback?: (isSelfWin: boolean) => void;
    }
    export interface player_event_select_res {
        pioneerId: string;
        buildingId: string;
        eventData: EventConfigData;
    }
    export interface Iplayer_item_use_res {
        itemId: string;
        num: number;
    }
    export interface Iplayer_treasure_open_res {
        boxId: string;
        items: ItemData[];
        artifacts: ArtifactData[];
        subItems?: ItemData[];
    }
    export interface Iplayer_point_treasure_open_res {
        boxId: string;
        items: ItemData[];
        artifacts: ArtifactData[];
        subItems?: ItemData[];
    }
    export interface Iplayer_artifact_equip_res {
        artifactId: string;
        effectIndex: number;
    }
    export interface Iplayer_artifact_remove_res {
        artifactId: string;
        effectIndex: number;
    }
    export interface Iplayer_building_levelup_res {
        innerBuildingType: InnerBuildingType;
        time: number;
        subItems: ItemData[];
    }
    export interface Iplayer_get_auto_energy_res {
        num: number;
    }
    export interface Iplayer_generate_energy_res {
        num: number;
        subItems: ItemData[];
    }
    export interface Iplayer_generate_troop_res {
        num: number;
        time: number;
        subItems: ItemData[];
    }
    export interface Iplayer_building_delegate_nft_res {
        innerBuildingId: string;
        nftId: string;
    }
}

export namespace share {
    export interface Iuser_data {
        /** user_data name */
        name: string;

        /** user_data uid */
        uid: string;

        /** user_data wallet */
        wallet: string;

        /** user_data lastlogintm */
        lastlogintm: number;
    }

    export interface Iplayer_sinfo {
        /** player_sinfo playerid */
        playerid: number;

        /** player_sinfo pname */
        pname: string;

        /** player_sinfo gender */
        gender: number;
    }

    export interface Iplayer_data {
        /** player_data info */
        info: share.Iplayer_info;
    }

    export interface Iplayer_info {
        /** player_info sinfo */
        sinfo: share.Iplayer_sinfo;
    }

    export interface Ipioneer_info {
        type: string;
    }
}
