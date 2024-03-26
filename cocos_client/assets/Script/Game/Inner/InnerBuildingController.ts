import { CCString, Component, EventMouse, Node, Prefab, SpriteFrame, UITransform, Vec3, _decorator, instantiate, v3 } from "cc";
import ViewController from "../../BasicView/ViewController";

const { ccclass, property } = _decorator;

@ccclass('InnerBuildingController')
export class InnerBuildingController extends ViewController {

    @property(Prefab)
    private mainCityPrb: Prefab = null;
    
    @property(Prefab)
    private barracksPrb: Prefab = null;
    
    @property(Prefab)
    private housePrb: Prefab = null;

    @property(Prefab)
    private energyStationPrb: Prefab = null;

    private _mainCityPos: Vec3 = v3(240, -285, 0);
    private _barracksPos: Vec3 = v3(1245, 75, 0);
    private _housePos: Vec3 = v3(-859, -263, 0);
    private _energyStationPos: Vec3 = v3(-676, 260, 0);
    protected viewDidLoad(): void {
        super.viewDidLoad();
    }

    protected viewDidStart(): void {
        super.viewDidStart();

    }

    protected viewDidAppear(): void {
        super.viewDidAppear();


    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();

    }

    //-------------------------------------- function

}