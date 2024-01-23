import { _decorator, Component, Node, Vec2, Vec3, CCString, UITransform, Label } from 'cc';
import { GameMain } from '../GameMain';
import { MapItem } from './MapItem';
import { OprateType, ResPointType } from '../Datas/ConstDefine';
import { OutMapItemMonsterData } from '../Datas/DataDefine';
const { ccclass, property } = _decorator;

@ccclass('MapItemMonster')
export class MapItemMonster extends MapItem {

    @property(CCString)
    monsterID = "1";

    @property(Label)
    nameLabel:Label;

    monsterData:OutMapItemMonsterData;

    public die() {
        this.node.active = false;
    }

    override _onClick() {
        super._onClick();

        console.log("MapItemMonster click monsterID:" + this.monsterID);

        if(GameMain.inst.UI.resOprUI.isShow){
            GameMain.inst.UI.resOprUI.show(false);
        }
        else {
            if(!this.monsterData){
                console.log(`localDatas.outMapData.monsters[${this.monsterID}] not exist`);
            }
            else {
                GameMain.inst.UI.resOprUI.refresh(ResPointType.RES_MONSTER,this.node.worldPosition.clone(),this.monsterData);
                GameMain.inst.UI.resOprUI.setNodePos(this.node.worldPosition.clone());
                GameMain.inst.UI.resOprUI.setTargetNode(this.node);
            }

            GameMain.inst.UI.resOprUI.show(true);
        }

        // for Debug ...
        // send pioneer

        // let pos = GameMain.inst.outSceneMap.SelfTown.getNearPosDoor(this.node.position);
        // GameMain.inst.outSceneMap.Pioneer1.node.setWorldPosition(pos);
        // GameMain.inst.outSceneMap.Pioneer1.moveTo(this.node.position);
    }

    start() {
        super.start();
        
        this.monsterData = GameMain.localDatas.outMapData.monsters[this.monsterID.toString()];
        this.nameLabel.string = "" + this.monsterData.level;
    }

    update(deltaTime: number) {
        
    }
}


