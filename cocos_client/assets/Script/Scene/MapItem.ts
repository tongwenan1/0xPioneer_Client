import { _decorator, Component, Node, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MapItem')
export class MapItem extends Component {

    _onClick() {
    }

    start() { 

        let clickNode = this.node.getChildByName("clickNode");
        console.log(this.node.name + " clickNode:"+clickNode.name); 

        // clickNode.on(Node.EventType.TOUCH_START, (event) => {
        //     //console.log(this.node.name + " clickNode:"+clickNode.name + " TOUCH_START"); 
        // }, this);
        
        // clickNode.on(Node.EventType.TOUCH_END, (event) => {
        //     //console.log(this.node.name + " clickNode:"+clickNode.name + " TOUCH_END"); 
        // }, this);
        
        // clickNode.on(Node.EventType.TOUCH_CANCEL, (event) => {
        //     //console.log(this.node.name + " clickNode:"+clickNode.name + " TOUCH_CANCEL"); 
        // }, this);

        clickNode.on(Node.EventType.MOUSE_DOWN, (event) => {
            console.log(this.node.name + " clickNode:"+clickNode.name + " MOUSE_DOWN"); 
            this._onClick();
        }, this);
        
        clickNode.on(Node.EventType.MOUSE_UP, (event) => {
            console.log(this.node.name + " clickNode:"+clickNode.name + " MOUSE_UP"); 
        }, this);
    }

    update(deltaTime: number) {
        
    }
}


