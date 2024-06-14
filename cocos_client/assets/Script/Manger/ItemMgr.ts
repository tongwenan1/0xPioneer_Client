import { SpriteFrame, resources, sys } from "cc";
import { ResourcesMgr } from "../Utils/Global";
import { BundleName } from "../Basic/ResourcesMgr";

export default class ItemMgr {
    private _itemIconSpriteFrames = {};

    public async getItemIcon(iconName: string): Promise<SpriteFrame> {
        if (iconName in this._itemIconSpriteFrames) {
            return this._itemIconSpriteFrames[iconName];
        }
        const frame = await ResourcesMgr.loadResource(BundleName.MainBundle, "icon/item/" + iconName + "/spriteFrame", SpriteFrame);
        if (frame != null) {
            this._itemIconSpriteFrames[iconName] = frame;
        }
        return this._itemIconSpriteFrames[iconName];
    }

    public async getNFTIcon(skin: string): Promise<SpriteFrame> {
        const localSaveKey: string = "temp_nft_skin_" + skin;
        if (localSaveKey in this._itemIconSpriteFrames) {
            return this._itemIconSpriteFrames[localSaveKey];
        }
        const frame = await ResourcesMgr.loadResource(BundleName.MainBundle, "icon/out_pioneer/" + skin + "/spriteFrame", SpriteFrame);
        if (frame != null) {
            this._itemIconSpriteFrames[localSaveKey] = frame;
        }
        return this._itemIconSpriteFrames[localSaveKey];
    }
}
