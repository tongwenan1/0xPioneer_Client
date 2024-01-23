import { _decorator, Component, Label, log, Node, Sprite, SpriteFrame, Button, convertUtils } from 'cc';
import { EventName, PioneerStatus } from '../../Datas/ConstDefine';
import { PioneerData } from '../../Datas/DataDefine';
import { GameMain } from '../../GameMain';
import { MapPioneer } from '../../Scene/MapPioneer';
const { ccclass, property } = _decorator;

@ccclass('PioneerIconUI')
export class PioneerIconUI extends Component {
    @property([SpriteFrame])
    statusSprArr: SpriteFrame[] = [];

    @property(Sprite)
    sprStatus: Sprite = null;

    @property
    pioneerID:string = "1";

    refresh(data: PioneerData) {
        log("PioneerIconUI refresh ", data);

        if(data.status == PioneerStatus.IN_RES){
            this.sprStatus.spriteFrame = this.statusSprArr[0];
        }
        else if(data.status == PioneerStatus.IN_TOWN){
            this.sprStatus.spriteFrame = this.statusSprArr[1]; 
        }
        else if(data.status == PioneerStatus.MOVING){
            this.sprStatus.spriteFrame = this.statusSprArr[2];
        }

    }

    start() {
        let pion = GameMain.inst.outSceneMap.SelfTown.getPioneer(this.pioneerID);
        if(pion){
            this.refresh(pion.data);
            
            pion.node.on(EventName.PIONEER_STATUS_CHNAGE, (p:MapPioneer)=>{
                this.refresh(p.data);
            }, this);
        }
    }

}


