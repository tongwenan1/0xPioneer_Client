import { SpriteFrame, sys } from "cc";
import { ResourcesMgr } from "../Utils/Global";
import { BundleName } from "../Basic/ResourcesMgr";

export default class ArtifactMgr {
    private _itemIconSpriteFrames = {};

    public constructor() {}

    public async getItemIcon(iconName: string): Promise<SpriteFrame> {
        if (iconName in this._itemIconSpriteFrames) {
            return this._itemIconSpriteFrames[iconName];
        }
        const frame = await ResourcesMgr.loadResource(BundleName.MainBundle, "icon/artifact/" + iconName + "/spriteFrame", SpriteFrame);
        if (frame != null) {
            this._itemIconSpriteFrames[iconName] = frame;
        }
        return this._itemIconSpriteFrames[iconName];
    }
}
