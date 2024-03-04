import { _decorator, Color, Component, Graphics, Node, random, v3, Vec2, Vec3 } from 'cc';
import { TilePos } from '../../TiledMap/TileTool';
const { ccclass, property } = _decorator;

@ccclass('OuterFogAnimShapMask')
export class OuterFogAnimShapMask extends Component {

    public draw(sixPos: Vec2[], radius: number) {
        if (sixPos.length <= 0) {
            return;
        }
        if (this._graphics == null) {
            return;
        }
        this._graphics.clear();
        for (const pos of sixPos) {
            this._calcEachSixAngle(pos, radius);
        }
    }

    private _graphics: Graphics = null;

    protected onLoad(): void {
        this._graphics = this.node.getComponent(Graphics);
        this._graphics.lineWidth = 1;
        this._graphics.lineJoin = 2;
        this._graphics.lineCap = 0;
    }

    start() {

    }

    update(deltaTime: number) {

    }

    private _calcEachSixAngle(pos: Vec2, radius: number) {
        const leftRightAngle: number = 30;
        const sinValue = Math.sin(leftRightAngle * Math.PI / 180);
        // top begin
        this._graphics.moveTo(pos.x, radius + pos.y);
        this._graphics.lineTo(-radius + pos.x, sinValue * radius + pos.y);
        this._graphics.lineTo(-radius + pos.x, -sinValue * radius + pos.y);
        this._graphics.lineTo(pos.x, -radius + pos.y);
        this._graphics.lineTo(radius + pos.x, -sinValue * radius + pos.y);
        this._graphics.lineTo(radius + pos.x, sinValue * radius + pos.y);

        this._graphics.close();
        this._graphics.stroke();
        this._graphics.fill();
    }
}
