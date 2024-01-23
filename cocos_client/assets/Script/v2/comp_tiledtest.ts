import { _decorator, Component, Node } from 'cc';
import * as cc from "cc";
import { Web3Helper } from "./MetaMask/ethhelper"
const { ccclass, property } = _decorator;

@ccclass('comp_tiletest')
export class comp_tiletest extends Component {
    _tile: cc.TiledMap;

    @property(cc.SpriteFrame)
    os:cc.SpriteFrame;
    async start() {
        this._tile = this.node.getComponent(cc.TiledMap);
        //this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        //this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);

        //set shadow layer to dynamic
        let layer = this._tile.getLayer("shadow");
        layer.node.active = true;

        let size = this._tile.getMapSize();
        for (var y = 0; y < size.height; y++) {
            for (var x = 0; x < size.width; x++) {
                let node = new cc.Node();
                layer.node.addChild(node);
                let t = node.addComponent(cc.TiledTile);
                let wp = layer.getPositionAt(x, y);
                t.x = x;
                t.y = y;
                t.grid = 1;
                {
                    let tn = new cc.Node();
                    tn.name = "_sname"+x+"_"+y;
                    this.node.addChild(tn);
                    let s = tn.addComponent(cc.Sprite);
                    s.spriteFrame=this.os;
                    let wpos =new cc.Vec3(wp.x,wp.y,0);
                    tn.setWorldPosition(wpos);
                }

            }
        }

    }
    update(deltaTime: number) {

    }
}
