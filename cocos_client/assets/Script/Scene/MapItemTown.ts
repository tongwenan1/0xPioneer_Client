import { _decorator, Component, Node, Vec2, Vec3, CCString, Prefab, instantiate, Label } from 'cc';
import { PioneerStatus } from '../Datas/ConstDefine';
import { GameMain } from '../GameMain';
import { MapItem } from './MapItem';
import { MapPioneer } from './MapPioneer';
const { ccclass, property } = _decorator;

@ccclass('MapItemTown')
export class MapItemTown extends MapItem {

    @property(CCString)
    playerID = "1";

    @property(Node)
    ArtifactNode:Node;

    @property(Label)
    nameLabel:Label;

    public door1:Node;
    public door2:Node;
    public door3:Node;
    public door4:Node;

    public Pioneer1:MapPioneer;
    public Pioneer2:MapPioneer;
    public Pioneer3:MapPioneer;

    public getPioneer(id: string){
        if(id == "1"){
            return this.Pioneer1;
        }
        else if(id == "2"){
            return this.Pioneer2;
        }
        else if(id == "3"){
            return this.Pioneer3;
        }
    }

    public getFreePioneer(){
        if(this.Pioneer1.data.status == PioneerStatus.IN_TOWN){
            return this.Pioneer1;
        }
        else if(this.Pioneer2.data.status == PioneerStatus.IN_TOWN){
            return this.Pioneer2;
        }
        else if(this.Pioneer3.data.status == PioneerStatus.IN_TOWN){
            return this.Pioneer3;
        }
    }

    public showArtifact(show:boolean) {
        if(this.ArtifactNode){
            this.ArtifactNode.active = show;
            return;
        }
    }

    override _onClick() {
        super._onClick();

        console.log("MapItemTown click playerID:" + this.playerID);

        if(this.playerID == GameMain.inst.outSceneMap.SelfTown.playerID) {
            // go back town
            GameMain.inst.changeScene();
        }
        else {
            if(GameMain.inst.UI.townOprUI.isShow){
                GameMain.inst.UI.townOprUI.show(false);
            }
            else {
    
                let data = GameMain.localDatas.outMapData.towns[this.playerID.toString()];
    
                if(!data){
                    console.log(`localDatas.outMapData.towns[${this.playerID}] not exist`);
                }
                else {
                    GameMain.inst.UI.townOprUI.setTargetNode(this.node);

                    let ndpos = this.getNearPosDoor(GameMain.inst.outSceneMap.SelfTown.node.worldPosition);
                    GameMain.inst.UI.townOprUI.refresh(ndpos, data);
                    let worldPos = this.node.worldPosition.clone();
                    worldPos.y -= 30;
                    GameMain.inst.UI.townOprUI.setNodePos(worldPos);
                }
    
                GameMain.inst.UI.townOprUI.show(true);
            }
        }
    }

    public getNearPosDoor(pos:Vec3) {
        let dist = 1000000000;
        let retPos:Vec3;

        let dist1 = this.door1.worldPosition.clone().subtract(pos).length();
        if(dist1 < dist){
            dist = dist1;
            retPos = this.door1.worldPosition;
        }
        let dist2 = this.door2.worldPosition.clone().subtract(pos).length();
        if(dist2 < dist){
            dist = dist2;
            retPos = this.door2.worldPosition;
        }
        let dist3 = this.door3.worldPosition.clone().subtract(pos).length();
        if(dist3 < dist){
            dist = dist3;
            retPos = this.door3.worldPosition;
        }
        let dist4 = this.door4.worldPosition.clone().subtract(pos).length();
        if(dist4 < dist){
            dist = dist4;
            retPos = this.door4.worldPosition;
        }

        console.log(`dist1:${dist1} dist2:${dist2} dist3:${dist3} dist4:${dist4} dist:${dist}`)

        console.log(`pos:${pos}, retPos:${retPos}`);

        return retPos;
    }

    onLoad() {

        this.nameLabel.string = "Player" + this.playerID;

        this.door1 = this.node.getChildByName("door1");
        this.door2 = this.node.getChildByName("door2");
        this.door3 = this.node.getChildByName("door3");
        this.door4 = this.node.getChildByName("door4");
        
        GameMain.inst.outSceneMap.Towns[this.playerID] = this;
        if(this.playerID == "3"){
            GameMain.inst.outSceneMap.SelfTown = this; // asign self town
            console.log(`self town worldpos:${this.node.position}`);
            
            let p1node = instantiate(GameMain.inst.outSceneMap.PioneerPfb);
            p1node.setParent(GameMain.inst.outSceneMap.DynamicLayerNode);
            this.Pioneer1 = p1node.getComponent(MapPioneer);
            let p1data = GameMain.localDatas.outMapData.pioneers.get('1');
            this.Pioneer1.init(p1data);
            
            let p2node = instantiate(GameMain.inst.outSceneMap.PioneerPfb);
            p2node.setParent(GameMain.inst.outSceneMap.DynamicLayerNode);
            this.Pioneer2 = p2node.getComponent(MapPioneer);
            let p2data = GameMain.localDatas.outMapData.pioneers.get('2');
            this.Pioneer2.init(p2data);
            
            let p3node = instantiate(GameMain.inst.outSceneMap.PioneerPfb);
            p3node.setParent(GameMain.inst.outSceneMap.DynamicLayerNode);
            this.Pioneer3 = p3node.getComponent(MapPioneer);
            let p3data = GameMain.localDatas.outMapData.pioneers.get('3');
            this.Pioneer3.init(p3data);

        }
        else if(this.playerID == "2") {

            let p1node = instantiate(GameMain.inst.outSceneMap.PioneerOtherPfb);
            p1node.setParent(GameMain.inst.outSceneMap.DynamicLayerNode);
            this.Pioneer1 = p1node.getComponent(MapPioneer);
            let p1data = GameMain.localDatas.outMapData.pioneers.get('4');
            this.Pioneer1.init(p1data);
            
            let p2node = instantiate(GameMain.inst.outSceneMap.PioneerOtherPfb);
            p2node.setParent(GameMain.inst.outSceneMap.DynamicLayerNode);
            this.Pioneer2 = p2node.getComponent(MapPioneer);
            let p2data = GameMain.localDatas.outMapData.pioneers.get('5');
            this.Pioneer2.init(p2data);
            
            let p3node = instantiate(GameMain.inst.outSceneMap.PioneerOtherPfb);
            p3node.setParent(GameMain.inst.outSceneMap.DynamicLayerNode);
            this.Pioneer3 = p3node.getComponent(MapPioneer);
            let p3data = GameMain.localDatas.outMapData.pioneers.get('6');
            this.Pioneer3.init(p3data);
        }
    }

    start() {
        super.start();

    }

    update(deltaTime: number) {
        
    }
}


