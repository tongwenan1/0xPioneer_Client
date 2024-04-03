import { _decorator, CCInteger, Component, Node, Tween, tween, v3 } from 'cc';
import ViewController from './ViewController';
const { ccclass, property } = _decorator;

@ccclass('ShakeAnim')
export class ShakeAnim extends ViewController {
    @property(CCInteger)
    private shakeRange: number = 15;

    private _anim = null;
    protected viewDidAppear(): void {
        super.viewDidAppear();

        this._anim = tween()
            .target(this.node)
            .repeatForever(
                tween().sequence(
                    tween().by(0.05, { position: v3(0, this.shakeRange, 0) }),
                    tween().by(0.1, { position: v3(0, -this.shakeRange, 0) }),
                    tween().by(0.1, { position: v3(0, this.shakeRange, 0) }),
                    tween().by(0.05, { position: v3(0, -this.shakeRange, 0) }),
                    tween().delay(1)
                )
            ).start();
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();

        if (this._anim != null) {
            this._anim.stop();
            this._anim = null;
        }
    }
}


