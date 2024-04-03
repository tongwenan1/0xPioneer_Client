import { _decorator, CCInteger, Component, Node, Tween, tween, v3 } from 'cc';
import ViewController from './ViewController';
const { ccclass, property } = _decorator;

@ccclass('ShakeAnim')
export class ShakeAnim extends ViewController {
    @property(CCInteger)
    private shakeRange: number = 15;

    protected viewDidStart(): void {
        super.viewDidStart();
        tween()
        .target(this.node)
        .repeatForever(
            tween().sequence(
                tween().by(0.65, { position: v3(0, this.shakeRange, 0) }),
                tween().by(0.35, { position: v3(0, -this.shakeRange, 0) }),
                tween().by(0.65, { position: v3(0, this.shakeRange, 0) }),
                tween().by(0.35, { position: v3(0, -this.shakeRange, 0) }),
                tween().delay(0)
            )
        ).start();
    }
}


