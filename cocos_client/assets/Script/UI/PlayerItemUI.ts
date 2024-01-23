import { _decorator, Component, Label, log, Node, Sprite, SpriteFrame, Button, convertUtils } from 'cc';
import { PioneerData } from '../Datas/DataDefine';
import { PioneerStatus } from '../Datas/ConstDefine';
import { GameMain } from '../GameMain';
import { MapPioneer } from '../Scene/MapPioneer';
const { ccclass, property } = _decorator;

@ccclass('PlayerItemUI')
export class PlayerItemUI extends Component {
    @property([SpriteFrame])
    statusSprArr: SpriteFrame[] = [];

    @property([SpriteFrame])
    oprSprArr: SpriteFrame[] = [];

    @property(Sprite)
    sprStatus: Sprite = null;

    @property(Sprite)
    sprOprPlayer: Sprite = null;

    @property(Sprite)
    sprPlayerIcon: Sprite = null;

    @property(Label)
    txtPlayerName: Label = null;

    pioneer:MapPioneer;

    private _data: PioneerData = null;

    refresh(data: PioneerData) {
        this._data = data;
        // log("PlayerItemUI refresh ", data);
        // this.sprPlayerIcon.spriteFrame = null;
        this.txtPlayerName.string = data.name;
        if(data.status == PioneerStatus.IN_RES){
            this.sprStatus.spriteFrame = this.statusSprArr[0];
            this.sprOprPlayer.spriteFrame = this.oprSprArr[1];
        }
        else if(data.status == PioneerStatus.IN_TOWN){
            this.sprStatus.spriteFrame = this.statusSprArr[1]; 
            this.sprOprPlayer.spriteFrame = this.oprSprArr[0];
        }
        else if(data.status == PioneerStatus.MOVING){
            this.sprStatus.spriteFrame = this.statusSprArr[2];
            this.sprOprPlayer.spriteFrame = this.oprSprArr[1];
        }

        this.sprOprPlayer.spriteFrame = this.oprSprArr[data.status == PioneerStatus.IN_TOWN ? 0:1];

    }

    start() {
        this.node.on(Button.EventType.CLICK, this.onPlayerClick, this);
    }

    onPlayerClick() {
        log('onPlayerClick -----------> ' ,this._data.id);

        let p = GameMain.inst.outSceneMap.SelfTown.getPioneer(this._data.id);
        GameMain.inst.MainCamera.node.worldPosition = p.node.worldPosition;
    }

    onOprClick() {
        if(this._data.status == PioneerStatus.IN_RES){
            this.pioneer.backTown();
        }
    }
}


