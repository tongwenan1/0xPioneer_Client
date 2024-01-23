import { _decorator, Component, Node, Vec2, Vec3, CCInteger, CCFloat, TweenAction, tween, Graphics, Color, Prefab, instantiate } from 'cc';
import { PioneerStatus } from '../Datas/ConstDefine';
import { GameMain } from '../GameMain';
import { GameMap } from './Map';
import { MapItemTown } from './MapItemTown';
import { MapPioneer } from './MapPioneer';
const { ccclass, property } = _decorator;

@ccclass('MapOutScene')
export class MapOutScene extends GameMap {

    @property(Prefab)
    PioneerPfb:Prefab;
    
    @property(Prefab)
    PioneerOtherPfb:Prefab;
    
    @property(Prefab)
    FootLinePfb:Prefab;
    
    @property(Node)
    LineLayerNode:Node;

    @property(Node)
    DynamicLayerNode:Node;

    public SelfTown:MapItemTown;
    public Towns:Map<string, MapItemTown> = new Map<string, MapItemTown>();

    start() { 
    }

    update(deltaTime: number) {
        
    }
}


