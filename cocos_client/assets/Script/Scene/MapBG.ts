import { _decorator, Component, Node, Vec2, Vec3, Camera, UITransform, Input, input, Prefab, v2, v3, Mask, tween, CCString, SpriteFrame, instantiate, Sprite, EventMouse, Color, TiledMap, size, RenderRoot2D, Widget, CCInteger } from 'cc';
import { GameMain } from '../GameMain';
import PioneerInfo from '../Manger/PioneerMgr';
import PioneerMgr from '../Manger/PioneerMgr';
import BuildingMgr from '../Manger/BuildingMgr';
import ConfigMgr from '../Manger/ConfigMgr';
import { PopUpUI } from '../BasicView/PopUpUI';
import { TilePos, TileMapHelper, TileHexDirection } from '../Game/TiledMap/TileTool';
import { MapBuildingType, BuildingFactionType } from '../Game/Outer/Model/MapBuildingModel';
import MapPioneerModel, { MapPioneerType, MapNpcPioneerModel, MapPioneerLogicType, MapPioneerActionType, MapPioneerEventStatus } from '../Game/Outer/Model/MapPioneerModel';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Const/ConstDefine';
import { OuterFogMask } from '../Game/Outer/View/OuterFogMask';
import { ResOprView } from '../Game/Outer/View/ResOprView';
import { OuterPioneerController } from '../Game/Outer/OuterPioneerController';
import { OuterFogAnimShapMask } from '../Game/Outer/View/OuterFogAnimShapMask';
import { OuterMapCursorView } from '../Game/Outer/View/OuterMapCursorView';
import UserInfoMgr from '../Manger/UserInfoMgr';
import LanMgr from '../Manger/LanMgr';
const { ccclass, property } = _decorator;

@ccclass('CPrefabInfo')
class PrefabInfo {
    @property(CCString)
    name: string

    @property(Prefab)
    prefab: Prefab;
}

@ccclass('MapBG')
export class MapBG extends Component {

    public mapBottomView(): Node {
        return this._mapBottomView;
    }
    public mapDecorationView(): Node {
        return this._decorationView;
    }
    public sortMapItemSiblingIndex() {
        let index = 1;
        const items: { node: Node, tilePos: TilePos }[] = [];
        for (const children of this._decorationView.children) {
            items.push({
                node: children,
                tilePos: this._tiledhelper.getPosByWorldPos(children.worldPosition)
            });
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
    public getAroundByDirection(mapPos: Vec2, direction: TileHexDirection): TilePos {
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
        const fromPos = this._tiledhelper.getPos(
            Math.min(Math.max(0, fromTilePos.x), this._tiledhelper.width - 1),
            Math.min(Math.max(0, fromTilePos.y), this._tiledhelper.height - 1)
        );
        const toPos = this._tiledhelper.getPos(
            Math.min(Math.max(0, toTilePos.x), this._tiledhelper.width - 1),
            Math.min(Math.max(0, toTilePos.y), this._tiledhelper.height - 1)
        );
        return this._tiledhelper.Path_FromTo(fromPos, toPos);
    }
    public isAllBlackShadow(x: number, y: number): boolean {
        return this._tiledhelper.Shadow_IsAllBlack(x, y);
    }
    public isBlock(mapPos: Vec2): boolean {
        return this._tiledhelper.Path_IsBlock(mapPos.x, mapPos.y);
    }


    @property(Prefab)
    tiledmap: Prefab

    @property(Prefab)
    private resOprPrefab = null;

    @property([CCString])
    private tiledMapTogetherBlock: string[] = [];

    @property([SpriteFrame])
    private fogAnimDissolveImages: SpriteFrame[] = [];

    @property([PrefabInfo])
    PrefabInfo: PrefabInfo[] = [];

    CreateDecoration(index: number): Node {
        if (this.PrefabInfo.length == 0)
            return null;
        for (var i = 0; i < this.PrefabInfo.length; i++) {
            if (this.PrefabInfo[i].name == index.toString()) {
                return instantiate(this.PrefabInfo[i].prefab);
            }
        }
        return null;
    }

    private _mouseDown: boolean = false;
    private _tiledhelper: TileMapHelper = null;
    private _cameraOriginalOrthoHeight: number = 0;
    private _localEraseShadowWorldPos: Vec2[] = [];
    private _localEraseDataKey: string = "erase_shadow";
    private _fogAnimOriginalPos: Vec3 = null;

    private _fogAnimPlaying: boolean = false;
    private _fogAnimDatas: { allClearedTilePosions: { startPos: Vec2, endPos: Vec2 }[], animTilePostions: TilePos[], direciton: TileHexDirection }[] = [];

    private _togetherBlockPositons: Vec2[][] = [];

    private _buildinglayer: Node = null;
    private _mapBottomView: Node = null;
    private _mapCursorView: OuterMapCursorView = null;
    private _mapActionCursorView: OuterMapCursorView = null;
    private _decorationView: Node = null;
    private _fogView: OuterFogMask = null;
    private _fogAnimView: Mask = null;
    private _fogAnimShapView: OuterFogAnimShapMask = null;
    private _boundContent: Node = null;
    private _boundItem: Node = null;
    private _boundItemMap: Map<string, Node> = new Map();
    private _boundPrefabItems: Node[] = [];
    private _actionView: ResOprView = null;

    private _hexScale: number = 0.5;
    private _hexViewRadius: number = 0;
    protected onLoad(): void {
        // local shadow erase
        this._initTileMap();

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
        this.node.on(Node.EventType.MOUSE_DOWN, (event: EventMouse) => {
            thisptr._mouseDown = true;

            downx = event.getLocation().x;
            downy = event.getLocation().y;
            PopUpUI.hideAllShowingPopUpUI();
        }, this);

        this.node.on(Node.EventType.MOUSE_UP, (event: EventMouse) => {
            thisptr._mouseDown = false;
            var pos = event.getLocation();

            if (Math.abs(downx - pos.x) <= 3 &&
                Math.abs(downy - pos.y) <= 3) {
                //if pick a empty area.
                //let pioneer move to
                var wpos = GameMain.inst.MainCamera.screenToWorld(new Vec3(pos.x, pos.y, 0));
                this._clickOnMap(wpos);
            };
        }, this);

        this.node.on(Node.EventType.MOUSE_LEAVE, (event: EventMouse) => {
            thisptr._mouseDown = false;
        }, this);

        this.node.on(Node.EventType.MOUSE_WHEEL, (event: EventMouse) => {
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

        this.node.on(Node.EventType.MOUSE_MOVE, (event: EventMouse) => {
            GameMain.inst.UI.ChangeCursor(0);
            if (thisptr._mouseDown) {
                let pos = GameMain.inst.MainCamera.node.position.add(new Vec3(-event.movementX, event.movementY, 0));

                this._fixCameraPos(pos);
            }
            else {
                if (this._tiledhelper != null) {
                    var pos = event.getLocation();
                    var wpos = GameMain.inst.MainCamera.screenToWorld(new Vec3(pos.x, pos.y, 0));
                    var tp = this._tiledhelper.getPosByWorldPos(wpos);
                    if (tp != null) {
                        if (!this.isAllBlackShadow(tp.x, tp.y)) {
                            const isBlock = this._tiledhelper.Path_IsBlock(tp.x, tp.y);
                            if (isBlock) {
                                let cursorShowTilePositions: Vec2[] = null;
                                for (const positions of this._togetherBlockPositons) {
                                    if (positions.some(temple => temple.x === tp.x && temple.y === tp.y)) {
                                        cursorShowTilePositions = positions;
                                        break;
                                    }
                                }
                                if (cursorShowTilePositions == null) {
                                    cursorShowTilePositions = [v2(tp.x, tp.y)];
                                }
                                this._mapCursorView.show(cursorShowTilePositions, Color.RED);
                                GameMain.inst.UI.ChangeCursor(2);

                            } else {
                                const stayBuilding = BuildingMgr.instance.getShowBuildingByMapPos(v2(tp.x, tp.y));
                                if (stayBuilding != null) {
                                    if (stayBuilding.show) {
                                        if (stayBuilding.type == MapBuildingType.city &&
                                            stayBuilding.faction != BuildingFactionType.enemy) {
                                            const centerPos = stayBuilding.stayMapPositions[3];
                                            const visionPositions = [];
                                            for (const temple of this._tiledhelper.getExtAround(this._tiledhelper.getPos(centerPos.x, centerPos.y), UserInfoMgr.Instance.cityVision - 1)) {
                                                visionPositions.push(v2(temple.x, temple.y));
                                            }
                                            this._mapCursorView.show(stayBuilding.stayMapPositions, Color.WHITE, visionPositions, Color.BLUE);
                                        } else {
                                            this._mapCursorView.show(stayBuilding.stayMapPositions, Color.WHITE);
                                        }

                                        GameMain.inst.UI.ChangeCursor(1);
                                    }
                                } else {
                                    const stayPioneers = PioneerMgr.instance.getShowPioneersByMapPos(v2(tp.x, tp.y));
                                    let existOtherPioneer: MapPioneerModel = null;
                                    for (const templePioneer of stayPioneers) {
                                        if (templePioneer.type != MapPioneerType.player) {
                                            existOtherPioneer = templePioneer;
                                            break;
                                        }
                                    }
                                    if (existOtherPioneer != null) {
                                        GameMain.inst.UI.ChangeCursor(1);
                                    }
                                    this._mapCursorView.show([v2(tp.x, tp.y)], Color.WHITE);
                                }
                            }
                        } else {
                            this._mapCursorView.hide();
                            GameMain.inst.UI.ChangeCursor(2);
                        }
                    } else {
                        this._mapCursorView.hide();
                    }
                } else {
                    this._mapCursorView.hide();
                }
            }
        }, this);
        // local fog
        this._refreshFog(this._tiledhelper.Shadow_GetClearedTiledPositons());
    }

    update(deltaTime: number) {
        this._updateTiledmap(deltaTime);
    }

    //------------------------------------
    private _initTileMap(): void {
        if (this.tiledmap == null)
            return;
        const mapView = instantiate(this.tiledmap);
        this.node.addChild(mapView);

        this._togetherBlockPositons = [];
        for (const positionsString of this.tiledMapTogetherBlock) {
            const temple = [];
            for (const posString of positionsString.split(";")) {
                temple.push(v2(parseInt(posString.split(",")[0]), parseInt(posString.split(",")[1])));
            }
            this._togetherBlockPositons.push(temple);
        }

        this._decorationView = mapView.getChildByName("deco_layer");

        this._mapBottomView = new Node("bottomContent");
        this._mapBottomView.layer = this.node.layer;
        mapView.addChild(this._mapBottomView);
        this._mapBottomView.addComponent(UITransform).setContentSize(mapView.getComponent(UITransform).contentSize);
        this._mapBottomView.setSiblingIndex(this._decorationView.getSiblingIndex());

        this._mapCursorView = this.node.getChildByName("PointerCursor").getComponent(OuterMapCursorView);
        this._mapCursorView.node.removeFromParent();
        this._mapBottomView.addChild(this._mapCursorView.node);

        this._mapActionCursorView = this.node.getChildByName("ActionCursor").getComponent(OuterMapCursorView);
        this._mapActionCursorView.node.removeFromParent();
        this._mapBottomView.addChild(this._mapActionCursorView.node);

        // force change shadow siblingIndex
        mapView.getChildByName("shadow").setSiblingIndex(99);

        var _tilemap = mapView.getComponent(TiledMap);
        _tilemap.enableCulling = false;
        let c = new Color(255, 255, 255, 255);
        _tilemap.getLayer("shadow").color = c;

        //init tiledmap by a helper class
        this._tiledhelper = new TileMapHelper(_tilemap);
        this._tiledhelper.Shadow_Init(0, 75);
        this._tiledhelper._shadowhalftag = 73;
        this._tiledhelper._shadowhalf2tag = 74;

        //place building on blayer, will be coverd by shadow.

        var _lnode = new Node("blayer");
        _lnode.parent = mapView;
        _lnode.layer = mapView.layer;
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
                    this._setObjLayer(obj, this._buildinglayer.layer);

                    var posworld = this._tiledhelper.getPosWorld(x, y);
                    obj.setWorldPosition(posworld);
                }
            }
        );

        this._fogView = this.node.getChildByName("Fog").getComponent(OuterFogMask);
        this._fogView.node.setSiblingIndex(99);

        this._fogAnimView = this.node.getChildByName("FogAnim").getComponent(Mask);
        this._fogAnimView.node.active = false;
        this._fogAnimView.node.setSiblingIndex(100);
        this._fogAnimOriginalPos = this._fogAnimView.node.position.clone();

        this._fogAnimShapView = this._fogAnimView.node.getChildByName("SharpMask").getComponent(OuterFogAnimShapMask);

        this._boundContent = this.node.getChildByName("BoundContent");
        this._boundContent.setSiblingIndex(101);
        this._boundItem = this._boundContent.getChildByName("BoundView");
        this._boundItem.active = false;

        this._actionView = instantiate(this.resOprPrefab).getComponent(ResOprView);
        this._actionView.node.setScale(v3(2, 2, 2));
        this._actionView.node.setParent(this.node);
        this._actionView.hide();

        this._hexViewRadius = this._tiledhelper.tilewidth * this._hexScale / 2;

        this._mapCursorView.initData(this._hexViewRadius, this._hexScale);
        this._mapActionCursorView.initData(this._hexViewRadius, this._hexScale);
    }
    private _setObjLayer(obj: Node, layer: number) {
        obj.layer = layer;
        if (obj.children == null) return;
        for (var i = 0; i < obj.children.length; i++) {
            this._setObjLayer(obj.children[i], layer);
        }
    }

    private _lastPioneerStayPos: Map<string, Vec2> = new Map();
    private async _updateTiledmap(delta: number) {

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
                var tiledpos = this._tiledhelper.getPos(pioneer.stayPos.x, pioneer.stayPos.y);
                const newCleardPositons = this._tiledhelper.Shadow_Earse(tiledpos, pioneer.id, 6, false);
                if (!isExsit) {
                    this._localEraseShadowWorldPos.push(pioneer.stayPos);
                    localStorage.setItem(this._localEraseDataKey, JSON.stringify(this._localEraseShadowWorldPos));
                }
                // has new, deal with fog
                if (!this._lastPioneerStayPos.has(pioneer.id)) {
                    this._lastPioneerStayPos.set(pioneer.id, pioneer.stayPos);
                }
                const lastStayPos = this._lastPioneerStayPos.get(pioneer.id);
                if (lastStayPos.x != pioneer.stayPos.x ||
                    lastStayPos.y != pioneer.stayPos.y) {
                    let currentMoveDirection = null;
                    const direction = [TileHexDirection.Left, TileHexDirection.LeftBottom, TileHexDirection.LeftTop, TileHexDirection.Right, TileHexDirection.RightBottom, TileHexDirection.RightTop];
                    for (const d of direction) {
                        const around = this._tiledhelper.Path_GetAroundByDirection(this._tiledhelper.getPos(lastStayPos.x, lastStayPos.y), d);
                        if (around.x == pioneer.stayPos.x &&
                            around.y == pioneer.stayPos.y) {
                            currentMoveDirection = d;
                            break;
                        }
                    }
                    this._lastPioneerStayPos.set(pioneer.id, pioneer.stayPos);
                    this._refreshFog(this._tiledhelper.Shadow_GetClearedTiledPositons(), newCleardPositons, currentMoveDirection);
                }
            }
        }
    }

    private _clickOnMap(worldpos: Vec3) {
        if (this._actionView.isShow) {
            this._actionView.hide();
            this._mapActionCursorView.hide();
            this.node.getComponent(OuterPioneerController).hideMovingPioneerAction();
            return;
        }
        if (this["_actionViewActioned"] == true) {
            this["_actionViewActioned"] = false;
            return;
        }
        const tiledPos = this._tiledhelper.getPosByWorldPos(worldpos);
        if (this.isAllBlackShadow(tiledPos.x, tiledPos.y)) {
            return;
        }
        const isBlock = this._tiledhelper.Path_IsBlock(tiledPos.x, tiledPos.y);
        if (isBlock) {

            // useLanMgr
            // GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("107549"));
            GameMain.inst.UI.ShowTip("cann't move to block");

            return;
        }
        if (PioneerInfo.instance.currentActionPioneerIsBusy()) {

            // useLanMgr
            // GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("107549"));
            GameMain.inst.UI.ShowTip("pioneer is busy");

            return;
        }
        const currentActionPioneer = PioneerInfo.instance.getCurrentPlayerPioneer();
        if (!currentActionPioneer.show && currentActionPioneer.rebirthCountTime > 0) {

            // useLanMgr
            // GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("107549"));
            GameMain.inst.UI.ShowTip("pioneer is dead");

            return;
        }
        const stayBuilding = BuildingMgr.instance.getShowBuildingByMapPos(v2(tiledPos.x, tiledPos.y));
        //0-talk 1-explore 2-collect 3-fight 4-camp 5-event 6-campcancel
        //-1 move -2 no action
        let actionType: number = -1;
        let actionMovingPioneerId: string = null;
        let stayPositons: Vec2[] = [];
        let purchaseMovingPioneerId = null;
        let purchaseMovingBuildingId = null;
        if (currentActionPioneer.actionType == MapPioneerActionType.defend) {
            if (stayBuilding != null && stayBuilding.type == MapBuildingType.stronghold) {
                actionType = 6;
                stayPositons = stayBuilding.stayMapPositions;
            } else {
                actionType = -2;

                // useLanMgr
                // GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("107549"));
                GameMain.inst.UI.ShowTip("pioneer is defending");

            }
        } else if (currentActionPioneer.actionType == MapPioneerActionType.eventing &&
            (currentActionPioneer.eventStatus == MapPioneerEventStatus.Waiting ||
                stayBuilding == null ||
                (stayBuilding != null &&
                    stayBuilding.eventId != currentActionPioneer.actionEventId))) {
            actionType = -2;
            // useLanMgr
            // GameMain.inst.UI.ShowTip(LanMgr.Instance.getLanById("107549"));
            GameMain.inst.UI.ShowTip("pioneer is processing event");
        } else {
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
                        let isMoving: boolean = false;
                        for (const logic of currentPioneer.logics) {
                            if (logic.type == MapPioneerLogicType.targetmove ||
                                logic.type == MapPioneerLogicType.stepmove ||
                                logic.type == MapPioneerLogicType.patrol ||
                                logic.type == MapPioneerLogicType.commonmove) {
                                isMoving = true;
                                break;
                            }
                        }
                        if (isMoving) {
                            actionMovingPioneerId = currentPioneer.id;
                        }
                    }
                    if (actionType != 3) {
                        purchaseMovingPioneerId = currentPioneer.id;
                    }
                    stayPositons = [currentPioneer.stayPos];
                }
            }
        }
        if (actionType >= 0) {
            this._mapActionCursorView.show(stayPositons, Color.WHITE);
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
            this._actionView.show(setWorldPosition, actionType, (useActionType: number) => {
                this["_actionViewActioned"] = true;
                if (useActionType == 6) {
                    // cancel camp
                    PioneerMgr.instance.pioneerToIdle(currentActionPioneer.id);

                } else {
                    if (useActionType == 4) {
                        // move to building
                    } else {
                        // move to near building 
                        currentActionPioneer.purchaseMovingPioneerId = purchaseMovingPioneerId;
                        currentActionPioneer.purchaseMovingBuildingId = purchaseMovingBuildingId;
                    }
                    let targetTilePos: Vec2 = null;
                    if (actionMovingPioneerId != null) {
                        targetTilePos = PioneerMgr.instance.getPioneerById(actionMovingPioneerId).stayPos;
                    } else {
                        targetTilePos = v2(tiledPos.x, tiledPos.y);
                    }
                    PioneerInfo.instance.pioneerBeginMove(currentActionPioneer.id, GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(currentActionPioneer.stayPos, targetTilePos));
                }
                this._mapActionCursorView.hide();
                this.node.getComponent(OuterPioneerController).hideMovingPioneerAction();
            }, () => {
                this["_actionViewActioned"] = true;
                this._mapActionCursorView.hide();
                this.node.getComponent(OuterPioneerController).hideMovingPioneerAction();
            });
            if (actionMovingPioneerId != null) {
                this.node.getComponent(OuterPioneerController).showMovingPioneerAction(tiledPos, actionMovingPioneerId, this._mapActionCursorView);
            }

        } else if (actionType == -1) {
            PioneerInfo.instance.pioneerBeginMove(currentActionPioneer.id, GameMain.inst.outSceneMap.mapBG.getTiledMovePathByTiledPos(currentActionPioneer.stayPos, v2(tiledPos.x, tiledPos.y)));
        }
    }

    private _fixCameraPos(pos: Vec3) {
        let sc = GameMain.inst.MainCamera.orthoHeight / this._cameraOriginalOrthoHeight;

        const cameraSize = size(GameMain.inst.MainCamera.camera.width, GameMain.inst.MainCamera.camera.height);
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

    private _refreshFog(allClearedShadowPositions: TilePos[], newCleardPositons: TilePos[] = null, direction: TileHexDirection = null) {
        const getAllBoundLines: { startPos: Vec2, endPos: Vec2 }[] = [];
        const getAllBoundPos: Vec3[] = [];

        const hexViewRadius = this._tiledhelper.tilewidth / 2 / 2;
        const sinValue = Math.sin(30 * Math.PI / 180);
        for (const pos of allClearedShadowPositions) {
            let isBound: boolean = false;
            const centerPos = this._tiledhelper.getPosWorld(pos.x, pos.y);
            // direction around no hex or hex is shadow, direction is bound.
            const leftTop = this._tiledhelper.Path_GetAroundByDirection(pos, TileHexDirection.LeftTop);
            if (leftTop == null || this._tiledhelper.Shadow_IsAllBlack(leftTop.x, leftTop.y)) {
                getAllBoundLines.push({
                    startPos: v2(centerPos.x, hexViewRadius + centerPos.y),
                    endPos: v2(-hexViewRadius + centerPos.x, sinValue * hexViewRadius + centerPos.y)
                });
                isBound = true;
            }

            const left = this._tiledhelper.Path_GetAroundByDirection(pos, TileHexDirection.Left);
            if (left == null || this._tiledhelper.Shadow_IsAllBlack(left.x, left.y)) {
                getAllBoundLines.push({
                    startPos: v2(-hexViewRadius + centerPos.x, sinValue * hexViewRadius + centerPos.y),
                    endPos: v2(-hexViewRadius + centerPos.x, -sinValue * hexViewRadius + centerPos.y)
                });
                isBound = true;
            }

            const leftBottom = this._tiledhelper.Path_GetAroundByDirection(pos, TileHexDirection.LeftBottom);
            if (leftBottom == null || this._tiledhelper.Shadow_IsAllBlack(leftBottom.x, leftBottom.y)) {
                getAllBoundLines.push({
                    startPos: v2(-hexViewRadius + centerPos.x, -sinValue * hexViewRadius + centerPos.y),
                    endPos: v2(centerPos.x, -hexViewRadius + centerPos.y),
                });
                isBound = true;
            }

            const rightbottom = this._tiledhelper.Path_GetAroundByDirection(pos, TileHexDirection.RightBottom);
            if (rightbottom == null || this._tiledhelper.Shadow_IsAllBlack(rightbottom.x, rightbottom.y)) {
                getAllBoundLines.push({
                    startPos: v2(centerPos.x, -hexViewRadius + centerPos.y),
                    endPos: v2(hexViewRadius + centerPos.x, -sinValue * hexViewRadius + centerPos.y),
                });
                isBound = true;
            }

            const right = this._tiledhelper.Path_GetAroundByDirection(pos, TileHexDirection.Right);
            if (right == null || this._tiledhelper.Shadow_IsAllBlack(right.x, right.y)) {
                getAllBoundLines.push({
                    startPos: v2(hexViewRadius + centerPos.x, -sinValue * hexViewRadius + centerPos.y),
                    endPos: v2(hexViewRadius + centerPos.x, sinValue * hexViewRadius + centerPos.y)
                });
                isBound = true;
            }

            const rightTop = this._tiledhelper.Path_GetAroundByDirection(pos, TileHexDirection.RightTop);
            if (rightTop == null || this._tiledhelper.Shadow_IsAllBlack(rightTop.x, rightTop.y)) {
                getAllBoundLines.push({
                    startPos: v2(hexViewRadius + centerPos.x, sinValue * hexViewRadius + centerPos.y),
                    endPos: v2(centerPos.x, hexViewRadius + centerPos.y)
                });
                isBound = true;
            }
            if (isBound) {
                getAllBoundPos.push(centerPos);
            }
        }
        for (const line of getAllBoundLines) {
            const inFogStartPos = this._fogView.node.getComponent(UITransform).convertToNodeSpaceAR(v3(line.startPos.x, line.startPos.y, 0));
            line.startPos = v2(Math.floor(inFogStartPos.x), Math.floor(inFogStartPos.y));

            const inFogEndPos = this._fogView.node.getComponent(UITransform).convertToNodeSpaceAR(v3(line.endPos.x, line.endPos.y, 0));
            line.endPos = v2(Math.floor(inFogEndPos.x), Math.floor(inFogEndPos.y));
        }

        if (this._fogAnimDatas.length <= 0 &&
            !this._fogAnimPlaying &&
            newCleardPositons == null) {
            // no anim
            this._fogView.draw(getAllBoundLines);
        }
        if (newCleardPositons != null) {
            this._fogAnimDatas.push({
                allClearedTilePosions: getAllBoundLines,
                animTilePostions: newCleardPositons,
                direciton: direction
            });
            this._playFogAnim();
        }
        return;
        // bound fog
        for (const pos of getAllBoundPos) {
            if (this._boundItemMap.has(pos.x + "|" + pos.y)) {

            } else {
                let item = null;
                if (this._boundPrefabItems.length > 0) {
                    item = this._boundPrefabItems.pop();
                } else {
                    item = instantiate(this._boundItem);
                }
                item.active = true;
                item.setParent(this._boundContent);
                item.setWorldPosition(pos);
                this._boundItemMap.set(pos.x + "|" + pos.y, item);
            }
        }
        this._boundItemMap.forEach((value: Node, key: string) => {
            let isNeed = false;
            for (const tempPos of getAllBoundPos) {
                if (key == (tempPos.x + "|" + tempPos.y)) {
                    isNeed = true;
                    break;
                }
            }
            if (!isNeed) {
                value.removeFromParent();
                this._boundPrefabItems.push(value);
                this._boundItemMap.delete(key);
            }
        });
    }

    private _playFogAnim() {
        if (this._fogAnimPlaying) {
            return;
        }
        if (this._fogAnimDatas.length <= 0) {
            this._fogAnimView.node.active = false;
            return;
        }
        const data = this._fogAnimDatas.shift();
        if (data.allClearedTilePosions != null && data.allClearedTilePosions.length > 0) {
            this._fogView.draw(data.allClearedTilePosions);
        }

        if (data.animTilePostions != null && data.animTilePostions.length > 0) {
            this._fogAnimPlaying = true;
            this._fogAnimView.node.active = true;

            const fogPositions = [];
            let minWorldPosX: number = null;
            let maxWorldPosX: number = null;
            let minWorldPosY: number = null;
            let maxWorldPosY: number = null;
            for (const pos of data.animTilePostions) {
                const temple = this._fogAnimShapView.node.getComponent(UITransform).convertToNodeSpaceAR(this._tiledhelper.getPosWorld(pos.x, pos.y));
                fogPositions.push(v2(temple.x, temple.y));

                minWorldPosX = minWorldPosX == null ? this._tiledhelper.getPosWorld(pos.x, pos.y).x : minWorldPosX;
                maxWorldPosX = maxWorldPosX == null ? this._tiledhelper.getPosWorld(pos.x, pos.y).x : maxWorldPosX;
                minWorldPosY = minWorldPosY == null ? this._tiledhelper.getPosWorld(pos.x, pos.y).y : minWorldPosY;
                maxWorldPosY = maxWorldPosY == null ? this._tiledhelper.getPosWorld(pos.x, pos.y).y : maxWorldPosY;

                minWorldPosX = Math.min(this._tiledhelper.getPosWorld(pos.x, pos.y).x, minWorldPosX);
                maxWorldPosX = Math.max(this._tiledhelper.getPosWorld(pos.x, pos.y).x, maxWorldPosX);
                minWorldPosY = Math.min(this._tiledhelper.getPosWorld(pos.x, pos.y).y, minWorldPosY);
                maxWorldPosY = Math.max(this._tiledhelper.getPosWorld(pos.x, pos.y).y, maxWorldPosY);
            }

            const tileMapScale = 0.5;
            const tileMapItemSize = size(this._tiledhelper.tilewidth * tileMapScale, this._tiledhelper.tileheight * tileMapScale);
            // draw shapView mask
            this._fogAnimShapView.draw(fogPositions, tileMapItemSize.width);

            if (minWorldPosX != null && maxWorldPosX != null &&
                minWorldPosY != null && maxWorldPosY != null) {
                // set fogAninView size and pos  
                this._fogAnimView.node.getComponent(UITransform).setContentSize(
                    size(
                        (maxWorldPosX - minWorldPosX + tileMapItemSize.width) / tileMapScale,
                        (maxWorldPosY - minWorldPosY + tileMapItemSize.height) / tileMapScale
                    )
                );
                this._fogAnimView.node.position = this.node.getComponent(UITransform).convertToNodeSpaceAR(
                    v3(
                        minWorldPosX - tileMapItemSize.width / 2,
                        maxWorldPosY + tileMapItemSize.height / 2,
                        0
                    )
                );
                console.log("exce d: " + data.direciton);
                let dissolveImage = null;
                if (data.direciton == TileHexDirection.Left) {
                    dissolveImage = this.fogAnimDissolveImages[0];
                } else if (data.direciton == TileHexDirection.LeftBottom) {
                    dissolveImage = this.fogAnimDissolveImages[1];
                } else if (data.direciton == TileHexDirection.LeftTop) {
                    dissolveImage = this.fogAnimDissolveImages[2];
                } else if (data.direciton == TileHexDirection.Right) {
                    dissolveImage = this.fogAnimDissolveImages[3];
                } else if (data.direciton == TileHexDirection.RightBottom) {
                    dissolveImage = this.fogAnimDissolveImages[4];
                } else if (data.direciton == TileHexDirection.RightTop) {
                    dissolveImage = this.fogAnimDissolveImages[5];
                } 
                if (dissolveImage == null) {
                    dissolveImage = this.fogAnimDissolveImages[0];
                }
                this._fogAnimView.node.getComponent(Sprite).spriteFrame = dissolveImage;
                // sharp pos
                const sub = this._fogAnimView.node.position.clone().subtract(this._fogAnimOriginalPos);
                this._fogAnimShapView.node.position = v3(-sub.x, -sub.y, 0);
                tween(this._fogAnimView)
                    .set({ alphaThreshold: 0.01 })
                    .to(0.4, { alphaThreshold: 1 })
                    .call(() => {
                        this._fogAnimPlaying = false;
                        this._playFogAnim();
                    })
                    .start();
            }
        } else {
            this._playFogAnim();
        }
    }
}


