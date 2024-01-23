import { _decorator, Component, Node, Button, SpriteFrame, Sprite, Label, Vec3, RichText } from 'cc';
import { OutMapItemTownData } from '../Datas/DataDefine';
import { GameMain } from '../GameMain';
import { PopUpUI } from './TemplateUI/PopUpUI';
const { ccclass, property } = _decorator;

@ccclass('TownInfoUI')
export class TownInfoUI extends PopUpUI {
    
    // @property(Label)
    // LevelLabel:Label;

    // @property(Label)
    // PlayerNameLabel:Label;

    // @property(Label)
    // MoneyLabel:Label;

    // @property(Label)
    // DiamondLabel:Label;

    // @property(Label)
    // WaterLabel:Label;

    
    @property(Label)
    txtTitle:Label;

    @property(RichText)
    txtDescInfo:RichText;

    
    public override get typeName() {
        return "TownInfoUI";
    }


    public freshTownInfo(data:OutMapItemTownData) {
        // this.LevelLabel.string = "Level " + data.level;
        // this.PlayerNameLabel.string = data.playerName;
        // this.MoneyLabel.string = data.money.toString();
        // this.DiamondLabel.string = data.diamond.toString();
        // this.WaterLabel.string = data.water.toString();

        this.txtTitle.string = `${data.playerName} Lv.${data.level}`;

        // TODO fixed configuration
        this.txtDescInfo.string = data.desc.replace(/&/g,"\n");

        // this.txtDescInfo.string = data.desc;
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


