import { _decorator, Component, Node, Vec2, Vec3, CCInteger, CCFloat, TweenAction, tween, Graphics, Color, Prefab, instantiate, resources, UITransform, v3, warn } from 'cc';
import { MapBG } from './MapBG';
const { ccclass, property } = _decorator;

@ccclass('MapOutScene')
export class MapOutScene extends Component {

    public mapBG: MapBG = null;

    protected async onLoad() {
        this.mapBG = this.node.getChildByName("Floor").getComponent(MapBG);
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


