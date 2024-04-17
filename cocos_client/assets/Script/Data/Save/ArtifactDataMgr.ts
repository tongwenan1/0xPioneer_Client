import { Vec2 } from "cc";
import ArtifactData from "../../Model/ArtifactData";
import { ArtifactArrangeType } from "../../Const/Artifact";
import ArtifactConfig from "../../Config/ArtifactConfig";
import ArtifactEffectConfig from "../../Config/ArtifactEffectConfig";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import { GameExtraEffectType } from "../../Const/ConstDefine";

export class ArtifactDataMgr {
    private _data: ArtifactData[];
    private _key: string = "artifact_data";
    private _maxArtifactLength: number = 100;

    public constructor() {}

    public async loadObj() {
        if (this._data == null) {
            this._data = [];
            const data = localStorage.getItem(this._key);
            if (data) {
                this._data = JSON.parse(data);
            }
        }
    }

    public getObj() {
        return this._data;
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

    public getObj_artifact_sort(sortType: ArtifactArrangeType) {
        if (sortType == ArtifactArrangeType.Recently) {
            this._data.sort((a, b) => {
                return b.addTimeStamp - a.addTimeStamp;
            });
        } else if (sortType == ArtifactArrangeType.Rarity) {
            //bigger in front
            this._data.sort((a, b) => {
                return ArtifactConfig.getById(b.artifactConfigId).rank - ArtifactConfig.getById(a.artifactConfigId).rank;
            });
        }
        NotificationMgr.triggerEvent(NotificationName.ARTIFACT_CHANGE);
    }

    public getObj_artifact_effectiveEffect(artifactStoreLevel: number): Map<GameExtraEffectType, number> {
        const effectMap: Map<GameExtraEffectType, number> = new Map();
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
                    if (effConfig.unlock && effConfig.unlock > artifactStoreLevel) {
                        continue;
                    }
                    if (!effectMap.has(effectType)) {
                        effectMap.set(effectType, 0);
                    }
                    let lastNum: number = effectMap.get(effectType);
                    if (effectType == GameExtraEffectType.VISION_RANGE ||
                        effectType == GameExtraEffectType.PIONEER_ONLY_VISION_RANGE ||
                        effectType == GameExtraEffectType.CITY_AND_PIONEER_VISION_RANGE) {
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

    public addObj_artifact(artifacts: ArtifactData[]) {
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
        this.getObj_artifact_sort(ArtifactArrangeType.Rarity);
        return changed
    }

    public artifactIsFull(): boolean {
        return this._data.length >= this._maxArtifactLength;
    }

    public async saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
    }
}
