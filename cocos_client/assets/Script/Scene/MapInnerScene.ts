import { _decorator, Vec3, Node, Animation, Prefab, instantiate, log, Component } from 'cc';
import { InnerBuildingType } from '../Manger/UserInfoMgr';
const { ccclass, property } = _decorator;

@ccclass('MapInnerScene')
export class MapInnerScene extends Component {

    @property(Prefab)
    private buildAnimPfb: Prefab;

    private _buidingAnimMap: Map<InnerBuildingType, Node> = null;
    start() {
        this._buidingAnimMap = new Map();
    }

    isUpgrading(buildingType: InnerBuildingType) {
        return this._buidingAnimMap.has(buildingType);
    }
    playBuildAnim(buildingType: InnerBuildingType, parent: Node, time: number, callback: () => void = null) {
        const anim = instantiate(this.buildAnimPfb);
        anim.setParent(parent);
        anim.active = true;
        anim.setPosition(new Vec3(0, 0, 0));
        this._buidingAnimMap.set(buildingType, anim);
        this.scheduleOnce(() => {
            anim.destroy();
            this._buidingAnimMap.delete(buildingType);
            if (callback != null) {
                callback();
            }
        }, time);
    }

    update(deltaTime: number) {

    }
}


