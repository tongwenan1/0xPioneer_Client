import { _decorator, Component, Node } from 'cc';
import * as cc from "cc";
import { tiledhelp } from './tiledhelp';

const { ccclass, property } = _decorator;

@ccclass('mover')
export class mover extends Component {
    start() {
        this.target = this.node.position.clone();

    }
    cleaner: tiledhelp
    SetCleaner(cleaner: tiledhelp) {
        this.cleaner = cleaner;
    }

    update(deltaTime: number) {
        var curpos = this.node.position.clone();
        var dist = cc.Vec2.distance(this.target, curpos);
        if (dist < 10) {
            this.node.setPosition(curpos);
        }
        else {

            var dir = new cc.Vec3();
            cc.math.Vec3.subtract(dir, this.target, curpos);
            let len = dir.length();
            if (len < 10) {
                this.node.setPosition(curpos);
            }
            else {
                dir = dir.normalize();
                var dmove = deltaTime * 100;
                if (dmove > dist) dmove = dist;
                dir = dir.multiplyScalar(dmove);
                curpos = curpos.add(dir);
                this.node.setPosition(curpos);
            }
        }
     

        this.cleaner.CleanMapWorldPos(curpos);
    }
    target: cc.Vec3;
    MoveTo(vec3: cc.Vec3) {
        this.target.x = vec3.x;
        this.target.y = vec3.y;
    }
}


