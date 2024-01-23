import { _decorator, Component, Node, Animation, Vec2, Vec3, CCInteger, CCFloat, TweenAction, tween, Graphics, Color, instantiate, Sprite, Quat, UITransform, misc, Label, ProgressBar, log } from 'cc';
import { EventName, PioneerStatus, ResPointType } from '../Datas/ConstDefine';
import { PioneerData } from '../Datas/DataDefine';
import { Player } from '../Game/Player';
import { GameMain } from '../GameMain';
import EventMgr from '../Manger/EventMgr';
import { PlayerItemUI } from '../UI/PlayerItemUI';
import { MapItemMonster } from './MapItemMonster';
import { MapItemResPoint } from './MapItemResPoint';
import { MapItemTown } from './MapItemTown';
import { ProgressTime } from './ProgressTimeComp';
const { ccclass, property } = _decorator;

@ccclass('MapPioneer')
export class MapPioneer extends Component {

    @property(CCFloat)
    speed = 10.0;

    @property(Node)
    normalNode:Node;

    @property(Node)
    walkNode:Node;

    @property(Node)
    collectNode:Node;
    
    @property(Node)
    fightNode:Node;

    @property(Label)
    nameLabel:Label;

    @property(ProgressTime)
    progressInfo: ProgressTime = null;

    @property(Node)
    speedUpTag:Node;

    walkAni:Animation;
    collectAni:Animation;

    footLineNode:Node;
    footLineSprite:Sprite;
    footLineTrans:UITransform;

    data:PioneerData;

    _moveTargetNode:Node;

    inResPoint:MapItemResPoint;

    public init(d:PioneerData) {
        this.data = d;
        this.nameLabel.string = d.name;
        console.log(`MapPioneer id:${this.data.id} data.status:${this.data.status}`);
        switch(this.data.status) {
            case PioneerStatus.IN_TOWN:
                {
                    console.log(`MapPioneer id:${this.data.id} in town`);
                    this.node.active = false; // not show

                    let town:MapItemTown = GameMain.inst.outSceneMap.Towns[this.data.playerID];
                    console.log("town:"+town);
                    if(town){
                        
                        console.log(`MapPioneer in town exist`);

                        let pos = town.node.position.clone();
                        // for Debug ...
                        pos.x -= 110;
                        if(this.data.id == "2"){
                            pos.x -= 50;
                        }
                        pos.y += 50;
                        this.node.setPosition(pos);
                    }

                    // TO DO : show ui status
                }
                break;
            case PioneerStatus.MOVING:
                {
                    let node = null; // TO DO : find node from data
                    this.moveTo(new Vec3(this.data.targetX, this.data.targetY, 0), node); // moving
                    
                    // TO DO : show ui status
                }
                break;
            case PioneerStatus.IN_RES:
                {
                    this.node.active = false; // not show

                    // TO DO : show ui status
                }
                break;
        }

        if (this.speedUpTag) {
            this.speedUpTag.active = false;
        }
    }

    private static _UP:Vec3 = new Vec3(0.0,-1.0,0.0);
    private static _RIGHT:Vec3 = new Vec3(1.0,0.0,0.0);
    private static _HALF:Vec3 = new Vec3(0.5,0.5,0.5);
    public moveTo(targetWorldPos:Vec3, targetNode:Node) {
        this.data.targetX = targetWorldPos.x;
        this.data.targetY = targetWorldPos.y;
        this.data.status = PioneerStatus.MOVING;
        this.node.active = true;
        
        this.normalNode.active = false;
        this.walkNode.active = true;
        this.collectNode.active = false;
        this.fightNode.active = false;
        //this.walkAni.play();
        
        // TO DO : modify tihs.data target data
        this._moveTargetNode = targetNode;

        //console.log(`move from:${this.node.position} to:${pos}`);

        let dist:Vec3 = targetWorldPos.clone().subtract(this.node.worldPosition);
        
        let time = dist.length()/this.speed;
        tween(this.node)
            .to(dist.length()/this.speed, {worldPosition:targetWorldPos})
            .call(()=>{
                this._onMoveTargetReached();
            })
            .start();

        this.progressInfo.init(time);

        this.footLineTrans.height = dist.length() / this.footLineNode.worldScale.y;

        let nor = dist.clone().normalize();
        let lineRotZ = Math.atan2(nor.y, nor.x);
        let lineRotZDegree = misc.radiansToDegrees(lineRotZ) - 90;
        let roatQuat = new Quat();
        Quat.fromAngleZ(roatQuat, lineRotZDegree);
        this.footLineNode.setRotation(roatQuat);

        console.log(`lineRotZ:${lineRotZ} lineRotZDegree:${lineRotZDegree}`);

        // clac direction
        if(lineRotZDegree < -180){
            lineRotZDegree = lineRotZDegree + 360;
        }
        else if(lineRotZDegree > 180){
            lineRotZDegree = lineRotZDegree - 360;
        }
        if(lineRotZDegree > 0 && this.walkNode.scale.x > 0) {
            this.walkNode.setScale(new Vec3(-this.walkNode.scale.x, this.walkNode.scale.y, this.walkNode.scale.z));
        }
        if(lineRotZDegree < 0 && this.walkNode.scale.x < 0) {
            this.walkNode.setScale(new Vec3(-this.walkNode.scale.x, this.walkNode.scale.y, this.walkNode.scale.z));
        }

        let linePos = this.node.position.clone().add(dist.multiply(MapPioneer._HALF));
        linePos.y -= 40;
        this.footLineNode.setPosition(linePos);
        
        this.footLineNode.active = true;

        this.node.emit(EventName.PIONEER_STATUS_CHNAGE, this);
    }

    _onMoveTargetReached() {
        console.log(`MapPioneer id:${this.data.id} _onMoveTargetReached`);
        //this.lineNode.active = false;

        //EventMgr.emit(EventName.PIONEER_STATUS_CHNAGE,this.data);
        this.footLineNode.active = false;

        //this.collectAni.play();

        let resPoint:MapItemResPoint = this._moveTargetNode.getComponent(MapItemResPoint);
        if(resPoint){
            // reach res point
            this.inResPoint = resPoint;
            
            this.data.status = PioneerStatus.IN_RES;

            resPoint.resPointData.playerID = this.data.playerID;
            resPoint.onRefreshData();

            if(resPoint.resPointData.resType == ResPointType.RES_MINE) {
                resPoint.AddPioneer(this); // add to mine
                this.progressInfo.init(resPoint.resPointData.time);
                
                this.normalNode.active = false;
                this.walkNode.active = false;
                this.collectNode.active = true;
                this.fightNode.active = false;
            }
            else {
                this.progressInfo.hide();
                this.normalNode.active = true;
                this.walkNode.active = false;
                this.collectNode.active = false;
                this.fightNode.active = false;
            }
        }
        else {
            this.inResPoint = null;

            let monster:MapItemMonster = this._moveTargetNode.getComponent(MapItemMonster);
            if(monster){
                // reach monster

                this.data.status = PioneerStatus.IN_RES;
    
                this.normalNode.active = false;
                this.walkNode.active = false;
                this.collectNode.active = false;
                this.fightNode.active = true;
    
                this.progressInfo.init(monster.monsterData.time);
                tween(this.node).delay(monster.monsterData.time).call(()=>{
                    let town:MapItemTown = GameMain.inst.outSceneMap.Towns[this.data.playerID];
                    this.moveTo(town.node.worldPosition, town.node);

                    monster.die();
                }).start();
            }
            else {
                
                this.data.status = PioneerStatus.IN_TOWN;

                this.progressInfo.hide();

                this.normalNode.active = true;
                this.walkNode.active = false;
                this.collectNode.active = false;
                this.fightNode.active = false;
                
                let targetTown = this._moveTargetNode.getComponent(MapItemTown);
                if(targetTown && targetTown.playerID == GameMain.inst.outSceneMap.SelfTown.playerID){
                    // for Debug...
                    GameMain.inst.UI.treasureBoxBtn.enable = true;
                    this.node.active = false;
                }
            }
        }

        this.node.emit(EventName.PIONEER_STATUS_CHNAGE, this);
    }

    backTown() {
        let town:MapItemTown = GameMain.inst.outSceneMap.Towns[this.data.playerID];
        this.moveTo(town.node.worldPosition, town.node);

        if(this.inResPoint){
            this.inResPoint.onPioneerLeave();
        }
    }

    onLoad() {

        // this.walkAni = this.walkNode.getComponent(Animation);
        // this.collectAni = this.collectNode.getComponent(Animation);

        this.normalNode.active = true;
        this.walkNode.active = false;
        this.collectNode.active = false;

        this.footLineNode = instantiate(GameMain.inst.outSceneMap.FootLinePfb);
        this.footLineSprite = this.footLineNode.getComponent(Sprite);
        this.footLineTrans = this.footLineNode.getComponent(UITransform);
        this.footLineNode.parent = GameMain.inst.outSceneMap.LineLayerNode;
        this.footLineNode.layer = GameMain.inst.outSceneMap.LineLayerNode.layer;
        this.footLineNode.active = false;
    }

    start() { 
    
    }

    update(deltaTime: number) {
        
    }
}


