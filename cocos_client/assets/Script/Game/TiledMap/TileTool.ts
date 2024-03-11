import * as cc from 'cc';

export enum TileHexDirection {
    LeftTop = 0,
    Left = 1,
    LeftBottom = 2,
    RightTop = 3,
    Right = 4,
    RightBottom = 5
}

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
    toInfoSingleLine(): string {
        return this.worldx + "," + this.worldy + " "
            + this.calc_x + "," + this.calc_y + "," + this.calc_z;
    }
    g: number;
    h: number;
}


export interface IDynamicBlock {
    get TileX(): number;
    get TileY(): number;
}

export class MyTile extends cc.TiledTile {
    fall: number = -1;
    timer: number = 0;
    owner: any = null;
    //zhege update only call when layer change. not good.
    // update(deltaTime: number) {
    //     if (this.grid != this.fall && this.fall > 0) {
    //         this.timer += deltaTime;
    //         if (this.timer > 1.0) {
    //             this.timer = 0;
    //             this.grid = this.fall;
    //         }
    //     }
    // }

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
            this.pixelheight = this.tileheight * this.height;
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


            // p.worldx = (x + 0.5) * this.tilewidth;
            // if (cross)
            //     p.worldx += this.tilewidth * 0.5;
            // p.worldy = (y - 0.5) * (this.tileheight * 0.75);//- this.tileheight * 0.5 * 0.75;

            //srcx = x ~ (x+1)
            //srcx2 = x+0.5 ~ (x+1.5)
            let x1 = ((wxfornode) / this.tilewidth) | 0;
            let x2 = ((wxfornode - this.tilewidth * 0.5) / this.tilewidth) | 0;

            //srcy =  y*0.75 -0.5   -0.5 y*0.75

            let y = ((wyfornode + ((this.tileheight * 0.75) * 1.5)
                - this.tileheight * 1.0
            ) / (this.tileheight * 0.75)) | 0;
            //5232+ya +64 /96 = 56
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
    getExtAround(pos: TilePos, extlen: number): TilePos[] {
        const postions = [];
        for (var y = pos.calc_y - extlen; y <= pos.calc_y + extlen; y++) {
            for (var x = pos.calc_x - extlen; x <= pos.calc_x + extlen; x++) {
                var z = 0 - x - y;
                if (z < pos.calc_z - extlen || z > pos.calc_z + extlen)
                    continue;
                var gpos = this.getPosByCalcPos(x, y, z);
                //console.log("calcpos=" + x + "," + y + "," + z + "->" + gpos.x + "," + gpos.y);
                if (gpos != null) {
                    postions.push(gpos);

                }
            }
        }
        return postions;
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
                    p.worldy = (y - 0.5) * (this.tileheight * 0.75)
                        + this.tileheight * 1.0;

                    p.calc_x = x - ((y / 2) | 0);
                    p.calc_y = y;
                    p.calc_z = 0 - p.calc_x - p.calc_y;
                }
                this._pos[y * this.width + x] = p;
                this._calcpos2pos[this.getCalcPosKey(p.calc_x, p.calc_y, p.calc_z)] = p;
            }
        }
    }

    _shadowtiles: MyTile[];
    _shadowtag: number;
    _shadowcleantag: number;
    _shadowhalftag: number;
    _shadowhalf2tag: number;
    _shadowLayer:cc.TiledLayer;
    protected _shadowBorderPfb: cc.Prefab;
    protected _freeShadowBorders: cc.Node[] = [];
    protected _usedSHadowBorders: cc.Node[] = [];
    protected _ShadowBorder_Reset() {
        for(; this._usedSHadowBorders.length > 0; ){

            let borderNode = this._usedSHadowBorders[this._usedSHadowBorders.length-1];
            this._shadowLayer.removeUserNode(borderNode); 

            this._freeShadowBorders.push(this._usedSHadowBorders.pop());
        }
    }
    protected _Fetch_ShadowBorderNode():cc.Node {
        let bn;
        if(this._freeShadowBorders.length > 0){
            bn = this._freeShadowBorders.pop();
        }
        else {
            bn = cc.instantiate(this._shadowBorderPfb);
        }

        return bn;
    }
    Shadow_Init(cleantag: number, shadowtag: number, shadowborderPfb:cc.Prefab, layername: string = "shadow"): void {
        this._shadowcleantag = cleantag;
        this._shadowtag = shadowtag;
        var layer = this._tilemap.getLayer(layername);
        layer.node.active = true;
        this._shadowLayer = layer;
        this._shadowBorderPfb = shadowborderPfb;

        this._shadowtiles = [];
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var _node = new cc.Node();

                let t = _node.addComponent(MyTile);
                t.fall = -1;
                t.x = x;
                t.y = y;
                _node.parent = layer.node;
                t.grid = this._shadowtag;//75 is all black

                this._shadowtiles[y * this.width + x] = t;

            }
        }
    }
    Shadow_Update(delta: number): void {
        var update = false;
        let x1 = 10000;
        let y1 = 10000;
        let x2 = 0;
        let y2 = 0;
        for (var i = 0; i < this._shadowtiles.length; i++) {
            var s = this._shadowtiles[i];
            if (s.fall == -1)
                continue;
            if (s.fall == s.grid)
                continue;
            s.timer += delta;
            if (s.timer > 1.0) {
                if (x1 > s.x)
                    x1 = s.x;
                if (y1 > s.y)
                    y1 = s.y;
                if (x2 < s.x)
                    x2 = s.x;
                if (y2 < s.y)
                    y2 = s.y;
                s.grid = s.fall;
                s.owner = null;
                update = true;
            }
        }
        if (update) {
            this._tilemap.getLayer("shadow").updateViewPort(x1, y1, x2 - x1 + 1, y2 - y1 + 1);
        }
    }
    Shadow_Earse(pos: TilePos, owner: any, extlen: number = 1, fall: boolean = false): TilePos[] {
        //console.log("pos=" + pos.x + "," + pos.y + ":" + pos.worldx + "," + pos.worldy);
        //for (var z = pos.calc_z - extlen; z <= pos.calc_z + extlen; z++) {
        const newCleardPositons = [];
        const borderTilePostions:TilePos[] = [];
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
                    if (!fall) {
                        if (s.grid == 0 && s.owner != null && s.owner != owner) {
                            s.timer = 0;
                            continue;//Strengthen other people’s vision
                        }
                        if (s.grid == this._shadowtag) {
                            newCleardPositons.push(gpos);
                        }
                        s.grid = this._shadowcleantag;

                        if (extlen > 1) {
                            var border = Math.abs(pos.calc_x - x) == extlen || Math.abs(pos.calc_y - y) == extlen || Math.abs(pos.calc_z - z) == extlen;
                            if (border) {
                                s.grid = this._shadowhalftag;
                                borderTilePostions.push(gpos);
                            }
                        }
                        s.owner = owner;
                        s.fall = this._shadowhalf2tag;
                        s.timer = 0;//Fully open first, then the timing becomes semi-transparent
                    }
                    else {
                        s.grid = this._shadowhalf2tag;
                        s.fall = -1;
                        s.timer = 0;
                    }
                    //s.grid = 0;//0 is full open
                }
            }
        }
        //}

        // update user tile for border tiles
        if(this._shadowBorderPfb){
            this._ShadowBorder_Reset();
            for(let i=0; i< borderTilePostions.length; ++i){
                let borderPos = borderTilePostions[i];
                let borderNode = this._Fetch_ShadowBorderNode();
                borderNode.setWorldPosition(cc.v3(borderPos.worldx, borderPos.worldy, 0));
                this._shadowLayer.addUserNode(borderNode);
                this._usedSHadowBorders.push(borderNode);

                let bnSpr:cc.Sprite = borderNode.getComponent(cc.Sprite);
                bnSpr.customMaterial.setProperty("dissolveThreshold", 0.5); // TO DO : calc disolve threshold by distance from player
            }
        }

        this._tilemap.getLayer("shadow").updateViewPort(vx, vy, extlen * 2 + 1, extlen * 2 + 1);
        return newCleardPositons;
    }

    Shadow_IsAllBlack(x: number, y: number): boolean {
        return this._shadowtiles[y * this.width + x].grid == this._shadowtag;
    }
    Shadow_GetClearedTiledPositons(): TilePos[] {
        const positions = [];
        for (const tiles of this._shadowtiles) {
            if (tiles.grid != this._shadowtag) {
                positions.push(this.getPos(tiles.x, tiles.y));
            }
        }
        return positions;
    }

    Shadow_Reset() {
        for (var i = 0; i < this._shadowtiles.length; i++) {
            this._shadowtiles[i].grid = this._shadowtag;
            this._shadowtiles[i].fall = -1;
        }
        this._tilemap.getLayer("shadow").updateViewPort(0, 0, this.width, this.height);
    }

    _blocked: boolean[] = []
    _dynamicblock: IDynamicBlock[] = []
    Path_InitBlock(blocktag: number = 0, other: (x: number, y: number, tag: number) => void = null) {
        let layb = this._tilemap.getLayer("block");
        let layd = this._tilemap.getLayer("decoration");
        layb.node.active = false;
        layd.node.active = false;



        for (var y = 0; y < this.height; y++) {

            for (var x = 0; x < this.width; x++) {
                var btag = layb.tiles[y * this.height + x];
                var btag2 = layd.tiles[y * this.height + x];//decoration

                if (btag2 != 0) {
                    if (other != null)
                        other(x, y, btag2);
                }

                //block
                var block = btag == blocktag;

                this._blocked[y * this.height + x] = block;

            }
        }
    }
    Path_AddDynamicBlock(block: IDynamicBlock): void {
        this._dynamicblock.push(block);
    }
    Path_RemoveDynamicBlock(block: IDynamicBlock): void {
        for (let i = 0; i < this._dynamicblock.length; i++) {
            if (this._dynamicblock[i].TileX == block.TileX &&
                this._dynamicblock[i].TileY == block.TileY) {
                this._dynamicblock.splice(i, 1);
                break;
            }
        }
        // cannot find blockindex
        // var i = this._dynamicblock.indexOf(block);
    }
    Path_GetAround(pos: TilePos): TilePos[] {
        let around: TilePos[] = [];
        var p0 = this.getPosByCalcPos(pos.calc_x - 1, pos.calc_y, pos.calc_z + 1);
        if (p0 != null) around.push(p0);
        var p1 = this.getPosByCalcPos(pos.calc_x + 1, pos.calc_y, pos.calc_z - 1);
        if (p1 != null) around.push(p1);
        var p2 = this.getPosByCalcPos(pos.calc_x + 1, pos.calc_y - 1, pos.calc_z);
        if (p2 != null) around.push(p2);
        var p3 = this.getPosByCalcPos(pos.calc_x - 1, pos.calc_y + 1, pos.calc_z);
        if (p3 != null) around.push(p3);
        var p4 = this.getPosByCalcPos(pos.calc_x, pos.calc_y + 1, pos.calc_z - 1);
        if (p4 != null) around.push(p4);
        var p5 = this.getPosByCalcPos(pos.calc_x, pos.calc_y - 1, pos.calc_z + 1);
        if (p5 != null) around.push(p5);
        return around;
    }
    /**
     * lefttop:x:0,y:-1,z:1
     * left:x:-1,y:0,z:1
     * leftbottom:x:-1,y:1,z:0
     * righttop:x:1,y:-1,z:0
     * right:x:1,y:0,z:-1
     * rightbottom:x:0,y:1,z:-1
     * @param direction
     */
    Path_GetAroundByDirection(pos: TilePos, direction: TileHexDirection): TilePos | null {
        const directionPos = cc.v3(0, 0, 0);
        if (direction == TileHexDirection.LeftTop) {
            directionPos.x = 0;
            directionPos.y = -1;
            directionPos.z = 1;
        } else if (direction == TileHexDirection.Left) {
            directionPos.x = -1;
            directionPos.y = 0;
            directionPos.z = 1;
        } else if (direction == TileHexDirection.LeftBottom) {
            directionPos.x = -1;
            directionPos.y = 1;
            directionPos.z = 0;
        } else if (direction == TileHexDirection.RightTop) {
            directionPos.x = 1;
            directionPos.y = -1;
            directionPos.z = 0;
        } else if (direction == TileHexDirection.Right) {
            directionPos.x = 1;
            directionPos.y = 0;
            directionPos.z = -1;
        } else if (direction == TileHexDirection.RightBottom) {
            directionPos.x = 0;
            directionPos.y = 1;
            directionPos.z = -1;
        }
        const p = this.getPosByCalcPos(pos.calc_x + directionPos.x, pos.calc_y + directionPos.y, pos.calc_z + directionPos.z);
        if (p != null) {
            return p;
        }
        return null;
    }
    Path_DistPos(a: TilePos, b: TilePos): number {
        var dx = (a.calc_x - b.calc_x);
        if (dx < 0) dx *= -1;
        var dy = (a.calc_y - b.calc_y);
        if (dy < 0) dy *= -1;
        var dz = (a.calc_z - b.calc_z);
        if (dz < 0) dz *= -1;
        //max
        return (dx > dy) ? (dx > dz ? dx : dz) : (dy > dz ? dy : dz);
    }
    Path_Equal(a: TilePos, b: TilePos): boolean {
        return a.calc_x == b.calc_x && a.calc_y == b.calc_y;
    }
    Path_Contains(list: TilePos[], pos: TilePos): boolean {
        for (var i = 0; i < list.length; i++) {
            if (this.Path_Equal(list[i], pos))
                return true;
        }
        return false;
    }
    Path_IsBlock(x: number, y: number): boolean {
        var b = this._blocked[y * this.height + x];
        if (b) {
            return b;
        }
        for (var i = 0; i < this._dynamicblock.length; i++) {
            if (this._dynamicblock[i].TileX == x && this._dynamicblock[i].TileY == y) {
                return true;
            }
        }
        return false;
    }
    Path_FromTo(from: TilePos, to: TilePos, limitstep = 100): TilePos[] {

        if (this.Path_IsBlock(to.x, to.y))
            return [from];

        var openPathTiles: TilePos[] = [];
        var closedPathTiles: TilePos[] = [];

        var currentTile = from;
        currentTile.g = 0;
        currentTile.h = this.Path_DistPos(from, to);

        // push first point to opentable
        openPathTiles.push(currentTile);

        for (var i = 0; i < limitstep; i++)
        // while (openPathTiles.Count != 0)
        {
            //     sort and get lowest F
            openPathTiles.sort((a, b) => (a.g + a.h) - (b.g + b.h));
            currentTile = openPathTiles[0];
            //    move current from open to close
            var ic = openPathTiles.indexOf(currentTile);
            openPathTiles.splice(ic, 1);
            closedPathTiles.push(currentTile);

            var g = currentTile.g + 1;

            //  if(close have target, final it.)
            if (closedPathTiles.indexOf(to) >= 0) {
                break;
            }

            //    searach around
            var apprivateTiles = this.Path_GetAround(currentTile);
            for (var i = 0; i < apprivateTiles.length; i++)
            //     foreach (Tile adjacentTile in currentTile.apprivateTiles)
            {
                var adjacentTile = apprivateTiles[i];


                //block skip

                if (this.Path_IsBlock(adjacentTile.x, adjacentTile.y))
                    continue;


                //skip closed
                if (closedPathTiles.indexOf(adjacentTile) >= 0) {
                    continue;
                }

                //  if new,add and calc g h
                if (openPathTiles.indexOf(adjacentTile) < 0) {
                    adjacentTile.g = g;
                    adjacentTile.h = this.Path_DistPos(adjacentTile, to);
                    openPathTiles.push(adjacentTile);
                }
                //    try to use low g
                else if ((adjacentTile.g + adjacentTile.h) > g + adjacentTile.h) {
                    adjacentTile.g = g;
                }
            }
        }

        // List<Tile> finalPathTiles = new List<Tile>();
        let path: TilePos[] = [];

        // final output
        if (closedPathTiles.indexOf(to) >= 0) {
            currentTile = to;
            path.push(currentTile);

            for (var i = to.g - 1; i >= 0; i--) {

                //find and push
                for (var j = 0; j < closedPathTiles.length; j++) {
                    var pnode = closedPathTiles[j];
                    if (pnode.g == i && this.Path_DistPos(pnode, currentTile) == 1) {
                        currentTile = pnode;
                        path.push(currentTile);
                        break;
                    }

                }

            }

            path.reverse();
        }

        return path




        return null;


    }
}


