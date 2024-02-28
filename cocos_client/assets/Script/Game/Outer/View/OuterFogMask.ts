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
        this._graphics.lineWidth = 1;
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
}
