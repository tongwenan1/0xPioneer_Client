import { _decorator, Component, Node, Vec2, Vec3, CCInteger, CCFloat, TweenAction, tween, Graphics, Color, Prefab, instantiate, resources, UITransform, v3, warn } from 'cc';
import { MapBG } from './MapBG';
import { AudioMgr } from '../Basic/AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('MapOutScene')
export class MapOutScene extends Component {

    public mapBG: MapBG = null;

    protected async onLoad() {
        this.mapBG = this.node.getChildByName("Floor").getComponent(MapBG);
        // AudioMgr.instance.playMusic("audio/SampleLong", true);
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


