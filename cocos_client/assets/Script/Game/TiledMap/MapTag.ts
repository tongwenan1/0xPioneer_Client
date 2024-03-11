import { _decorator, CCBoolean, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MapTag')
export class MapTag extends Component {
    @property(CCBoolean)
    block:boolean = false;

    start() {

    }

    update(deltaTime: number) {
        
    }
}


