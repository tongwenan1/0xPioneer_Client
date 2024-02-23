import { _decorator, Component, Sprite, SpriteFrame, Node } from 'cc';
import * as cc from "cc";
import ItemData, { ItemConfigData } from '../Model/ItemData';
import { GameMain } from '../GameMain';
import ItemMgr from '../Manger/ItemMgr';
const { ccclass, property } = _decorator;

@ccclass('BackpackItem')
export class BackpackItem extends Component {

    private static __itemIconSpriteFrames = {};
    static async getItemIcon(ItemConfigId:number):Promise<SpriteFrame> {
        if(ItemConfigId in BackpackItem.__itemIconSpriteFrames) {
            return BackpackItem.__itemIconSpriteFrames[ItemConfigId];
        }

        const frame = await new Promise((resolve) => {
            cc.resources.load("ui/icon/item_"+ItemConfigId+"/spriteFrame", SpriteFrame, (err: Error, icon) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(icon);
            });
        });
        if (frame != null) {

            BackpackItem.__itemIconSpriteFrames[ItemConfigId] = frame;
        }

        return BackpackItem.__itemIconSpriteFrames[ItemConfigId];
    }
    
    @property(Sprite)
    BgSprite: Sprite;
    
    @property(Sprite)
    IconSprite: Sprite;
    
    @property(cc.Label)
    CountLabel: cc.Label;

    @property([SpriteFrame])
    BgSpriteFrames: SpriteFrame[] = [];

    protected _itemData:ItemData;
    protected _itemConf:ItemConfigData;
    
    start() {
       
    }

    public async initItem(itemdata:ItemData) {
        this._itemData = itemdata;

        let frame = await BackpackItem.getItemIcon(this._itemData.itemConfigId);
        this.IconSprite.spriteFrame = frame;

        this._itemConf = ItemMgr.Instance.getItemConf(this._itemData.itemConfigId);
        
        this.BgSprite.spriteFrame = this.BgSpriteFrames[this._itemConf.grade - 1];

        this.CountLabel.string = itemdata.count.toString();
    }

    private onTapItem() {
        GameMain.inst.UI.itemInfoUI.showItem([{ itemConfig: this._itemConf, count: this._itemData.count }]);
    }
}