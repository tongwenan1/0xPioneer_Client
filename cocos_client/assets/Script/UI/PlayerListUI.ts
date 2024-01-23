import { _decorator, Component, instantiate, Node } from 'cc';
import { EventName } from '../Datas/ConstDefine';
import { GameMain } from '../GameMain';
import { MapPioneer } from '../Scene/MapPioneer';
import { PlayerItemUI } from './PlayerItemUI';
const { ccclass, property } = _decorator;

@ccclass('PlayerListUI')
export class PlayerListUI extends Component {
    @property(Node)
    playerLayout: Node = null;

    start() {
        this.refreshPlayerList();
    }

    refreshPlayerList(){
        let pioneer_data = Array.from(GameMain.localDatas.outMapData.pioneers.values());

        for(let i = 0; i < pioneer_data.length;i++){
            if(pioneer_data[i].playerID != GameMain.inst.outSceneMap.SelfTown.playerID){
                continue;
            }
            let item = this.playerLayout.children[i];
            if(!item){
                item = instantiate(this.playerLayout.children[0])
                this.playerLayout.addChild(item);
            }
            let pitem = item.getComponent(PlayerItemUI);
            pitem.pioneer = GameMain.inst.outSceneMap.SelfTown.getPioneer(pioneer_data[i].id);
            pitem.pioneer.node.on(EventName.PIONEER_STATUS_CHNAGE, (p:MapPioneer)=>{
                pitem.refresh(p.data);
            }, this);
            pitem.refresh(pioneer_data[i]);
        }

        for(let i = pioneer_data.length; i < this.playerLayout.children.length;i++){
            this.playerLayout.children[i].active = false;
        }
    }

    update(deltaTime: number) {
        
    }

    clsoelick(){

    }
}


