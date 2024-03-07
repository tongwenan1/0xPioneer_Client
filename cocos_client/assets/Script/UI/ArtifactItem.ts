import { _decorator, Component, Sprite, SpriteFrame, Node } from "cc";
import * as cc from "cc";
import { GameMain } from "../GameMain";
import ArtifactMgr from "../Manger/ArtifactMgr";
import ArtifactData, { ArtifactConfigData } from "../Model/ArtifactData";
const { ccclass, property } = _decorator;

@ccclass("ArtifactItem")
export class ArtifactItem extends Component {
    private static __itemIconSpriteFrames = {};
    static async getItemIcon(iconName: string): Promise<SpriteFrame> {
        if (iconName in ArtifactItem.__itemIconSpriteFrames) {
            return ArtifactItem.__itemIconSpriteFrames[iconName];
        }

        const frame = await new Promise((resolve) => {
            cc.resources.load("ui/icon/artifact/" + iconName + "/spriteFrame", SpriteFrame, (err: Error, icon) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(icon);
            });
        });
        if (frame != null) {
            ArtifactItem.__itemIconSpriteFrames[iconName] = frame;
        }

        return ArtifactItem.__itemIconSpriteFrames[iconName];
    }

    @property(Sprite)
    BgSprite: Sprite;

    @property(Sprite)
    IconSprite: Sprite;

    @property(cc.Label)
    CountLabel: cc.Label;

    @property([SpriteFrame])
    BgSpriteFrames: SpriteFrame[] = [];

    protected _artifactData: ArtifactData;
    protected _artifactConf: ArtifactConfigData;

    start() {}

    public async initArtifact(artifactdata: ArtifactData) {
        this._artifactData = artifactdata;
        this._artifactConf = ArtifactMgr.Instance.getArtifactConf(this._artifactData.artifactConfigId);

        let frame = await ArtifactItem.getItemIcon(this._artifactConf.icon);
        this.IconSprite.spriteFrame = frame;

        this.BgSprite.spriteFrame = this.BgSpriteFrames[this._artifactConf.rank - 1];

        this.CountLabel.string = artifactdata.count.toString();
    }

    private onTapItem() {
        GameMain.inst.UI.artifactInfoUI.showItem([{ artifactConfig: this._artifactConf, count: this._artifactData.count }]);
    }
}
