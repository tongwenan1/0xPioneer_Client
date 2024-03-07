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
const { ccclass, property } = _decorator;

export interface ArtifactInfoShowModel {
    artifactConfig: ArtifactConfigData;
    count: number;
}

@ccclass("ArtifactInfoUI")
export class ArtifactInfoUI extends PopUpUI {
    public async showItem(artifacts: ArtifactInfoShowModel[], isGet: Boolean = false, closeCallback: () => void = null) {
        this._artifacts = artifacts;
        this._closeCallback = closeCallback;
        if (this._artifacts.length > 0) {
            let frame = await ArtifactItem.getItemIcon(this._artifacts[0].artifactConfig.icon);
            this.icon.spriteFrame = frame;

            // ------ name & desc
            // useLanMgr
            this.nameLabel.string = LanMgr.Instance.getLanById(this._artifacts[0].artifactConfig.name);
            this.descTxt.string = LanMgr.Instance.getLanById(this._artifacts[0].artifactConfig.des);
            // this.nameLabel.string = this._artifacts[0].artifactConfig.name == null ? "" : this._artifacts[0].artifactConfig.name;
            // this.descTxt.string = this._artifacts[0].artifactConfig.des == null ? "" : this._artifacts[0].artifactConfig.des;

            const artifactConfig = this._artifacts[0].artifactConfig;

            // ------ prop
            for (let i = 0; i < artifactConfig.prop.length; i++) {
                const propId = artifactConfig.prop[i];
                const prop_value = artifactConfig.prop_value[i];

                let propName = "";
                let propValueType = "";
                let propValue = "";

                if (propId == ArtifactProp.HP) {
                    // useLanMgr
                    // propName += LanMgr.Instance.getLanById("107549");
                    propName += "HP";
                } else if (propId == ArtifactProp.ATTACK) {
                    // useLanMgr
                    // propName += LanMgr.Instance.getLanById("107549");
                    propName += "ATK";
                }

                if (prop_value[0] == ArtifactPropValueType.ADD) {
                    if (prop_value[1] > 0) {
                        propValueType = "+";
                    } else {
                        propValueType = "-";
                    }
                    propValue = prop_value[1].toString();
                } else if (prop_value[0] == ArtifactPropValueType.MUL) {
                    if (prop_value[1] > 1) {
                        propValueType = "+";
                        propValue = Math.floor(prop_value[1] * 100 - 100) + "%";
                    } else {
                        propValueType = "-";
                        propValue = Math.floor(100 - prop_value[1] * 100) + "%";
                    }
                }

                let proptxt = propName + " " + propValueType + propValue;

                if (i == 0) {
                    this.propTxt1.string = proptxt;
                } else if (i == 1) {
                    this.propTxt2.string = proptxt;
                }
            }

            // effectTxt & effectDes
            if (artifactConfig.effect.length > 0) {
                for (let i = 0; i < artifactConfig.effect.length; i++) {
                    const effectId = artifactConfig.effect[i];
                    const effectConfig = ArtifactMgr.Instance.getArtifactEffectConf(effectId);
                    if (effectConfig == null) continue;

                    let effectTxt: Label;
                    let effectDes: Label;
                    if (i == 0) {
                        effectTxt = this.effectTxt1;
                        effectDes = this.effectDes1;
                    } else if (i == 1) {
                        effectTxt = this.effectTxt2;
                        effectDes = this.effectDes2;
                    }
                    if (effectTxt) {
                        // --- effectTxt
                        // useLanMgr
                        effectTxt.string = LanMgr.Instance.getLanById(effectConfig.name);
                        // effectLable.string = effectConfig.name;

                        // --- effectDes
                        // useLanMgr
                        let pct = effectConfig.para[0] * 100 + "%";
                        let desc = LanMgr.Instance.getLanById(effectConfig.des);
                        effectDes.string = desc.replace("%p", pct);

                        // ---effecttxt color
                        switch (effectConfig.rank) {
                            case 1:
                                effectTxt.color = new Color().fromHEX(ArtifactEffectRankColor.RANK1);
                                break;
                            case 2:
                                effectTxt.color = new Color().fromHEX(ArtifactEffectRankColor.RANK2);
                                break;
                            case 3:
                                effectTxt.color = new Color().fromHEX(ArtifactEffectRankColor.RANK3);
                                break;
                            case 4:
                                effectTxt.color = new Color().fromHEX(ArtifactEffectRankColor.RANK4);
                                break;
                            case 5:
                                effectTxt.color = new Color().fromHEX(ArtifactEffectRankColor.RANK5);
                                break;
                        }
                    }
                }
            }

            this.useButton.node.active = false;
            if (this._isGet) {
                this.useButton.node.active = true;

                // useLanMgr
                // this.useButtonLabel.string = LanMgr.Instance.getLanById("107549");
                this.useButtonLabel.string = "Get";
            } else {
                // TODO: use?

                // useLanMgr
                // this.useButtonLabel.string = LanMgr.Instance.getLanById("107549");
                this.useButtonLabel.string = "Get";
            }
            this.show(true);
        }
    }

    @property(Sprite)
    icon: Sprite;

    @property(Label)
    nameLabel: Label;

    @property(Label)
    propTxt1: Label;

    @property(Label)
    propTxt2: Label;

    @property(Label)
    effectTxt1: Label;

    @property(Label)
    effectDes1: Label;

    @property(Label)
    effectTxt2: Label;

    @property(Label)
    effectDes2: Label;

    @property(RichText)
    descTxt: RichText;

    @property(Button)
    closeButton: Button;

    @property(Button)
    useButton: Button;

    @property(Label)
    useButtonLabel: Label;

    private _closeCallback: () => void;

    private _isGet: Boolean;
    private _artifacts: ArtifactInfoShowModel[];

    start() {
        this.closeButton.node.on(
            Button.EventType.CLICK,
            () => {
                this._onTapClose();
            },
            this
        );

        this.useButton.node.on(
            Button.EventType.CLICK,
            () => {
                this._clickUseBtn();
            },
            this
        );
    }

    //---------------------------------------------------- action
    private _onTapClose() {
        this.show(false);
        if (this._closeCallback != null) {
            this._closeCallback();
        }
    }

    private _clickUseBtn() {
        if (this._isGet) {
        } else {
            // TODO: use?
            for (const temple of this._artifacts) {
                ArtifactMgr.Instance.subArtifact(temple.artifactConfig.configId, 1);
                CountMgr.instance.addNewCount({
                    type: CountType.useItem,
                    timeStamp: new Date().getTime(),
                    data: {
                        itemId: temple.artifactConfig.configId,
                        num: 1,
                    },
                });
            }
        }
        this.show(false);
        if (this._closeCallback != null) {
            this._closeCallback();
        }
    }
}
