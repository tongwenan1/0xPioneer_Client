import { _decorator, Component, Node, Button, SpriteFrame, Sprite, Label } from 'cc';
import { OutMapItemMonsterData } from '../Datas/DataDefine';
import { GameMain } from '../GameMain';
import { PopUpUI } from './TemplateUI/PopUpUI';
const { ccclass, property } = _decorator;

@ccclass('MonsterInfoUI')
export class MonsterInfoUI extends PopUpUI {
    
    public override get typeName() {
        return "MonsterInfoUI";
    }
    
    public freshMonsterInfo(data:OutMapItemMonsterData) {
    }

    start() {

    }

    update(deltaTime: number) {
 
    }
}


