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
        layer.node.active = true;

        let size = this._tile.getMapSize();
        for (var y = 0; y < size.height; y++) {
            for (var x = 0; x < size.width; x++) {
                let node = new cc.Node();
                layer.node.addChild(node);
                let t = node.addComponent(cc.TiledTile);
                layer.getPositionAt(x, y);
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

        let wpos = tiledhelp.Touchpos2WorldPos(event, this.camera);

        this.mover.MoveTo(wpos);

        //this.CleanMapWorldPos(wpos);


    }
    CleanMapWorldPos(pos: cc.Vec3): void {
        let npos = this.camera.convertToUINode(pos, this.node);
        let tpos = tiledhelp.NodePos2GridmapPos(this._tile, npos.x, npos.y);
        this.CleanMap(tpos.x, tpos.y);
    }
    CleanMap(gridx: number, gridy: number): void {
        let maptype = this._tile.getMapOrientation();
        let layer = this._tile.getLayer("shadow");
        let size = this._tile.getMapSize();

        if (maptype == 2)//degree 45
        {
            for (var y = gridy - 2; y <= gridy + 2; y++) {
                for (var x = gridx - 2; x <= gridx + 2; x++) {
                    if (x < 0 || y < 0 || x >= size.width || y >= size.height)
                        continue;
                    let t = layer.getTiledTileAt(x, y);
                    if (t == null)
                        continue;
                    t.grid = 0;

                }
            }
        }
        else if (maptype == 1)//hex
        {
            var posgrid = layer.getPositionAt(gridx, gridy);

            for (var y = gridy - 3; y <= gridy + 3; y++) {

                for (var x = gridx - 3; x <= gridx + 3; x++) {

                    if (x < 0 || y < 0 || x >= size.width || y >= size.height)
                        continue;
                    var pos = layer.getPositionAt(x, y);
                    if (cc.Vec2.distance(posgrid, pos) > 300)
                        continue;
                   

                    let t = layer.getTiledTileAt(x, y);

                    if (t == null)
                        continue;
                    t.grid = 0;

                }
            }
        }
        layer.updateViewPort(0, 0, size.width, size.height)

    }
    static Touchpos2WorldPos(touchevent: cc.EventTouch, camera: cc.Camera): cc.Vec3 {

        let sposview = touchevent.getLocation();

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


    static NodePos2GridmapPos(map: cc.TiledMap, nodex: number, nodey: number) {
        let mapSize = map.getMapSize();
        let tileSize = map.getTileSize();
        //let halfh = (mapSize.height * tileSize.height) / 2;
        let maptype = map.getMapOrientation();
        console.log("nodex=" + nodex + ",nodey=" + nodey);
        console.log("tileSize=" + tileSize.x + "," + tileSize.y);
        if (maptype == 2) {//map Isometric orientation. degree 45
            let x = (nodex / tileSize.width + (-nodey) / tileSize.height)
            let y = (-nodex / tileSize.width + (-nodey) / tileSize.height)

            x += mapSize.width / 2 - 0.5;
            y += mapSize.height / 2 - 0.5;

            x |= 0;
            y |= 0;
            return new cc.Vec2(x, y);
        }
        else if (maptype == 1)//hex map
        {
            var gridheight = (tileSize.height * 0.5);
            var mappixelheight = (gridheight * mapSize.height) + gridheight; //height more one gird
            var mappixelwidth = (tileSize.width * mapSize.width) + tileSize.width * 0.5; //width  more halfgird
            console.log("mappixel=" + mappixelwidth + "," + mappixelheight);
            var py = mappixelheight * 0.5 - nodey;
            var px = nodex + mappixelwidth * 0.5;

            let y = py / gridheight;

            let x = px / tileSize.width;
            if (y % 2 == 0) {
                x += 0.5
            }





            x |= 0;
            y |= 0;
            //console.log("tpos", x, y);
            return new cc.Vec2(x, y);
        }
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


