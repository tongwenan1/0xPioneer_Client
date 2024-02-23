import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MapItem')
export class MapItem extends Component {

    _onClick() {
    }

    start() { 

        let clickNode = this.node.getChildByName("clickNode");

        clickNode.on(Node.EventType.MOUSE_DOWN, (event) => {
            this._onClick();
        }, this);
        
        clickNode.on(Node.EventType.MOUSE_UP, (event) => {
        }, this);
    }

    update(deltaTime: number) {
        
    }
}


