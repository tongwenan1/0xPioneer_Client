import { _decorator, Component, Node, Button, SpriteFrame, Sprite, Label, Prefab, instantiate, tiledLayerAssembler, Tween, v3, tween } from 'cc';
import { OutMapItemTownData } from '../Datas/DataDefine';
import { GameMain } from '../GameMain';
import { BaseUI } from './BaseUI';
import { MonsterInfoUI } from './MonsterInfoUI';
import { PopUpUI } from './TemplateUI/PopUpUI';
import { TownInfoUI } from './TownInfoUI';
import EventMgr from '../Manger/EventMgr';
import { EventName } from '../Datas/ConstDefine';
import { MapItemMainBuild } from '../Scene/MapItemMainBuild';
import { FactoryInfoUI } from './Inner/FactoryInfoUI';
import { MainBuildUI } from './Inner/MainBuildUI';
import { ResOprUI } from './OutSide/ResOprUI';
import { ResInfoUI } from './OutSide/ResInfoUI';
import { TreasureBoxBtn } from './TreasureBoxBtn';
import { ArtifactInfoUI } from './OutSide/ArtifactInfoUI';
import { BoxOpenUI } from './OutSide/BoxOpenUI';
import { PioneerInfoUI } from './OutSide/PioneerInfoUI';
import { TownOprUI } from './OutSide/TownOprUI';

const { ccclass, property } = _decorator;

@ccclass('MainUI')
export class MainUI extends BaseUI {

    @property(Node)
    UIRoot:Node;

    @property(Prefab)
    TownInfoUIPrefab:Prefab;
    
    @property(Prefab)
    MonsterInfoUIPrefab:Prefab;

    @property(Prefab)
    mainBuildUIPfb:Prefab;

    @property(Prefab)
    factoryInfoUIPfb:Prefab;
    
    @property(Prefab)
    ResOprPfb:Prefab;

    @property(Prefab)
    ResInfoPfb:Prefab;

    @property(Prefab)
    PioneerInfoUIPfb:Prefab;
    
    @property(Prefab)
    TownOprPfb:Prefab;
    
    @property(Node)
    TreasureBoxInfoUINode:Node;
    
    @property(Node)
    TreasuerBoxOpenUINode:Node;

    @property(Node)
    LoadingUINode:Node;

    public townInfoUI:TownInfoUI;
    public monsterInfoUI:MonsterInfoUI;
    public mainBuildUI:MainBuildUI;
    public factoryInfoUI: FactoryInfoUI;
    public resOprUI:ResOprUI;
    public townOprUI:TownOprUI;
    
    public resInfoUI:ResInfoUI;

    public treasureBoxBtn:TreasureBoxBtn;
    public treasureBoxInfoUI:ArtifactInfoUI;

    public boxOpenUI:BoxOpenUI;

    public pioneerInfoUI:PioneerInfoUI;
    

    @property(Node)
    public leftUI:Node = null;

    @property(Node)
    public btnBuild:Node = null;

    // TO DO : add uis
    
    start() {
        let townInfoUINode = instantiate(this.TownInfoUIPrefab);
        townInfoUINode.setParent(this.UIRoot);
        
        let monsterInfoUINode = instantiate(this.MonsterInfoUIPrefab);
        monsterInfoUINode.setParent(this.UIRoot);

        let mainBuildUINode = instantiate(this.mainBuildUIPfb);
        mainBuildUINode.setParent(this.UIRoot);

        let factoryInfoUINode = instantiate(this.factoryInfoUIPfb);
        factoryInfoUINode.setParent(this.UIRoot);
        
        let resOprUINode = instantiate(this.ResOprPfb);
        resOprUINode.setParent(this.UIRoot);

        let resInfoUINode = instantiate(this.ResInfoPfb);
        resInfoUINode.setParent(this.UIRoot);

        let pioneerInfoUINode = instantiate(this.PioneerInfoUIPfb);
        pioneerInfoUINode.setParent(this.UIRoot);
        
        let townOprUINode = instantiate(this.TownOprPfb);
        townOprUINode.setParent(this.UIRoot);

        this.townInfoUI = townInfoUINode.getComponent(TownInfoUI);
        this.monsterInfoUI = monsterInfoUINode.getComponent(MonsterInfoUI);
        this.mainBuildUI = mainBuildUINode.getComponent(MainBuildUI);
        this.factoryInfoUI = factoryInfoUINode.getComponent(FactoryInfoUI);
        this.resOprUI = resOprUINode.getComponent(ResOprUI);
        this.resInfoUI = resInfoUINode.getComponent(ResInfoUI);
        this.treasureBoxInfoUI = this.TreasureBoxInfoUINode.getComponent(ArtifactInfoUI);
        this.boxOpenUI = this.TreasuerBoxOpenUINode.getComponent(BoxOpenUI);
        this.pioneerInfoUI = pioneerInfoUINode.getComponent(PioneerInfoUI);
        this.townOprUI = townOprUINode.getComponent(TownOprUI);

        this.LoadingUINode.active = true;
        tween(this.LoadingUINode)
            .delay(3)
            .to(0,{active:false})
            .start();

        EventMgr.on(EventName.SCENE_CHANGE, this.onSceneChange,this);
    }

    onSceneChange() {

        PopUpUI.hideAllShowingPopUpUI();
        this.LoadingUINode.active = true;

        let thisptr = this;
        tween(this.LoadingUINode)
            .delay(1.5)
            .to(0,{active:false})
            .call(()=>{

                if(GameMain.inst.isInnerScene()) {
                    thisptr.leftUI.active = false;
                    //thisptr.btnBuild.active = true;
                    this.btnBuild.active = false; // for Debug ...
                }
                else {
                    thisptr.leftUI.active = true;
                    thisptr.btnBuild.active = false;
                }
            })
            .start();


        // if(GameMain.inst.isInnerScene()) {
        //     this.leftUI.active = false;
        //     //this.btnBuild.active = true;
        //     this.btnBuild.active = false; // for Debug ...
        // }
        // else {
        //     this.leftUI.active = true;
        //     this.btnBuild.active = false;
        // }
        
    }

    onBuliClick() {
        
    }

    public ShowTip(str: string){
        let node = new Node();
        node.setParent(this.UIRoot);
        let label = node.addComponent(Label);
        label.string = str;
        label.fontSize = 30;

        let action = new Tween(node);
        action.to(0.2,{position:v3(0,100,0)});
        action.delay(0.5);
        action.call(()=>{
            node.destroy();
        });
        action.start();

    }


    update(deltaTime: number) {

    }
}


