import ArtifactData from "../../Model/ArtifactData";
import ArtifactConfig from "../../Config/ArtifactConfig";
import ArtifactEffectConfig from "../../Config/ArtifactEffectConfig";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import { BackpackArrangeType, GameExtraEffectType } from "../../Const/ConstDefine";
import CommonTools from "../../Tool/CommonTools";

export class ArtifactDataMgr {
    private _data: ArtifactData[];
    private _baseKey: string = "artifact_data";
    private _key: string = "";
    private _maxArtifactLength: number = 100;

    public constructor() {}

    public async loadObj(walletAddr: string) {
        this._key = walletAddr + "|" + this._baseKey;
        if (this._data == null) {
            this._data = [];
            const data = localStorage.getItem(this._key);
            if (data) {
                this._data = JSON.parse(data);
            }
        }
    }
    public async saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
    }
    //------------------------------------------------------------
    public getObj() {
        return this._data;
    }
    public getObj_by_uniqueId(uniqueId: string) {
        return this._data.find((artifact) => artifact.uniqueId == uniqueId);
    }
    public getObj_artifact_maxLength() {
        return this._maxArtifactLength;
    }
    public artifactIsFull(): boolean {
        return this._data.length >= this._maxArtifactLength;
    }
    public getObj_artifact_count(artifactConfigId: string): number {
        let count: number = 0;
        for (const artifact of this._data) {
            if (artifact.artifactConfigId == artifactConfigId) {
                count += artifact.count;
            }
        }
        return count;
    }
    public getObj_artifact_sort(sortType: BackpackArrangeType) {
        if (sortType == BackpackArrangeType.Recently) {
            this._data.sort((a, b) => {
                return b.addTimeStamp - a.addTimeStamp;
            });
        } else if (sortType == BackpackArrangeType.Rarity) {
            //bigger in front
            this._data.sort((a, b) => {
                return ArtifactConfig.getById(b.artifactConfigId).rank - ArtifactConfig.getById(a.artifactConfigId).rank;
            });
        }
        NotificationMgr.triggerEvent(NotificationName.ARTIFACT_CHANGE);
    }
    public getObj_artifact_effectiveEffect(type: GameExtraEffectType, artifactStoreLevel: number): number {
        let effectNum: number = 0;
        for (const artifact of this._data) {
            if (artifact.effectIndex < 0) {
                continue;
            }
            const artifactConfig = ArtifactConfig.getById(artifact.artifactConfigId);
            if (artifactConfig.effect != null) {
                for (let j = 0; j < artifactConfig.effect.length; j++) {
                    const effectId = artifactConfig.effect[j];
                    const effConfig = ArtifactEffectConfig.getById(effectId);
                    let effectType = effConfig.type;
                    if (effectType == GameExtraEffectType.VISION_RANGE) {
                        if (effConfig.para[0] == 0) {
                            effectType = GameExtraEffectType.CITY_ONLY_VISION_RANGE;
                        } else if (effConfig.para[0] == 1) {
                            effectType = GameExtraEffectType.PIONEER_ONLY_VISION_RANGE;
                        } else if (effConfig.para[0] == 2) {
                            effectType = GameExtraEffectType.CITY_AND_PIONEER_VISION_RANGE;
                        }
                    }
                    if (effectType != type) {
                        continue;
                    }
                    if (effConfig.unlock && effConfig.unlock > artifactStoreLevel) {
                        continue;
                    }
                    if (
                        effectType == GameExtraEffectType.VISION_RANGE ||
                        effectType == GameExtraEffectType.PIONEER_ONLY_VISION_RANGE ||
                        effectType == GameExtraEffectType.CITY_AND_PIONEER_VISION_RANGE
                    ) {
                        effectNum += effConfig.para[1];
                    } else {
                        effectNum += effConfig.para[0];
                    }
                }
            }
        }
        return effectNum;
    }
    //-------------------------------------------------------
    public addObj_artifact(artifacts: ArtifactData[]) {
        if (artifacts.length <= 0) {
            return;
        }
        let changed: boolean = false;
        for (const artifact of artifacts) {
            const artifactConfig = ArtifactConfig.getById(artifact.artifactConfigId);
            if (artifactConfig == null) continue;
            if (this.artifactIsFull()) continue;
            changed = true;

            const currentTimeStamp: number = new Date().getTime();
            artifact.uniqueId = CommonTools.generateUUID() + currentTimeStamp;
            artifact.addTimeStamp = currentTimeStamp;
            this._data.push(artifact);
            if (artifactConfig.effect != null) {
                for (const temple of artifactConfig.effect) {
                    const effectData = ArtifactEffectConfig.getById(temple);
                }
            }
            if (artifactConfig.prop != null) {
                for (let j = 0; j < artifactConfig.prop.length; j++) {
                    const propType = artifactConfig.prop[j];
                    const propValue = artifactConfig.prop_value[j];
                }
            }
        }
        if (changed) {
            this.saveObj();
            NotificationMgr.triggerEvent(NotificationName.ARTIFACT_CHANGE);
        }
        this.getObj_artifact_sort(BackpackArrangeType.Rarity);
        return changed;
    }
    public changeObj_artifact_effectIndex(uniqueId: string, effectIndex: number) {
        const artifact = this.getObj_by_uniqueId(uniqueId);
        if (artifact == undefined) {
            return;
        }
        artifact.effectIndex = effectIndex;
        this.saveObj();
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
}
