import ArtifactData from "../../Model/ArtifactData";
import ArtifactConfig from "../../Config/ArtifactConfig";
import ArtifactEffectConfig from "../../Config/ArtifactEffectConfig";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import { BackpackArrangeType, GameExtraEffectType } from "../../Const/ConstDefine";
import CommonTools from "../../Tool/CommonTools";
import NetGlobalData from "./Data/NetGlobalData";

export class ArtifactDataMgr {
    private _maxArtifactLength: number = 100;
    private _data: ArtifactData[];
    public constructor() {}

    public async loadObj() {
        this._initData();
    }
    //------------------------------------------------------------
    public getObj() {
        return this._data;
    }
    public getObj_by_id(id: string) {
        return this._data.find((artifact) => artifact.artifactConfigId == id);
    }
    public getObj_artifact_equiped() {
        return this._data.filter((artifact) => artifact.effectIndex >= 0);
    }
    public getObj_artifact_maxLength() {
        return this._maxArtifactLength;
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
    public countChanged(change: ArtifactData): void {
        if (change.count == 0) {
            return;
        }
        const config = ArtifactConfig.getById(change.artifactConfigId);
        if (config == null) {
            return;
        }
        let exsitIndex: number = -1;
        for (let i = 0; i < this._data.length; i++) {
            if (this._data[i].artifactConfigId == change.artifactConfigId) {
                exsitIndex = i;
                break;
            }
        }
        if (exsitIndex >= 0) {
            this._data[exsitIndex].count += change.count;
            if (change.count < 0 && this._data[exsitIndex].count <= 0) {
                this._data.splice(exsitIndex, 1);
            }
        } else {
            if (change.count > 0) {
                this._data.push(change);
            }
        }
        this.getObj_artifact_sort(BackpackArrangeType.Rarity);
        NotificationMgr.triggerEvent(NotificationName.ARTIFACT_CHANGE);
    }
    public changeObj_artifact_effectIndex(id: string, effectIndex: number) {
        const artifact = this.getObj_by_id(id);
        if (artifact == undefined) {
            return;
        }
        artifact.effectIndex = effectIndex;

        NotificationMgr.triggerEvent(NotificationName.ARTIFACT_EQUIP_DID_CHANGE);
    }

    private _initData() {
        this._data = [];
        if (NetGlobalData.artifacts == null) {
            return;
        }
        const netItems = NetGlobalData.artifacts.items;
        for (const key in netItems) {
            const item = new ArtifactData(netItems[key].artifactConfigId, netItems[key].count);
            item.addTimeStamp = netItems[key].addTimeStamp;
            item.effectIndex = netItems[key].effectIndex;
            this._data.push(item);
        }
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
