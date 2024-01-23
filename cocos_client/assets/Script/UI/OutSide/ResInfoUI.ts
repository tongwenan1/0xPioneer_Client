import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
import { PopUpUI } from '../TemplateUI/PopUpUI';
import { OprateType, ResPointType } from '../../Datas/ConstDefine';
const { ccclass, property } = _decorator;

@ccclass('ResInfoUI')
export class ResInfoUI extends PopUpUI {


    @property(Sprite)
    bgSprite: Sprite;

    @property([SpriteFrame])
    bgSpriteFrames: SpriteFrame[] = [];

    @property(Label)
    txtTitle: Label = null;

    @property(Label)
    txtDescInfo: Label = null;

    @property(Node)
    layoutNode: Node = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    refresh(data: any,type:String,pos:Vec3 = Vec3.ZERO) {
        this.txtTitle.string = `Lv.${data.level} ${data.playerName}`;
        
        data.desc = data.desc.replace(/#/g,"\n");

        let info;
        if(data.playerID == "0"){
            info = data.desc + "\n" + "owner:None";
        }
        else {
            info = data.desc + "\n" + "owner:Player"+data.playerID;
        }
        
        this.txtDescInfo.string = info;
        this.node.setPosition(pos);

        //this.bgSprite.spriteFrame = this.bgSpriteFrames[type];
    }

    onCloseClick(){
        this.node.active = false;
    }
}


