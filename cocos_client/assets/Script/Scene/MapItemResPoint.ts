import { _decorator, Component, Node, Vec2, Vec3, CCString, CCInteger, UIOpacity, UITransform, log, Texture2D, Sprite, SpriteFrame, Label, ProgressBar, tween } from 'cc';
import { GameMain } from '../GameMain';
import { MapItem } from './MapItem';
import EventMgr from '../Manger/EventMgr';
import { EventName, OprateType } from '../Datas/ConstDefine';
import { InnerBuildInfo, ResPointData } from '../Datas/DataDefine';
import { MapPioneer } from './MapPioneer';
const { ccclass, property } = _decorator;

@ccclass('MapItemResPoint')
export class MapItemResPoint extends MapItem {

    @property(CCString)
    buildID = "1";

    @property(Label)
    nameLabel:Label;

    @property(Sprite)
    flagSprite:Sprite;

    @property(Texture2D)
    redFlagTex:Texture2D;
    @property(Texture2D)
    blueFlagTex:Texture2D;
    @property(Texture2D)
    greenFlagTex:Texture2D;
    
    @property(ProgressBar)
    progressBar:ProgressBar;

    resPointData:ResPointData;

    pioneer:MapPioneer;

    override _onClick() {
        super._onClick();

        console.log("MapItemResPoint click id:" + this.buildID);
        if(GameMain.inst.UI.resOprUI.isShow){
            GameMain.inst.UI.resOprUI.show(false);
        }
        else {
            if(!this.resPointData){// unlock
                console.log(`localDatas.outMapData.resPoint.id [${this.buildID}] not exist`);
                return;
            }
            else {
                GameMain.inst.UI.resOprUI.refresh(this.resPointData.resType,this.node.worldPosition.clone(),this.resPointData);
                GameMain.inst.UI.resOprUI.setNodePos(this.node.worldPosition.clone());
                GameMain.inst.UI.resOprUI.setTargetNode(this.node);
            }

            GameMain.inst.UI.resOprUI.show(true);
        }
    }

    onRefreshData() {

        this.nameLabel.string = "" + this.resPointData.level;

        if(this.resPointData.playerID != "0") {
            if(this.resPointData.playerID == GameMain.inst.outSceneMap.SelfTown.playerID) {
                // self res point
                console.log("self onRefreshData this.resPointData.playerID"+this.resPointData.playerID);
                let sf = new SpriteFrame();
                sf.texture = this.blueFlagTex;
                this.flagSprite.spriteFrame = sf;
            }
            else {
                // other player res point
                console.log("other onRefreshData this.resPointData.playerID"+this.resPointData.playerID);
                let sf = new SpriteFrame();
                sf.texture = this.redFlagTex;
                this.flagSprite.spriteFrame = sf;
            }
        }
    }

    AddPioneer(p:MapPioneer) {
        this.pioneer = p;
        this.progressBar.progress = 0;
        this.progressBar.node.active = false;
    }

    onPioneerLeave() {
        let sf = new SpriteFrame();
        sf.texture = this.greenFlagTex;
        this.flagSprite.spriteFrame = sf;
    }
    
    start() {
        super.start();

        this.resPointData = GameMain.localDatas.outMapData.resPoint.get(this.buildID.toString());
        this.onRefreshData();
        
        if(this.progressBar){
            this.progressBar.node.active = false;
        }
    }

    update(deltaTime: number) {
        if(this.pioneer) {
            this.progressBar.progress += deltaTime*(1/this.resPointData.time);
            
            if(this.progressBar.progress >= 1){
                
                this.progressBar.node.active = false;
                this.progressBar.progress = 0;
                this.pioneer.backTown();
                this.pioneer = null;
                
                this.onPioneerLeave();
            }
        }
    }
}


