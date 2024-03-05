import { _decorator, Color, Component, instantiate, Node, size, Sprite, SpriteFrame, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { TileHexDirection, TilePos } from '../../TiledMap/TileTool';
import { GameMain } from '../../../GameMain';
const { ccclass, property } = _decorator;

@ccclass('OuterMapCursorView')
export class OuterMapCursorView extends Component {
    public initData(hexViewRadius: number, parentScale: number) {
        this._hexViewRadius = hexViewRadius;
        this._parentScale = parentScale;
    }
    public show(tiledPosions: Vec2[], isError: boolean) {
        if (this._hexViewRadius == null ||
            this._parentScale == null) {
            return;
        }
        const worldPositons: { centerPos: Vec3, borderAngle: number, lineWidth: number }[] = [];
        const sinValue = Math.sin(30 * Math.PI / 180);
        for (let i = 0; i < tiledPosions.length; i++) {
            const tiledPos = tiledPosions[i];
            const centerWorldPos = GameMain.inst.outSceneMap.mapBG.getPosWorld(tiledPos.x, tiledPos.y);
            // left top
            const leftTop = GameMain.inst.outSceneMap.mapBG.getAroundByDirection(v2(tiledPos.x, tiledPos.y), TileHexDirection.LeftTop);
            if (leftTop == null ||
                !tiledPosions.some(pos => pos.x === leftTop.x && pos.y === leftTop.y)) {
                worldPositons.push({
                    centerPos: v3(
                        -this._hexViewRadius / 2 + centerWorldPos.x,
                        sinValue * this._hexViewRadius + (this._hexViewRadius - sinValue * this._hexViewRadius) / 2 + centerWorldPos.y,
                        0
                    ),
                    borderAngle: 30,
                    lineWidth: this._hexViewRadius / this._parentScale / Math.cos(30 * Math.PI / 180)
                });
            }
            // left 
            const left = GameMain.inst.outSceneMap.mapBG.getAroundByDirection(v2(tiledPos.x, tiledPos.y), TileHexDirection.Left);
            if (left == null ||
                !tiledPosions.some(pos => pos.x === left.x && pos.y === left.y)) {
                worldPositons.push({
                    centerPos: v3(
                        -this._hexViewRadius + centerWorldPos.x,
                        0 + centerWorldPos.y,
                        0
                    ),
                    borderAngle: 90,
                    lineWidth: this._hexViewRadius / this._parentScale
                });
            }
            // left bottom
            const leftBottom = GameMain.inst.outSceneMap.mapBG.getAroundByDirection(v2(tiledPos.x, tiledPos.y), TileHexDirection.LeftBottom);
            if (leftBottom == null ||
                !tiledPosions.some(pos => pos.x === leftBottom.x && pos.y === leftBottom.y)) {
                worldPositons.push({
                    centerPos: v3(
                        -this._hexViewRadius / 2 + centerWorldPos.x,
                        -sinValue * this._hexViewRadius - Math.abs(-this._hexViewRadius + sinValue * this._hexViewRadius) / 2 + centerWorldPos.y,
                        0
                    ),
                    borderAngle: -30,
                    lineWidth: this._hexViewRadius / this._parentScale / Math.cos(30 * Math.PI / 180)
                });
            }
            // right bottom
            const rightBottom = GameMain.inst.outSceneMap.mapBG.getAroundByDirection(v2(tiledPos.x, tiledPos.y), TileHexDirection.RightBottom);
            if (rightBottom == null ||
                !tiledPosions.some(pos => pos.x === rightBottom.x && pos.y === rightBottom.y)) {
                worldPositons.push({
                    centerPos: v3(
                        this._hexViewRadius / 2 + centerWorldPos.x,
                        -sinValue * this._hexViewRadius - Math.abs(-this._hexViewRadius + sinValue * this._hexViewRadius) / 2 + centerWorldPos.y,
                        0
                    ),
                    borderAngle: 30,
                    lineWidth: this._hexViewRadius / this._parentScale / Math.cos(30 * Math.PI / 180)
                });
            }
            // right
            const right = GameMain.inst.outSceneMap.mapBG.getAroundByDirection(v2(tiledPos.x, tiledPos.y), TileHexDirection.Right);
            if (right == null ||
                !tiledPosions.some(pos => pos.x === right.x && pos.y === right.y)) {
                worldPositons.push({
                    centerPos: v3(
                        this._hexViewRadius + centerWorldPos.x,
                        0 + centerWorldPos.y,
                        0
                    ),
                    borderAngle: 90,
                    lineWidth: this._hexViewRadius / this._parentScale
                });
            }
            // right top
            const rightTop = GameMain.inst.outSceneMap.mapBG.getAroundByDirection(v2(tiledPos.x, tiledPos.y), TileHexDirection.RightTop);
            if (rightTop == null ||
                !tiledPosions.some(pos => pos.x === rightTop.x && pos.y === rightTop.y)) {
                worldPositons.push({
                    centerPos: v3(
                        this._hexViewRadius / 2 + centerWorldPos.x,
                        sinValue * this._hexViewRadius + (this._hexViewRadius - sinValue * this._hexViewRadius) / 2 + centerWorldPos.y,
                        0
                    ),
                    borderAngle: -30,
                    lineWidth: this._hexViewRadius / this._parentScale / Math.cos(30 * Math.PI / 180)
                });
            }
        }
        let index = 0;
        for (; index < worldPositons.length; index++) {
            let line: Node = null;
            if (index < this._cursorBorderPool.length) {
                line = this._cursorBorderPool[index];
            } else {
                line = instantiate(this._cursorBorderNode);
                line.setParent(this.node);
                this._cursorBorderPool.push(line);
            }
            line.getComponent(UITransform).setContentSize(size(worldPositons[index].lineWidth, 6));
            line.active = true;
            line.getComponent(Sprite).color = isError ? Color.RED : Color.WHITE;
            line.setPosition(this.node.getComponent(UITransform).convertToNodeSpaceAR(worldPositons[index].centerPos));
            line.angle = worldPositons[index].borderAngle;
        }
        for (; index < this._cursorBorderPool.length; index++) {
            this._cursorBorderPool[index].destroy();
            this._cursorBorderPool.splice(index, 1);
            index -= 1;
        }
    }
    public hide() {
        for (const node of this._cursorBorderPool) {
            node.active = false;
        }
        this.node.position = v3(0, 0, 0);
    }
    public move(sub: Vec2) {
        this.node.position = v3(
            this.node.position.x + sub.x,
            this.node.position.y + sub.y,
            this.node.position.z
        );
    }

    @property(SpriteFrame)
    private cursorBorderImage: SpriteFrame = null;

    private _hexViewRadius: number = 0;
    private _parentScale: number = 0;

    private _cursorBorderNode: Node = null;
    private _cursorBorderPool: Node[] = null;
    protected onLoad(): void {
        this._cursorBorderNode = new Node();
        this._cursorBorderNode.active = false;
        this._cursorBorderNode.addComponent(UITransform);
        const sprite = this._cursorBorderNode.addComponent(Sprite);
        sprite.spriteFrame = this.cursorBorderImage;
        sprite.sizeMode = Sprite.SizeMode.CUSTOM;
        this._cursorBorderNode.layer = this.node.layer;
        this._cursorBorderPool = [];
    }

    start() {
    }

    update(deltaTime: number) {

    }
}


