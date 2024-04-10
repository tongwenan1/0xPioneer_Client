import { SpriteFrame, sys } from "cc";
import { PioneerMgr, ResourcesMgr } from "../Utils/Global";
import ArtifactData from "../Model/ArtifactData";
import ArtifactConfig from "../Config/ArtifactConfig";
import ArtifactEffectConfig from "../Config/ArtifactEffectConfig";
import NotificationMgr from "../Basic/NotificationMgr";
import { ArtifactArrangeType, ArtifactEffectType } from "../Const/Artifact";
import CLog from "../Utils/CLog";
import { NotificationName } from "../Const/Notification";
import { AttrChangeType, AttrType } from "../Const/ConstDefine";
import Config from "../Const/Config";

export default class ArtifactMgr {

    public saveLocalData() {
        this._saveLocalData();
    }

    private _maxArtifactLength: number = 100;
    private _localStorageKey: string = "artifact_data";
    private _localArtifactDatas: ArtifactData[] = [];

    private _itemIconSpriteFrames = {};

    public get artifactIsFull(): boolean {
        return this._localArtifactDatas.length >= this._maxArtifactLength;
    }
    public get maxItemLength(): number {
        return this._maxArtifactLength;
    }
    public get localArtifactDatas(): ArtifactData[] {
        return this._localArtifactDatas;
    }

    public constructor() { }

    public async getItemIcon(iconName: string): Promise<SpriteFrame> {
        if (iconName in this._itemIconSpriteFrames) {
            return this._itemIconSpriteFrames[iconName];
        }
        const frame = await ResourcesMgr.LoadABResource("icon/artifact/" + iconName + "/spriteFrame", SpriteFrame);
        if (frame != null) {
            this._itemIconSpriteFrames[iconName] = frame;
        }
        return this._itemIconSpriteFrames[iconName];
    }

    public async initData(): Promise<boolean> {
        // load local artifact data
        const jsonStr = sys.localStorage.getItem(this._localStorageKey);
        if (jsonStr) {
            try {
                this._localArtifactDatas = JSON.parse(jsonStr);
                return true;
            } catch (e) {
                CLog.error("ArtifactMgr initData error", e);
                return false;
            }
        }
        return true;
    }

    public getOwnArtifactCount(artifactConfigId: string): number {
        let count: number = 0;
        for (const artifact of this._localArtifactDatas) {
            if (artifact.artifactConfigId == artifactConfigId) {
                count += artifact.count;
            }
        }
        return count;
    }

    public getEffectiveEffect(artifactStoreLevel: number): Map<ArtifactEffectType, number> {
        const effectMap: Map<ArtifactEffectType, number> = new Map();
        for (const artifact of this._localArtifactDatas) {
            if (artifact.effectIndex < 0) {
                continue;
            }
            const artifactConfig = ArtifactConfig.getById(artifact.artifactConfigId);
            if (artifactConfig.effect != null) {
                for (let j = 0; j < artifactConfig.effect.length; j++) {
                    const effectId = artifactConfig.effect[j];
                    const effConfig = ArtifactEffectConfig.getById(effectId);
                    let effectType = effConfig.type;
                    if (effectType == ArtifactEffectType.VISION_RANGE) {
                        if (effConfig.para[0] == 0) {
                            effectType = ArtifactEffectType.CITY_ONLY_VISION_RANGE;
                        } else if (effConfig.para[0] == 1) {
                            effectType = ArtifactEffectType.PIONEER_ONLY_VISION_RANGE;
                        } else if (effConfig.para[0] == 2) {
                            effectType = ArtifactEffectType.CITY_AND_PIONEER_VISION_RANGE;
                        }
                    }
                    if (effConfig.unlock && effConfig.unlock > artifactStoreLevel) {
                        continue;
                    }
                    if (!effectMap.has(effectType)) {
                        effectMap.set(effectType, 0);
                    }
                    let lastNum: number = effectMap.get(effectType);
                    if (effectType == ArtifactEffectType.VISION_RANGE ||
                        effectType == ArtifactEffectType.PIONEER_ONLY_VISION_RANGE ||
                        effectType == ArtifactEffectType.CITY_AND_PIONEER_VISION_RANGE) {
                        lastNum += effConfig.para[1];
                    } else {
                        lastNum += effConfig.para[0];
                    }
                    effectMap.set(effectType, lastNum);
                }
            }
        }
        return effectMap;
    }

    // public getPropEffValue(buildingLv: number) {
    //     const r = {
    //         prop: {}, // propType => { add: 0, mul: 0}
    //         eff: {}, // effectType => 0
    //     };
    //     for (let i = 0; i < this._localArtifactDatas.length; i++) {
    //         const artifact = this._localArtifactDatas[i];
    //         if (artifact.effectIndex < 0) {
    //             continue;
    //         }
    //         const artifactConfig = ArtifactConfig.getById(artifact.artifactConfigId);
    //         // prop
    //         if (artifactConfig.prop.length > 0) {
    //             for (let j = 0; j < artifactConfig.prop.length; j++) {
    //                 const propType = artifactConfig.prop[j];
    //                 const propValue = artifactConfig.prop_value[j];

    //                 if (!r.prop[propType]) r.prop[propType] = { add: 0, mul: 0 };

    //                 if (propValue[0] == AttrChangeType.ADD) {
    //                     r.prop[propType].add += propValue[0] * artifact.count;
    //                 } else if (propValue[0] == AttrChangeType.MUL) {
    //                     r.prop[propType].mul += propValue[0] * artifact.count;
    //                 }
    //             }
    //         }

    //         // effect
    //         if (artifactConfig.effect.length > 0) {
    //             for (let j = 0; j < artifactConfig.effect.length; j++) {
    //                 const effectId = artifactConfig.effect[j];
    //                 const effConfig = ArtifactEffectConfig.getById(effectId);
    //                 const effectType = effConfig.type;

    //                 if (effConfig.unlock && effConfig.unlock > cLv) {
    //                     continue;
    //                 }

    //                 if (!r.eff[effectType]) r.eff[effectType] = 0;
    //                 r.eff[effectType] += effConfig.para[0] * artifact.count;
    //             }
    //         }
    //     }

    //     return r;
    // }

    public addArtifact(artifacts: ArtifactData[]): void {
        if (artifacts.length <= 0) {
            return;
        }
        let changed: boolean = false;
        for (const artifact of artifacts) {
            const artifactConfig = ArtifactConfig.getById(artifact.artifactConfigId);
            if (artifactConfig == null) continue;
            if (this.artifactIsFull) continue;

            changed = true;

            artifact.addTimeStamp = new Date().getTime();
            this._localArtifactDatas.push(artifact);

            if (artifactConfig.effect != null) {
                for (const temple of artifactConfig.effect) {
                    const effectData = ArtifactEffectConfig.getById(temple);
                }
            }
            if (artifactConfig.prop != null) {
                for (let j = 0; j < artifactConfig.prop.length; j++) {
                    const propType = artifactConfig.prop[j];
                    const propValue = artifactConfig.prop_value[j];
                    if (propType == AttrType.HP) {
                        PioneerMgr.pioneerChangeAllPlayerHpMax({
                            type: propValue[0],
                            value: propValue[1] * artifact.count,
                        });
                    } else if (propType == AttrType.ATTACK) {
                        PioneerMgr.pioneerChangeAllPlayerAttack({
                            type: propValue[0],
                            value: propValue[1] * artifact.count,
                        });
                    }
                }
            }
        }
        this.arrange(ArtifactArrangeType.Rarity);
        if (changed) {
            this._saveLocalData();
            NotificationMgr.triggerEvent(NotificationName.ARTIFACT_CHANGE);
        }
    }

    public subArtifact(artifactConfigId: string, count: number): boolean {
        let idx = this._localArtifactDatas.findIndex((v) => {
            return v.artifactConfigId == artifactConfigId;
        });

        if (idx < 0) {
            return false;
        }

        if (this._localArtifactDatas[idx].count < count) {
            return false;
        }

        this._localArtifactDatas[idx].count -= count;

        const artifactConfig = ArtifactConfig.getById(artifactConfigId);
        if (artifactConfig != null) {
            // TODO: calc prop
        }

        if (this._localArtifactDatas[idx].count <= 0) {
            this._localArtifactDatas.splice(idx, 1);
        }

        this._saveLocalData();
        NotificationMgr.triggerEvent(NotificationName.ARTIFACT_CHANGE);

        return true;
    }

    public arrange(sortType: ArtifactArrangeType): void {
        // 2024-4-10 no merge
        // merge same item
        // const singleItems: Map<string, ArtifactData> = new Map();
        // for (let i = 0; i < this._localArtifactDatas.length; i++) {
        //     const item = this._localArtifactDatas[i];
        //     if (singleItems.has(item.artifactConfigId)) {
        //         const savedItem = singleItems.get(item.artifactConfigId);
        //         savedItem.count += item.count;
        //         savedItem.addTimeStamp = Math.max(savedItem.addTimeStamp, item.addTimeStamp);
        //         this._localArtifactDatas.splice(i, 1);
        //         i--;
        //     } else {
        //         singleItems.set(item.artifactConfigId, item);
        //     }
        // }
        // this._saveLocalData();
        if (sortType == ArtifactArrangeType.Recently) {
            this._localArtifactDatas.sort((a, b) => {
                return b.addTimeStamp - a.addTimeStamp;
            });
        } else if (sortType == ArtifactArrangeType.Rarity) {
            //bigger in front
            this._localArtifactDatas.sort((a, b) => {
                return ArtifactConfig.getById(b.artifactConfigId).rank - ArtifactConfig.getById(a.artifactConfigId).rank;
            });
        }

        NotificationMgr.triggerEvent(NotificationName.ARTIFACT_CHANGE);
    }

    private _saveLocalData() {
        if (Config.canSaveLocalData) {
            localStorage.setItem(this._localStorageKey, JSON.stringify(this._localArtifactDatas));
        }
    }
}
