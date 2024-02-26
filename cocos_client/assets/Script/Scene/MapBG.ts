import { _decorator, Component, Node, Vec2, Vec3, Camera, UITransform, Input, input, Prefab, v2, v3 } from 'cc';
import { GameMain } from '../GameMain';
import * as cc from "cc";
import PioneerInfo from '../Manger/PioneerMgr';
import PioneerMgr from '../Manger/PioneerMgr';
import BuildingMgr from '../Manger/BuildingMgr';
import ConfigMgr from '../Manger/ConfigMgr';
import { PopUpUI } from '../BasicView/PopUpUI';
import { TilePos, TileMapHelper } from '../Game/TiledMap/TileTool';
import { MapBuildingType, BuildingFactionType } from '../Game/Outer/Model/MapBuildingModel';
import MapPioneerModel, { MapPioneerType, MapNpcPioneerModel } from '../Game/Outer/Model/MapPioneerModel';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Basic/ConstDefine';
const { ccclass, property } = _decorator;

@ccclass('CPrefabInfo')
class PrefabInfo {
    @property(cc.CCString)
    name: string

    @property(cc.Prefab)
    prefab: cc.Prefab;
}

@ccclass('MapBG')
export class MapBG extends Component {

    public decorationLayer(): Node {
        return this._decorationView;
    }
    public sortMapItemSiblingIndex() {
        this.mapcur.node.setSiblingIndex(0);
        let index = 1;
        const items: { node: Node, tilePos: TilePos }[] = [];
        for (const children of this._decorationView.children) {
            if (children.name == "footView") {
                children.setSiblingIndex(index);
                index += 1;
            } else {
                items.push({
                    node: children,
                    tilePos: this._tiledhelper.getPosByWorldPos(children.worldPosition)
                });
            }
        };
        items.sort((a, b) => {
            return a.tilePos.y - b.tilePos.y;
        });
        for (const item of items) {
            item.node.setSiblingIndex(index);
            index += 1;
        }
    }

    public addDynamicBlock(mapPos: Vec2) {
        this._tiledhelper.Path_AddDynamicBlock({
            TileX: mapPos.x,
            TileY: mapPos.y
        });
    }
    public removeDynamicBlock(mapPos: Vec2) {
        this._tiledhelper.Path_RemoveDynamicBlock({
            TileX: mapPos.x,
            TileY: mapPos.y
        });
    }
    public getAround(mapPos: Vec2): TilePos[] {
        mapPos = v2(Math.min(this._tiledhelper.width - 1, mapPos.x), Math.min(this._tiledhelper.height - 1, mapPos.y));
        return this._tiledhelper.Path_GetAround(this._tiledhelper.getPos(mapPos.x, mapPos.y));
    }
    public getAroundByDirection(mapPos: Vec2, direction: Vec3): TilePos {
        mapPos = v2(Math.min(this._tiledhelper.width - 1, mapPos.x), Math.min(this._tiledhelper.height - 1, mapPos.y));
        return this._tiledhelper.Path_GetAroundByDirection(this._tiledhelper.getPos(mapPos.x, mapPos.y), direction);
    }
    public getPosWorld(x: number, y: number): Vec3 {
        return this._tiledhelper.getPosWorld(x, y);
    }
    public getTiledPos(worldPos: Vec3): TilePos {
        return this._tiledhelper.getPosByWorldPos(worldPos);
    }

    public getTiledMovePath(fromWorldPos: Vec3, toWorldPos: Vec3): TilePos[] {
        const paths = this._tiledhelper.Path_FromTo(this._tiledhelper.getPosByWorldPos(fromWorldPos), this._tiledhelper.getPosByWorldPos(toWorldPos));
        for (let i = 0; i < paths.length; i++) {
            if (paths[i] == null || paths[i] == undefined) {
                paths.splice(i, 1);
                i--;
            }
        }
        return paths;
    }
    public getTiledMovePathByTiledPos(fromTilePos: Vec2, toTilePos: Vec2): TilePos[] {
        fromTilePos = v2(Math.min(this._tiledhelper.width - 1, fromTilePos.x), Math.min(this._tiledhelper.height - 1, fromTilePos.y));
        toTilePos = v2(Math.min(this._tiledhelper.width - 1, toTilePos.x), Math.min(this._tiledhelper.height - 1, toTilePos.y));
        return this._tiledhelper.Path_FromTo(this._tiledhelper.getPos(fromTilePos.x, fromTilePos.y), this._tiledhelper.getPos(toTilePos.x, toTilePos.y));
    }
    public isAllBlackShadow(x: number, y: number): boolean {
        return this._tiledhelper.Shadow_IsAllBlack(x, y);
    }
    public isBlock(mapPos: Vec2): boolean {
        return this._tiledhelper.Path_IsBlock(mapPos.x, mapPos.y);
    }

    @property(Prefab)
    tiledmap: Prefab

    @property(cc.Sprite)
    mapcur: cc.Sprite

    @property([cc.SpriteFrame])
    mapcurMultiSelectFrame: cc.SpriteFrame[] = [];

    @property([PrefabInfo])
    PrefabInfo: PrefabInfo[] = [];

    CreateDecoration(index: number): Node {
        if (this.PrefabInfo.length == 0)
            return null;
        for (var i = 0; i < this.PrefabInfo.length; i++) {
            if (this.PrefabInfo[i].name == index.toString()) {
                return cc.instantiate(this.PrefabInfo[i].prefab);
            }
        }
        return null;
    }

    _mouseDown: boolean = false;
    private _cameraOriginalOrthoHeight: number = 0;
    private _localEraseShadowWorldPos: Vec2[] = [];
    private _localEraseDataKey: string = "erase_shadow";

    private _decorationView: Node = null;
    protected onLoad(): void {
        // local shadow erase
        this.InitTileMap();

        this._localEraseShadowWorldPos = [];
        const eraseShadowData: any = localStorage.getItem(this._localEraseDataKey);
        if (eraseShadowData != null) {
            for (const temple of JSON.parse(eraseShadowData)) {
                this._localEraseShadowWorldPos.push(v2(temple.x, temple.y));
            }
        }
        for (const pos of this._localEraseShadowWorldPos) {
            var tiledpos = this._tiledhelper.getPos(pos.x, pos.y);
            this._tiledhelper.Shadow_Earse(tiledpos, 0, 6, false);
        }
    }
    start() {
        this._mouseDown = false;
        let thisptr = this;
        this._cameraOriginalOrthoHeight = GameMain.inst.MainCamera.orthoHeight;
        let downx = 0;
        let downy = 0;
        let mouseActionBeginTimeStamp: number = 0;
        this.node.on(Node.EventType.MOUSE_DOWN, (event: cc.EventMouse) => {
            thisptr._mouseDown = true;

            downx = event.getLocation().x;
            downy = event.getLocation().y;
            PopUpUI.hideAllShowingPopUpUI();

            mouseActionBeginTimeStamp = new Date().getTime();
        }, this);

        this.node.on(Node.EventType.MOUSE_UP, (event: cc.EventMouse) => {
            thisptr._mouseDown = false;
            var pos = event.getLocation();

            if (Math.abs(downx - pos.x) <= 3 &&
                Math.abs(downy - pos.y) <= 3) {
                //if pick a empty area.
                //let pioneer move to
                var wpos = GameMain.inst.MainCamera.screenToWorld(new cc.Vec3(pos.x, pos.y, 0));
                this.ClickOnMap(wpos);
            };
        }, this);

        this.node.on(Node.EventType.MOUSE_LEAVE, (event: cc.EventMouse) => {
            thisptr._mouseDown = false;
        }, this);

        this.node.on(Node.EventType.MOUSE_WHEEL, (event: cc.EventMouse) => {
            let sc = GameMain.inst.MainCamera.orthoHeight / this._cameraOriginalOrthoHeight;
            let config = ConfigMgr.Instance.getConfigById("10001");
            if (config.length <= 0) return;
            let useConf = config[0];

            if (event.getScrollY() > 0) {
                sc += 0.05;
            }
            else {
                sc -= 0.05;
            }
            if (sc > useConf.para[1]) {
                sc = useConf.para[1];
            }
            else if (sc < useConf.para[0]) {
                sc = useConf.para[0];
            }
            GameMain.inst.MainCamera.orthoHeight = sc * this._cameraOriginalOrthoHeight;

            this._fixCameraPos(GameMain.inst.MainCamera.node.position);

            EventMgr.emit(EventName.MAP_SCALED);
        }, this);

        this.node.on(Node.EventType.MOUSE_MOVE, (event: cc.EventMouse) => {
            GameMain.inst.UI.ChangeCursor(0);
            if (thisptr._mouseDown) {
                let pos = GameMain.inst.MainCamera.node.position.add(new Vec3(-event.movementX, event.movementY, 0));

                this._fixCameraPos(pos);
            }
            else {
                if (this._tiledhelper != null) {

                    var pos = event.getLocation();
                    var wpos = GameMain.inst.MainCamera.screenToWorld(new cc.Vec3(pos.x, pos.y, 0));
                    //this.mapcur.node.setWorldPosition(new cc.Vec3(wpos.x, wpos.y, 0));
                    var tp = this._tiledhelper.getPosByWorldPos(wpos);
                    if (tp != null) {
                        var wpos2 = this._tiledhelper.getPosWorld(tp.x, tp.y);
                        this.mapcur.node.active = true;
                        this.mapcur.spriteFrame = this.mapcurMultiSelectFrame[0];
                        this.mapcur.node.setWorldPosition(wpos2);
                        this.mapcur.color = cc.Color.WHITE;

                        if (!this.isAllBlackShadow(tp.x, tp.y)) {
                            //let s = 1.0;
                            const stayBuilding = BuildingMgr.instance.getShowBuildingByMapPos(v2(tp.x, tp.y));
                            if (stayBuilding != null) {
                                if (stayBuilding.show) {
                                    wpos2.x = 0;
                                    wpos2.y = 0;
                                    stayBuilding.stayMapPositions.forEach((v) => {
                                        let wp3 = this._tiledhelper.getPosWorld(v.x, v.y);
                                        wpos2.x += wp3.x;
                                        wpos2.y += wp3.y;
                                    });
                                    wpos2.x = wpos2.x / stayBuilding.stayMapPositions.length;
                                    wpos2.y = wpos2.y / stayBuilding.stayMapPositions.length;
                                    this.mapcur.node.setWorldPosition(wpos2);

                                    //s = Math.sqrt(stayBuilding.stayMapPositions.length);
                                    //s = 2.5;

                                    if (stayBuilding.stayMapPositions.length > 1 && stayBuilding.stayMapPositions.length <= 3) {
                                        this.mapcur.spriteFrame = this.mapcurMultiSelectFrame[1];
                                        this.mapcur.node.setWorldPosition(v3(wpos2.x, wpos2.y + 8, wpos2.z));
                                    } else if (stayBuilding.stayMapPositions.length == 1) {
                                        this.mapcur.spriteFrame = this.mapcurMultiSelectFrame[0];
                                    }
                                    else {
                                        this.mapcur.spriteFrame = this.mapcurMultiSelectFrame[2];
                                    }

                                    GameMain.inst.UI.ChangeCursor(1);
                                }
                            } else {
                                const stayPioneers = PioneerMgr.instance.getShowPioneersByMapPos(v2(tp.x, tp.y));
                                let exitOtherPioneer: boolean = false;
                                for (const templePioneer of stayPioneers) {
                                    if (templePioneer.type != MapPioneerType.player) {
                                        exitOtherPioneer = true;
                                        break;
                                    }
                                }
                                if (exitOtherPioneer) {
                                    GameMain.inst.UI.ChangeCursor(1);
                                }
                            }
                            //this.mapcur.node.scale = new Vec3(s, s, s);

                            const isBlock = this._tiledhelper.Path_IsBlock(tp.x, tp.y);
                            if (isBlock) {
                                this.mapcur.color = cc.Color.RED;

                                GameMain.inst.UI.ChangeCursor(2);
                            }
                        }
                        else {
                            this.mapcur.color = cc.Color.RED;
                            this.mapcur.node.active = false;

                            GameMain.inst.UI.ChangeCursor(2);
                        }
                    }
                    else {
                        this.mapcur.node.active = false;
                    }
                }
                else if (this.mapcur != null) {
                    this.mapcur.node.active = false;
                }

            }
        }, this);


    }
    private _isShowAcionDialog: boolean = false;
    ClickOnMap(worldpos: Vec3) {
        if (this._isShowAcionDialog) {
            GameMain.inst.UI.resOprUI.show(false);
            this._isShowAcionDialog = false;
            return;
        }
        const tiledPos = this._tiledhelper.getPosByWorldPos(worldpos);
        if (this.isAllBlackShadow(tiledPos.x, tiledPos.y)) {
            return;
        }
        const isBlock = this._tiledhelper.Path_IsBlock(tiledPos.x, tiledPos.y);
        if (isBlock) {
            GameMain.inst.UI.ShowTip("cann't move to block");
            return;
        }
        if (PioneerInfo.instance.currentActionPioneerIsBusy()) {
            GameMain.inst.UI.ShowTip("pioneer is busy");
            return;
        }
        const currentActionPioneer = PioneerInfo.instance.getCurrentPlayerPioneer();
        if (!currentActionPioneer.show && currentActionPioneer.rebirthCountTime > 0) {
            GameMain.inst.UI.ShowTip("pioneer is dead");
            return;
        }
        const stayBuilding = BuildingMgr.instance.getShowBuildingByMapPos(v2(tiledPos.x, tiledPos.y));
        //0-talk 1-explore 2-collect 3-fight 4-camp 5-event
        //-1 move -2 no action
        let actionType: number = -1;
        let stayPositons: Vec2[] = [];
        let purchaseMovingPioneerId = null;
        let purchaseMovingBuildingId = null;
        if (stayBuilding != null) {
            if (stayBuilding.type == MapBuildingType.city) {
                if (stayBuilding.faction != BuildingFactionType.enemy) {
                    GameMain.inst.changeScene();
                    actionType = -2;
                } else {
                    actionType = 3;
                }
            } else if (stayBuilding.type == MapBuildingType.explore) {
                actionType = 1;
            } else if (stayBuilding.type == MapBuildingType.resource) {
                actionType = 2;
            } else if (stayBuilding.type == MapBuildingType.stronghold) {
                actionType = 4;
            } else if (stayBuilding.type == MapBuildingType.event) {
                actionType = 5;
            }
            if (actionType != -2 && actionType != 3) {
                purchaseMovingBuildingId = stayBuilding.id;
            }
            stayPositons = stayBuilding.stayMapPositions;
        } else {
            const stayPioneers = PioneerMgr.instance.getShowPioneersByMapPos(v2(tiledPos.x, tiledPos.y));
            let currentPioneer: MapPioneerModel = null;
            for (const tempPioneer of stayPioneers) {
                if (tempPioneer.id != currentActionPioneer.id) {
                    currentPioneer = tempPioneer;
                    break;
                }
            }
            if (currentPioneer != null) {
                if (currentPioneer.friendly) {
                    if (currentPioneer.type == MapPioneerType.npc) {
                        if ((currentPioneer as MapNpcPioneerModel).taskObj != null) {
                            actionType = 0;
                        }
                    } else if (currentPioneer.type == MapPioneerType.gangster) {
                        actionType = 1;
                    }
                } else {
                    actionType = 3;
                }
                if (actionType != 3) {
                    purchaseMovingPioneerId = currentPioneer.id;
                }
                stayPositons = [currentPioneer.stayPos];
            }
        }
        if (actionType >= 0) {
            GameMain.inst.UI.resOprUI.showDialog(actionType, () => {
                currentActionPioneer.purchaseMovingPioneerId = purchaseMovingPioneerId;
                currentActionPioneer.purchaseMovingBuildingId = purchaseMovingBuildingId;
                PioneerInfo.instance.pioneerBeginMove(currentActionPioneer.id, GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(currentActionPioneer.stayPos, v2(tiledPos.x, tiledPos.y)));
                this._isShowAcionDialog = false;
            }, () => {
                this._isShowAcionDialog = false;
            });
            GameMain.inst.UI.resOprUI.show(true);
            let setWorldPosition = null;
            if (stayPositons.length == 1) {
                setWorldPosition = this._tiledhelper.getPosWorld(stayPositons[0].x, stayPositons[0].y);
            } else if (stayPositons.length == 3) {
                const beginWorldPos = this._tiledhelper.getPosWorld(stayPositons[0].x, stayPositons[0].y);
                const endWorldPos = this._tiledhelper.getPosWorld(stayPositons[1].x, stayPositons[1].y);
                setWorldPosition = v3(
                    beginWorldPos.x,
                    endWorldPos.y + (beginWorldPos.y - endWorldPos.y) / 2,
                    0
                );
            } else if (stayPositons.length == 7) {
                setWorldPosition = this._tiledhelper.getPosWorld(stayPositons[3].x, stayPositons[3].y);
            }
            const usedWorldPos = setWorldPosition.subtract(GameMain.inst.MainCamera.node.position);
            usedWorldPos.z = 0;
            GameMain.inst.UI.resOprUI.node.setWorldPosition(usedWorldPos);
            this._isShowAcionDialog = true;
        } else if (actionType == -1) {
            PioneerInfo.instance.pioneerBeginMove(currentActionPioneer.id, GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(currentActionPioneer.stayPos, v2(tiledPos.x, tiledPos.y)));
        }
    }

    private _fixCameraPos(pos: Vec3) {
        let sc = GameMain.inst.MainCamera.orthoHeight / this._cameraOriginalOrthoHeight;

        const cameraSize = cc.size(GameMain.inst.MainCamera.camera.width, GameMain.inst.MainCamera.camera.height);
        const contentSize = this.node.parent.getComponent(UITransform).contentSize;
        const scale = this.node.parent.scale;

        const minx = -contentSize.width * scale.x / 2 - contentSize.width * scale.x * 0.1 + cameraSize.width / 2 * sc;
        const maxx = contentSize.width * scale.x / 2 + contentSize.width * scale.x * 0.1 - cameraSize.width / 2 * sc;
        const miny = -contentSize.height * scale.y / 2 - contentSize.height * scale.y * 0.1 + cameraSize.height / 2 * sc;
        const maxy = contentSize.height * scale.y / 2 + contentSize.height * scale.y * 0.1 - cameraSize.height / 2 * sc;
        pos.x = Math.min(Math.max(minx, pos.x), maxx);
        pos.y = Math.min(Math.max(miny, pos.y), maxy);
        GameMain.inst.MainCamera.node.setPosition(pos);
    }

    private _tiledhelper: TileMapHelper = null;
    private _buildinglayer: Node = null;
    InitTileMap(): void {
        if (this.tiledmap == null)
            return;
        var node = cc.instantiate(this.tiledmap);
        this.node.addChild(node);

        this._decorationView = node.getChildByName("deco_layer");
        this.mapcur.node.removeFromParent();
        this._decorationView.addChild(this.mapcur.node);

        // force change shadow siblingIndex
        node.getChildByName("shadow").setSiblingIndex(99);
        this.mapcur.node.setSiblingIndex(99);

        var _tilemap = node.getComponent(cc.TiledMap);
        _tilemap.enableCulling = false;
        let c = new cc.Color(255, 255, 255, 255);
        _tilemap.getLayer("shadow").color = c;

        //init tiledmap by a helper class
        this._tiledhelper = new TileMapHelper(_tilemap);
        this._tiledhelper.Shadow_Init(0, 75);
        this._tiledhelper._shadowhalftag = 73;
        this._tiledhelper._shadowhalf2tag = 74;

        //place building on blayer, will be coverd by shadow.

        var _lnode = new Node("blayer");
        _lnode.parent = node;
        _lnode.layer = node.layer;
        _lnode.setSiblingIndex(1);
        this._buildinglayer = _lnode;

        //add this for findpath.
        //maybe can use. no check enough.
        //
        //set a callback here. 35 is block,other tag place a  view only prefab on there.
        this._tiledhelper.Path_InitBlock(35,
            (x, y, tag) => {
                //create decoration
                var obj = this.CreateDecoration(tag);
                if (obj != null) {
                    obj.parent = this._buildinglayer;
                    this.SetObjLayer(obj, this._buildinglayer.layer);

                    var posworld = this._tiledhelper.getPosWorld(x, y);
                    obj.setWorldPosition(posworld);
                }
            }
        );
    }
    private SetObjLayer(obj: cc.Node, layer: number) {
        obj.layer = layer;
        if (obj.children == null) return;
        for (var i = 0; i < obj.children.length; i++) {
            this.SetObjLayer(obj.children[i], layer);
        }
    }
    private async UpdateTiledmap(delta: number) {

        if (this._tiledhelper == null)
            return;

        this._tiledhelper.Shadow_Update(delta);

        //clean pioneer view
        const selfPioneer = await PioneerInfo.instance.getPlayerPioneer();
        for (const pioneer of selfPioneer) {
            if (pioneer.show) {
                let isExsit: boolean = false;
                for (const localErase of this._localEraseShadowWorldPos) {
                    if (pioneer.stayPos.x === localErase.x &&
                        pioneer.stayPos.y === localErase.y) {
                        isExsit = true;
                        break;
                    }
                }
                if (!isExsit) {
                    this._localEraseShadowWorldPos.push(pioneer.stayPos);
                    localStorage.setItem(this._localEraseDataKey, JSON.stringify(this._localEraseShadowWorldPos));
                }
                var tiledpos = this._tiledhelper.getPos(pioneer.stayPos.x, pioneer.stayPos.y);
                this._tiledhelper.Shadow_Earse(tiledpos, pioneer.id, 6, false);
            }
        }
    }
    private _clearmaintown = false;
    update(deltaTime: number) {
        this.UpdateTiledmap(deltaTime);
    }
}


