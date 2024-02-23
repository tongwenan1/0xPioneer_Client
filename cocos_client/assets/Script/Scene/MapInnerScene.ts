import { _decorator, Vec3,Node, Animation, Prefab, instantiate, log, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MapInnerScene')
export class MapInnerScene extends Component {

    @property(Prefab)
    private buildAnimPfb:Prefab;

    public buildAnimNode:Node;

    start() {
        let node = instantiate(this.buildAnimPfb);
        node.setParent(this.node);
        node.active = false;
        node.layer = this.node.layer;

        this.buildAnimNode = node;
        // this.buildAnimNode = node.getComponent(Animation);
    }


    playBuildAnim(parent: Node,time:number,callback:Function = null) {
        this.buildAnimNode.setParent(parent);
        this.buildAnimNode.active = true;
        this.buildAnimNode.setPosition(new Vec3(0,0,0));

        this.scheduleOnce(()=>{
            this.buildAnimNode.active = false;
            callback &&callback();
        },time);
    }

    update(deltaTime: number) {
        
    }
}


