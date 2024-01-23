import { _decorator, Component, Node, Vec2, Vec3, CCString, CCInteger, UIOpacity, log, Prefab, instantiate } from 'cc';
import { GameMain } from '../GameMain';
import { MapItem } from './MapItem';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Datas/ConstDefine';
import { InnerBuildInfo } from '../Datas/DataDefine';
import { InnerBuildUI } from '../UI/Inner/InnerBuildUI';
import UserInfo, { UserInnerBuildInfo } from '../v2/DataMgr/user_Info';
const { ccclass, property } = _decorator;

@ccclass('MapItemFactory')
export class MapItemFactory extends MapItem {

    @property(CCString)
    buildID = "1";

    @property(InnerBuildUI)
    private buildInfoUI: InnerBuildUI = null;

    @property([Prefab])
    private buildPfbList: Prefab[] = [];

    @property(Node)
    private buildNode: Node = null;

    buildData: UserInnerBuildInfo = null;

    private _upgradeIng = false;

    onUpgrade(){
        console.log('onUpgradeClick');
        // EventMgr.emit(EventName.BUILD_LEVEL_UP,this.buildID);
        log('onUpgradeClick');
        if(this._upgradeIng){
            return;
        }

        if(!this.buildData || this.buildPfbList.length <= this.buildData.buildLevel){// Insufficient resources for building upgrades
            GameMain.inst.UI.ShowTip("Insufficient resources for building upgrades");
            return;
        }

        this._upgradeIng = true;
        GameMain.inst.innerSceneMap.playBuildAnim(this.node,5, async()=>{
            log('onUpgradeClick callback');
            EventMgr.emit(EventName.BUILD_LEVEL_UP,this.buildID);
            await UserInfo.Instance.upgradeBuild(this.buildID);

            this.refresh();
            this.initBuildNode();
            this._upgradeIng = false;
        });

        this.buildInfoUI.setProgressTime(5);
        
    }

    override _onClick() {
        super._onClick();

        if(this._upgradeIng){
            GameMain.inst.UI.ShowTip("The building is being upgraded, please wait.");
            return;
        }

        console.log("MapItemFactory click buildId:" + this.buildID);

        // if(this.buildData.buildLevel <= 0){ // 
        //     this.onUpgrade();
        //     return;
        // }

        if(GameMain.inst.UI.factoryInfoUI.isShow){
            GameMain.inst.UI.factoryInfoUI.show(false);
        }
        else {
            if(!this.buildData){// unlock
                return;
            }
            else {
                GameMain.inst.UI.factoryInfoUI.refreshUI(this.buildData);
            }

            GameMain.inst.UI.factoryInfoUI.show(true);
        }
    }

    refresh(){
        let opacity = this.node.getComponent(UIOpacity);
        if(!opacity){
            opacity = this.node.addComponent(UIOpacity);
        }
        // if(!this.buildData || this.buildData.buildLevel <= 0){// unlock
        //     // build show translucent
        //      opacity.opacity = 128;
        //  }
        //  else{
        //     opacity.opacity = 255;
        //  }

        this.buildInfoUI?.refreshUI(this.buildData);


    }

    initBuildNode(){
        if(this.buildData){
            if(!this.buildPfbList || this.buildData.buildLevel <= 1 ||this.buildPfbList.length < this.buildData.buildLevel){
                return;
            }
            this.buildInfoUI?.refreshUI(this.buildData);
            this.buildNode?.destroy();
            this.buildNode = instantiate(this.buildPfbList[this.buildData.buildLevel - 1]);
            this.buildNode.setParent(this.node);
            this.buildNode.setPosition(new Vec3(0,0,0));
        }
    }

    async start() {
        super.start();
        const innerBuildData = await UserInfo.Instance.getInnerBuilds();
        this.buildData = innerBuildData.get(this.buildID);
        this.refresh();
        this.initBuildNode();

        EventMgr.on(EventName.BUILD_LEVEL_UP,this.onLevelUP,this);
    }

    protected onEnable(): void {

    }

    onLevelUP(buildId){
        if(buildId != this.buildID){
            return;
        }

        this.onUpgrade();
    }

    update(deltaTime: number) {
        
    }
}


