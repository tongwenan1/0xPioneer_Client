import { _decorator, Component, Sprite, SpriteFrame, Node } from 'cc';
import * as cc from "cc";
import ItemData, { ItemConfigData } from '../Model/ItemData';
import { GameMain } from '../GameMain';
import ItemMgr from '../Manger/ItemMgr';
const { ccclass, property } = _decorator;

@ccclass('BackpackItem')
export class BackpackItem extends Component {

    private static __itemIconSpriteFrames = {};
    static async getItemIcon(iconName: string):Promise<SpriteFrame> {
        if(iconName in BackpackItem.__itemIconSpriteFrames) {
            return BackpackItem.__itemIconSpriteFrames[iconName];
        }

        const frame = await new Promise((resolve) => {
            cc.resources.load("ui/icon/" + iconName +"/spriteFrame", SpriteFrame, (err: Error, icon) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(icon);
            });
        });
        if (frame != null) {

            BackpackItem.__itemIconSpriteFrames[iconName] = frame;
        }

        return BackpackItem.__itemIconSpriteFrames[iconName];
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
        this._itemConf = ItemMgr.Instance.getItemConf(this._itemData.itemConfigId);

        let frame = await BackpackItem.getItemIcon(this._itemConf.icon);
        if (this.isValid) { // node valid state may change during async operation
            this.IconSprite.spriteFrame = frame;


            this.BgSprite.spriteFrame = this.BgSpriteFrames[this._itemConf.grade - 1];

            this.CountLabel.string = itemdata.count.toString();
        }
    }

    private onTapItem() {
        GameMain.inst.UI.itemInfoUI.showItem([{ itemConfig: this._itemConf, count: this._itemData.count }]);
    }
}