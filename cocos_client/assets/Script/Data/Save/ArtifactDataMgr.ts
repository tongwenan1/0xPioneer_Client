import { Vec2 } from "cc";
import ArtifactData from "../../Model/ArtifactData";
import { ArtifactArrangeType } from "../../Const/Artifact";
import ArtifactConfig from "../../Config/ArtifactConfig";
import ArtifactEffectConfig from "../../Config/ArtifactEffectConfig";

export class ArtifactDataMgr {
    private _data: ArtifactData[];
    private _key: string = "artifact_data";
    private _maxArtifactLength: number = 100;

    public async loadObj() {
        if (this._data == null) {
            this._data = [];
            const data = localStorage.getItem(this._key);
            if (data) {
                this._data = JSON.parse(data);
            }
        }
    }

    public getObj_artifact_maxLength() {
        return this._maxArtifactLength;
    }

    public getObj() {
        return this._data;
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
        if (changed) this.saveObj();
        return changed
    }

    public artifactIsFull(): boolean {
        return this._data.length >= this._maxArtifactLength;
    }

    public async saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
    }
}
