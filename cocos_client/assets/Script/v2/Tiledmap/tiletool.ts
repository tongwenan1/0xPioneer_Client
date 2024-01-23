import * as cc from 'cc';


export enum TileMapType {
    /**
     * @en Orthogonal orientation.
     * @property ORTHO
     * @type {Number}
     * @static
     */
    ORTHO = 0,
    /**
     * @en Hexagonal orientation.
     * @property HEX
     * @type {Number}
     * @static
     */
    HEX = 1,
    /**
     * Isometric orientation.
     * @property ISO
     * @type {Number}
     * @static
     */
    ISO = 2
}
export class TilePos {

    x: number;
    y: number;
    calc_x: number;
    calc_y: number;
    calc_z: number;

    worldx: number;
    worldy: number;
    toInfo(): string {
        return this.worldx + "," + this.worldy + "\n"
            + this.calc_x + "," + this.calc_y + "," + this.calc_z;
    }
}
export class TileMapHelper {
    constructor(tilemap: cc.TiledMap) {
        this._tilemap = tilemap;
        this.width = tilemap.getMapSize().width;
        this.height = tilemap.getMapSize().height;
        this.tilewidth = tilemap.getTileSize().width;
        this.tileheight = tilemap.getTileSize().height;
        this.type = tilemap.getMapOrientation() as number as TileMapType;
        if (this.type == TileMapType.ORTHO) {
            this.pixelwidth = this.tilewidth * this.width;
            this.pixelwidth = this.tileheight * this.height;
        }
        else if (this.type == TileMapType.HEX) {
            this.pixelwidth = this.tilewidth * this.width + this.tilewidth * 0.5;
            this.pixelheight = this.tileheight * this.height * 0.75 + this.tileheight * 0.5;
        }
        this.InitPos();
    }

    private _tilemap: cc.TiledMap
    private _pos: TilePos[];
    private _calcpos2pos: { [id: string]: TilePos } = {}
    width: number;
    height: number;
    tilewidth: number;
    tileheight: number;
    pixelwidth: number;
    pixelheight: number;
    type: TileMapType;

    getPos(x: number, y: number): TilePos {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height)
            return null;
        return this._pos[y * this.width + x];
    }
    getPosWorld(x: number, y: number): cc.Vec3 {
        let outv = new cc.Vec3();

        let pos = this.getPos(x, y)
        let iv = new cc.Vec3(pos.worldx - this.pixelwidth * 0.5, this.pixelheight * 0.5 - pos.worldy, 0);
        // outv.x = iv.x;
        // outv.y = iv.y;
        // outv.x *= 0.25;
        // outv.y *= 0.25;
        // outv.x += this.pixelwidth*0.5
        // outv.z = 0;
        cc.Vec3.transformMat4(outv, iv, this._tilemap.node.worldMatrix)
        return outv;
    }
    getPosByCalcPos(x: number, y: number, z: number): TilePos {
        var index = this.getCalcPosKey(x, y, z)
        //console.log("index=" + x + "," + y + "," + z + "=>" + index);
        return this._calcpos2pos[index];
    }
    getCalcPosKey(x: number, y: number, z: number): string {
        return (x | 0).toString() + "_" + (y | 0).toString() + "_" + (z | 0).toString();
    }
    getPosKey(x: number, y: number): number {
        return (y * this.width + x) | 0;
    }
    getPosByWorldPos(worldpos: cc.Vec3): TilePos {
        let invmat = this._tilemap.node.worldMatrix.clone().invert();
        let outv = new cc.Vec3();
        cc.Vec3.transformMat4(outv, worldpos, invmat);

        let wxfornode = outv.x + this.pixelwidth * 0.5;
        let wyfornode = this.pixelheight * 0.5 - outv.y;
        //console.log("wx=" + wxfornode + "," + wyfornode);
        if (this.type == TileMapType.ORTHO) {
            //srcx = x*this.tilewidth ~ (x+1)*this.tilewidth
            //srcy =y ~y+1
            let x = (wxfornode / this.tilewidth) | 0
            let y = (wyfornode / this.tileheight) | 0
            return this.getPos(wxfornode, wyfornode);
        }
        else if (this.type == TileMapType.HEX) {
            //srcx = x ~ (x+1)
            //srcx2 = x+0.5 ~ (x+1.5)
            let x1 = (wxfornode / this.tilewidth) | 0;
            let x2 = (wxfornode / this.tilewidth + 0.5) | 0;

            //srcy =  y*0.75 -0.5   -0.5 y*0.75

            let y = ((wyfornode) / (this.tileheight * 0.75) + 1) | 0;

            //console.log("sx=" + x1 + "-" + x2 + "," + y);
            let poss: TilePos[] = []
            var pos1 = this.getPos(x1, y - 1);
            var pos2 = this.getPos(x1, y);
            var pos3 = this.getPos(x1, y + 1);
            var pos4 = this.getPos(x2, y - 1);
            var pos5 = this.getPos(x2, y);
            var pos6 = this.getPos(x2, y + 1);
            if (pos1 != null) poss.push(pos1);
            if (pos2 != null) poss.push(pos2);
            if (pos3 != null) poss.push(pos3);
            if (pos4 != null) poss.push(pos4);
            if (pos5 != null) poss.push(pos5);
            if (pos6 != null) poss.push(pos6);
            var dist = 10000;
            var outpos: TilePos = null;
            var wnpos = new cc.Vec3(wxfornode, wyfornode, 0);
            for (var i = 0; i < poss.length; i++) {
                var p = poss[i];
                var d = cc.Vec3.distance(wnpos, new cc.Vec3(p.worldx, p.worldy, 0));
                if (d < dist) {
                    dist = d;
                    outpos = p;
                }
            }
            return outpos;
        }

    }
    private InitPos() {
        this._pos = [];//TilePos[this.width * this.height];
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                let p = new TilePos()
                p.x = x;
                p.y = y;
                if (this.type == 0) {
                    p.calc_x = x;
                    p.calc_y = y;
                    p.calc_z = 0;
                    p.worldx = (x + 0.5) * this.tilewidth;
                    p.worldy = (y + 0.5) * this.tileheight;

                }
                else if (this.type == 1)//hex
                {
                    var cross = y % 2 == 1;
                    p.worldx = (x + 0.5) * this.tilewidth;
                    if (cross)
                        p.worldx += this.tilewidth * 0.5;
                    p.worldy = (y - 0.5) * (this.tileheight * 0.75);//- this.tileheight * 0.5 * 0.75;

                    p.calc_x = x - ((y / 2) | 0);
                    p.calc_y = y;
                    p.calc_z = 0 - p.calc_x - p.calc_y;
                }
                this._pos[y * this.width + x] = p;
                this._calcpos2pos[this.getCalcPosKey(p.calc_x, p.calc_y, p.calc_z)] = p;
            }
        }
    }

    _shadowtiles: cc.TiledTile[];
    _shadowtag: number;
    _shadowcleantag: number;
    Shadow_Init(cleantag: number, shadowtag: number, layername: string = "shadow"): void {
        this._shadowcleantag = cleantag;
        this._shadowtag = shadowtag;
        var layer = this._tilemap.getLayer(layername);
        layer.node.active = true;
        this._shadowtiles = [];
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var _node = new cc.Node();


                let t = _node.addComponent(cc.TiledTile);

                t.x = x;
                t.y = y;
                t.grid = this._shadowtag;
                _node.parent = layer.node;

                this._shadowtiles[y * this.width + x] = t;

            }
        }
    }
    Shadow_Earse(pos: TilePos, extlen: number = 1): void {
        //console.log("pos=" + pos.x + "," + pos.y + ":" + pos.worldx + "," + pos.worldy);
        //for (var z = pos.calc_z - extlen; z <= pos.calc_z + extlen; z++) {
        let vx = 10000;
        let vy = 10000;
        for (var y = pos.calc_y - extlen; y <= pos.calc_y + extlen; y++) {
            for (var x = pos.calc_x - extlen; x <= pos.calc_x + extlen; x++) {
                var z = 0 - x - y;
                if (z < pos.calc_z - extlen || z > pos.calc_z + extlen)
                    continue;
                var gpos = this.getPosByCalcPos(x, y, z);
                //console.log("calcpos=" + x + "," + y + "," + z + "->" + gpos.x + "," + gpos.y);
                if (gpos != null) {
                    if (vx > gpos.x)
                        vx = gpos.x;
                    if (vy > gpos.y)
                        vy = gpos.y;
                    var s = this._shadowtiles[gpos.y * this.width + gpos.x];
                    //console.log("find node-" + s.x + "," + s.y + " wpos=" + gpos.worldx + "," + gpos.worldy);
                    s.grid = this._shadowcleantag;
                }
            }
        }
        //}
        this._tilemap.getLayer("shadow").updateViewPort(vx, vy, extlen * 2 + 1, extlen * 2 + 1);
    }

    Shadow_Reset() {
        for (var i = 0; i < this._shadowtiles.length; i++) {
            this._shadowtiles[i].grid = this._shadowtag;
        }
        this._tilemap.getLayer("shadow").updateViewPort(0, 0, this.width, this.height);
    }
}


