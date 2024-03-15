import {
    _decorator,
    Component,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    Vec3,
    Button,
    EventHandler,
    v2,
    Vec2,
    Prefab,
    Slider,
    instantiate,
    RichText,
    randomRangeInt,
    Color,
} from "cc";
import ArtifactData, {
    ArtifactConfigData,
    ArtifactEffectRankColor,
    ArtifactEffectType,
    ArtifactProp,
    ArtifactPropValueType,
} from "../Model/ArtifactData";
import { GameMain } from "../GameMain";
import UserInfo from "../Manger/UserInfoMgr";
import { PopUpUI } from "../BasicView/PopUpUI";
import ArtifactMgr from "../Manger/ArtifactMgr";
import CountMgr, { CountType } from "../Manger/CountMgr";
import LanMgr from "../Manger/LanMgr";
import { ArtifactItem } from "./ArtifactItem";
import UserInfoMgr from "../Manger/UserInfoMgr";
const { ccclass, property } = _decorator;

@ccclass("ArtifactInfoUI")
export class ArtifactInfoUI extends PopUpUI {
    public async showItem(artifacts: ArtifactData[], closeCallback: () => void = null) {
        this._artifacts = artifacts;
        this._closeCallback = closeCallback;

        for (const view of this._allEffectViews) {
            view.destroy();
        }
        this._allEffectViews = [];

        if (this._artifacts.length > 0) {
            const curArtifact: ArtifactData = this._artifacts.splice(0, 1)[0];
            // show one 
            const config = ArtifactMgr.Instance.getArtifactConf(curArtifact.artifactConfigId);

            let useColor: Color = null;
            if (config.rank == 1) {
                useColor = new Color().fromHEX(ArtifactEffectRankColor.RANK1);
            } else if (config.rank == 2) {
                useColor = new Color().fromHEX(ArtifactEffectRankColor.RANK2);
            } else if (config.rank == 3) {
                useColor = new Color().fromHEX(ArtifactEffectRankColor.RANK3);
            } else if (config.rank == 4) {
                useColor = new Color().fromHEX(ArtifactEffectRankColor.RANK4);
            } else if (config.rank == 5) {
                useColor = new Color().fromHEX(ArtifactEffectRankColor.RANK5);
            }

            if (config != null) {
                const content = this.node.getChildByName("DialogBg");

                // name
                content.getChildByName("Name").getComponent(Label).string = LanMgr.Instance.getLanById(config.name);
                content.getChildByName("Name").getComponent(Label).color = useColor;

                // item
                content.getChildByName("ArtifactItem").getComponent(ArtifactItem).refreshUI(curArtifact);

                // title 
                // useLanMgr
                // content.getChildByName("Title").getComponent(Label).string = LanMgr.Instance.getLanById("107549");
                content.getChildByName("Title").getComponent(Label).color = useColor;

                // effect
                const effectContent = content.getChildByName("EffectContent");
                effectContent
                if (config.effect.length > 0) {
                    const numStrings: string[] = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
                    let effectIndex: number = 0;
                    let isStableShowed: boolean = false;
                    for (let i = 0; i < config.effect.length; i++) {
                        const effectConfig = ArtifactMgr.Instance.getArtifactEffectConf(config.effect[i]);
                        if (effectConfig == null) continue;

                        if (config.rank >= 4 && !isStableShowed) {
                            const stable = instantiate(this._stableEffectItem);
                            stable.active = true;
                            stable.parent = this._stableEffectItem.parent;
                            stable.getChildByName("Title").getComponent(Label).string = LanMgr.Instance.getLanById(effectConfig.des);
                            stable.getChildByName("Title").getComponent(Label).color = useColor;
                            this._allEffectViews.push(stable);
                            isStableShowed = true;

                        } else {
                            effectIndex += 1;
                            if (effectConfig.unlock > UserInfoMgr.Instance.level) {
                                const unlock = instantiate(this._unlockEffectItem);
                                unlock.active = true;
                                unlock.parent = this._unlockEffectItem.parent;
                                unlock.getChildByPath("LockIcon/No").getComponent(Label).string = numStrings[effectIndex];
                                unlock.getChildByPath("Title").getComponent(Label).string = LanMgr.Instance.getLanById(effectConfig.des);
                                // useLanMgr
                                // unlock.getChildByPath("Title/Unlock").getComponent(Label).string = "(" + LanMgr.Instance.getLanById("107549") + "C.LV " + effectConfig.unlock + ")";
                                unlock.getChildByPath("Title/Unlock").getComponent(Label).string = "(" + "Unlocked at" + "C.LV " + effectConfig.unlock + ")";
                                this._allEffectViews.push(unlock);

                            } else {
                                const locked = instantiate(this._lockedEffectItem);
                                locked.active = true;
                                locked.parent = this._lockedEffectItem.parent;
                                locked.getChildByPath("LockIcon/No").getComponent(Label).string = numStrings[effectIndex];
                                locked.getChildByPath("Title").getComponent(Label).string = LanMgr.Instance.getLanById(effectConfig.des);
                                this._allEffectViews.push(locked);
                            }
                        }
                    }
                }

                // desc
                content.getChildByName("DescTxt").getComponent(RichText).string = LanMgr.Instance.getLanById(config.des);
            }
            this.show(true);
        }
    }

    private _artifacts: ArtifactData[] = [];
    private _closeCallback: () => void;

    private _allEffectViews: Node[] = [];
    private _stableEffectItem: Node = null;
    private _lockedEffectItem: Node = null;
    private _unlockEffectItem: Node = null;
    onLoad(): void {
        this._allEffectViews = [];

        this._stableEffectItem = this.node.getChildByPath("DialogBg/EffectContent/StableEffect");
        this._stableEffectItem.active = false;

        this._lockedEffectItem = this.node.getChildByPath("DialogBg/EffectContent/LockedEffect");
        this._lockedEffectItem.active = false;

        this._unlockEffectItem = this.node.getChildByPath("DialogBg/EffectContent/UnLockEffect");
        this._unlockEffectItem.active = false;
    }

    start() {

    }

    //---------------------------------------------------- action
    private onTapClose() {
        if (this._artifacts.length <= 0) {
            this.show(false);
            if (this._closeCallback != null) {
                this._closeCallback();
            }
        } else {
            this.showItem(this._artifacts, this._closeCallback);
        }
    }
}
