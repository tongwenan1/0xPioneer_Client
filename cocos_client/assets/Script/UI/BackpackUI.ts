import { _decorator, Component, Label, Node, Sprite, SpriteFrame, Vec3, Button, EventHandler, v2, Vec2, Prefab, Slider, instantiate } from 'cc';
import ItemData from '../Model/ItemData';
import { BackpackItem } from './BackpackItem';
import ItemMgr from '../Manger/ItemMgr';
import { PopUpUI } from '../BasicView/PopUpUI';
const { ccclass, property } = _decorator;


@ccclass('BackpackUI')
export class BackpackUI extends PopUpUI {

    @property(Prefab)
    BackpackItemPfb: Prefab;

    @property(Slider)
    ContentSlider:Slider;

    @property(Node)
    Content:Node;

    @property(Label)
    QuantityNum:Label;

    @property(Button)
    closeButton:Button;

    @property(Button)
    ArrangeButton:Button;

    private maxItemCount:number = 100;
    private itemCount:number;
    private items:ItemData[] = [];

    private freeItemTile:BackpackItem[] = [];
    
    start() {
        
        this.closeButton.node.on(Button.EventType.CLICK, ()=>{
            this.node.active = false;
        }, this);
        
        this.ArrangeButton.node.on(Button.EventType.CLICK, ()=>{
            this.arrangeItem();
        }, this);

        
        // TO DO : slider event
    }

    initItems(items:ItemData[]) {
        this.items = items;
        this.refreshBackpackUI();
    }

    clearItems() {
        this.items = [];
        this.refreshBackpackUI();
    }

    isPackageFull() {
        return this.itemCount >= this.maxItemCount;
    }

    addItem(itemdata:ItemData) {
        this.items.push(itemdata);

        ItemMgr.Instance.modityItemData(this.items);

        // TO DO : add item tile replace refresh
        this.refreshBackpackUI();
    }

    addItems(itemdatas:ItemData[]) {
        this.items = this.items.concat(itemdatas);

        ItemMgr.Instance.modityItemData(this.items);
        
        // TO DO : add item tile replace refresh
        this.refreshBackpackUI();
    }

    removeItem(itemId:number) {
        let idx = this.items.findIndex((v)=>{
            return v.itemId == itemId;
        });

        if(idx < 0) {
            return;
        }

        this.items.splice(idx, 1);
        
        ItemMgr.Instance.modityItemData(this.items);
            
        // TO DO : remove item tile replace refresh
        this.refreshBackpackUI();
    }

    subItem(itemId:number, count:number):Boolean {
        let idx = this.items.findIndex((v)=>{
            return v.itemId == itemId;
        });

        if(idx < 0) {
            return false;
        }

        if(this.items[idx].count < count) {
            return false;
        }

        this.items[idx].count = this.items[idx].count - count;
        if(this.items[idx].count <= 0) {
            this.items.splice(idx, 1);
        }
        
        ItemMgr.Instance.modityItemData(this.items);
     
        // TO DO : remove item tile replace refresh
        this.refreshBackpackUI();

        return true;
    }

    arrangeItem() {
        let itemMap = {};
        for(let i=this.items.length - 1; i>=0; --i){
            let key = this.items[i].itemConfigId;
            if(key in itemMap){
                itemMap[key].count += this.items[i].count;
                this.items.splice(i, 1);
            }
            else {
                itemMap[key] = this.items[i];
            }
        }

        this.items = [];
        for(let k in itemMap) {
            this.items.push(itemMap[k]);
        }

        ItemMgr.Instance.modityItemData(this.items);

        this.refreshBackpackUI();
        
    }

    refreshBackpackUI() {

        let cAry:BackpackItem[] = [];
        this.Content.children.forEach((node)=>{
            let bi = node.getComponent(BackpackItem);
            if(bi){
                cAry.push(bi);
            }
        });

        for(let i=0; i<cAry.length; ++i) {
            cAry[i].node.parent = null;
            this.freeItemTile.push(cAry[i]);
        }

        this.itemCount = 0;
        for(let i=0; i<this.items.length; ++i){
            let itemTile:BackpackItem;
            if(this.freeItemTile.length >0){
                itemTile = this.freeItemTile.pop();
            }
            else {
                let itemTileNode = instantiate(this.BackpackItemPfb);
                itemTile = itemTileNode.getComponent(BackpackItem);
            }

            itemTile.initItem(this.items[i]);
            itemTile.node.parent = this.Content;

            this.itemCount += this.items[i].count;
        }

        this.QuantityNum.string = ""+this.itemCount+"/"+this.maxItemCount;

        // TO DO : update slider

    }
}