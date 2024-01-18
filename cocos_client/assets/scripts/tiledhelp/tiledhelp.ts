import * as cc from 'cc';
import { mover } from './mover';
const { ccclass, property } = cc._decorator;



@ccclass('tiledhelp')
export class tiledhelp extends cc.Component {

    @property({
        type: cc.Camera,
        visible: true,
    })
    camera: cc.Camera

    @property({
        type: mover,
        visible: true,
    })
    mover: mover

    _tile: cc.TiledMap;
    start() {
        this._tile = this.node.getComponent(cc.TiledMap);
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

        //set shadow layer to dynamic
        let layer = this._tile.getLayer("shadow");
        let size = this._tile.getMapSize();
        for (var y = 0; y < size.height; y++) {
            for (var x = 0; x < size.width; x++) {
                let node = new cc.Node();
                layer.node.addChild(node);
                let t = node.addComponent(cc.TiledTile);
                t.x = x;
                t.y = y;
                t.grid = 1;
            }
        }

        this.mover.SetCleaner(this);
    }
    onTouchMove(event: cc.EventTouch) {

    }
    onTouchStart(event: cc.EventTouch) {

        let wpos = tiledhelp.Touchpos2NodePos(this.node, event, this.camera);
        wpos.y *= -1;
        console.log("wpos", wpos.x, wpos.y);
        //wpos = this.camera.convertToUINode(wpos, this.node.parent)
        this.mover.MoveTo(wpos);

        let tpos = tiledhelp.NodePos2GridmapPos(this._tile, wpos.x, wpos.y * -1);
        //let tpos = this.TouchPos2GridmapPos(event);
        //this.CleanMap(tpos.x, tpos.y);
    }
    CleanMapWorldPos(pos: cc.Vec3): void {
        let tpos = tiledhelp.NodePos2GridmapPos(this._tile, pos.x, pos.y * -1);
        this.CleanMap(tpos.x, tpos.y);
    }
    CleanMap(gridx: number, gridy: number): void {

        let layer = this._tile.getLayer("shadow");
        let size = this._tile.getMapSize();

        for (var y = gridy - 3; y <= gridy + 3; y++) {
            for (var x = gridx - 3; x <= gridx + 3; x++) {
                if (x < 0 || y < 0 || x >= size.width || y >= size.height)
                    continue;
                let t = layer.getTiledTileAt(x, y);
                if (t == null)
                    continue;
                t.grid = 0;

            }
        }
        layer.updateViewPort(0, 0, size.width, size.height)

    }
    static Touchpos2WorldPos(touchevent: cc.EventTouch, camera: cc.Camera): cc.Vec3 {

        let sposview = touchevent.getLocationInView();
        let spos = new cc.Vec3(sposview.x, sposview.y, 0);
        let wpos = camera.screenToWorld(spos);
        return wpos;

    }
    static Touchpos2NodePos(node: cc.Node, touchevent: cc.EventTouch, camera: cc.Camera): cc.Vec3 {
        let pos = touchevent.getLocation();
        let sposview = touchevent.getLocationInView();
        let spos = new cc.Vec3(sposview.x, sposview.y, 0);
        let wpos = camera.screenToWorld(spos);
        return camera.convertToUINode(wpos, node);

    }
    //this calc only for center (anthor point =0.5,0.5)
    static WorldPos2GridmapPos(node: cc.Node, camera: cc.Camera, map: cc.TiledMap, wpos: cc.Vec3) {

        let uipos = camera.convertToUINode(wpos, node);
        let mapSize = map.getMapSize();
        let tileSize = map.getTileSize();

        //let halfh = (mapSize.height * tileSize.height) / 2;

        let x = (uipos.x / tileSize.width + (uipos.y) / tileSize.height)
        let y = (-uipos.x / tileSize.width + (uipos.y) / tileSize.height)

        x += mapSize.width / 2 - 0.5;
        y += mapSize.height / 2 - 0.5;

        x |= 0;
        y |= 0;
        return new cc.Vec2(x, y);
    }


    static NodePos2GridmapPos(map: cc.TiledMap, nodex: number, nodey: number) {
        let mapSize = map.getMapSize();
        let tileSize = map.getTileSize();
        //let halfh = (mapSize.height * tileSize.height) / 2;

        let x = (nodex / tileSize.width + (nodey) / tileSize.height)
        let y = (-nodex / tileSize.width + (nodey) / tileSize.height)

        x += mapSize.width / 2 - 0.5;
        y += mapSize.height / 2 - 0.5;

        x |= 0;
        y |= 0;
        return new cc.Vec2(x, y);
    }

    TouchPos2GridmapPos(touchevent: cc.EventTouch): cc.Vec2 {

        let wpos = tiledhelp.Touchpos2NodePos(this.node, touchevent, this.camera);
        let upos = touchevent.getUILocation();
        let npos = this.camera.convertToUINode(wpos, this.node);
        console.log("upos,npos", upos, npos);
        let x = upos.x;
        let y = upos.y;
        let tpos = tiledhelp.NodePos2GridmapPos(this._tile, wpos.x, wpos.y);
        return tpos
    }
    // let mapSize = this._tileMap.getMapSize();
    // let tileSize = this._tileMap.getTileSize();
    // let y = Math.floor((mapSize.height - 2 - ((2 * Math.floor(point.y) / Math.floor(tileSize.height)))));
    // let x = Math.floor(point.x / tileSize.width - (y % 2) / 2);
    update(deltaTime: number) {

    }
}


