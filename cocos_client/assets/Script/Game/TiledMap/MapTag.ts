import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MapTag')
export class MapTag extends Component {
    @property(Boolean)
    block:Boolean = false;

    start() {

    }

    update(deltaTime: number) {
        
    }
}


