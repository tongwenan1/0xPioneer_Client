import { _decorator, Color, Component, Graphics, Node, random, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('OuterFogMask')
export class OuterFogMask extends Component {

    public draw(boundLines: { startPos: Vec2, endPos: Vec2 }[]) {
        if (boundLines.length <= 0) {
            return;
        }
        this._graphics.clear();
        const drawedPoses: Vec2[] = [];
        //start
        const startPos = boundLines[0].startPos;
        this._graphics.moveTo(startPos.x, startPos.y);
        drawedPoses.push(startPos);

        let nexPos = boundLines[0].endPos;
        this._graphics.lineTo(nexPos.x, nexPos.y);
        let i = 0;
        do {
            i ++;
            this._graphics.lineTo(nexPos.x, nexPos.y);
            drawedPoses.push(nexPos);
            nexPos = this._findNextPos(nexPos, boundLines, drawedPoses);
        } while (nexPos != null);
        this._graphics.close();
        this._graphics.stroke();
        this._graphics.fill();
    }

    private _graphics: Graphics = null;

    protected onLoad(): void {
        this._graphics = this.node.getComponent(Graphics);
        this._graphics.lineWidth = 10;
        this._graphics.lineJoin = 2;
        this._graphics.lineCap = 0;
    }

    start() {

    }

    update(deltaTime: number) {

    }

    private _findNextPos(currentPos: Vec2, boundLines: { startPos: Vec2, endPos: Vec2 }[], drawedPoses: Vec2[]) {
        for (const line of boundLines) {
            if ((line.startPos.x == currentPos.x && line.startPos.y == currentPos.y) ||
            line.endPos.x == currentPos.x && line.endPos.y == currentPos.y) {
                let startUsed: boolean = false;
                let endUsed: boolean = false;
                for (const drawedPos of drawedPoses) {
                    if (drawedPos.x == line.startPos.x && drawedPos.y == line.startPos.y) {
                        startUsed = true;
                    }
                    if (drawedPos.x == line.endPos.x && drawedPos.y == line.endPos.y) {
                        endUsed = true;
                    }
                }
                if (startUsed && endUsed) {
                    continue;
                }
                if (line.startPos.x == currentPos.x && line.startPos.y == currentPos.y) {
                    return line.endPos;
                } else {
                    return line.startPos;
                }
            }
        }
        return null;
    }

    private _areEdgesEqual(edge1: { startPos: Vec2, endPos: Vec2 }, edge2: { startPos: Vec2, endPos: Vec2 }) {
        if ((edge1.startPos.x == edge2.startPos.x && edge1.startPos.y == edge2.startPos.y &&
            edge1.endPos.x == edge2.endPos.x && edge1.endPos.y == edge2.endPos.y) ||

            (edge1.startPos.x == edge2.endPos.x && edge1.startPos.y == edge2.endPos.y &&
                edge1.endPos.x == edge2.startPos.x && edge1.endPos.y == edge2.startPos.y)) {
            return true;
        }
        return false;
    }

    private _areEdgesConnected(edge1: { startPos: Vec2, endPos: Vec2 }, edge2: { startPos: Vec2, endPos: Vec2 }) {
        return (
            (edge1.endPos.x === edge2.startPos.x && edge1.endPos.y === edge2.startPos.y) ||
            (edge1.endPos.x === edge2.endPos.x && edge1.endPos.y === edge2.endPos.y) ||
            (edge1.startPos.x === edge2.startPos.x && edge1.startPos.y === edge2.startPos.y) ||
            (edge1.startPos.x === edge2.endPos.x && edge1.startPos.y === edge2.endPos.y)
        );
    }

    private _calcEachSexAngle(pos: Vec3, radius: number) {
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
