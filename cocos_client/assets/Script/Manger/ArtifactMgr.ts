import { SpriteFrame, resources, sys } from "cc";
import ArtifactData, { ArtifactConfigData, ArtifactEffectConfigData, ArtifactProp, ArtifactPropValueType } from "../Model/ArtifactData";
import UserInfoMgr, { FinishedEvent } from "./UserInfoMgr";
import PioneerMgr from "./PioneerMgr";
import { ArtifactItem } from "../UI/ArtifactItem";


export enum ArtifactArrangeType {
    Recently = "Recently",
    Rarity = "Rarity",
}

export interface ArtifactMgrEvent {
    artifactChanged(): void;
}

export default class ArtifactMgr {
    public async getItemIcon(iconName: string): Promise<SpriteFrame> {
        if (iconName in this._itemIconSpriteFrames) {
            return this._itemIconSpriteFrames[iconName];
        }
        const frame = await new Promise((resolve) => {
            resources.load("ui/icon/artifact/" + iconName + "/spriteFrame", SpriteFrame, (err: Error, icon) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(icon);
            });
        });
        if (frame != null) {
            this._itemIconSpriteFrames[iconName] = frame;
        }
        return this._itemIconSpriteFrames[iconName];
    }

    public getArtifactConf(artifactConfigId: string): ArtifactConfigData {
        let key = artifactConfigId;
        if (key in this._artifactConfs) {
            return this._artifactConfs[key];
        }
        console.error(`getArtifactConf error, artifact config[${key}] not exist`);
        return null;
    }
    public getArtifactEffectConf(effectConfigId: string): ArtifactEffectConfigData {
        let key = effectConfigId;
        if (key in this._artifactEffectConfs) {
            return this._artifactEffectConfs[key];
        }
        return null;
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

    public getPropEffValue(cLv: number) {
        const r = {
            prop: {}, // propType => { add: 0, mul: 0}
            eff: {}, // effectType => 0
        };

        for (let i = 0; i < this._localArtifactDatas.length; i++) {
            const artifact = this._localArtifactDatas[i];
            const artifactConfig = ArtifactMgr.Instance.getArtifactConf(artifact.artifactConfigId);

            // prop
            if (artifactConfig.prop.length > 0) {
                for (let j = 0; j < artifactConfig.prop.length; j++) {
                    const propType = artifactConfig.prop[j];
                    const propValue = artifactConfig.prop_value[j];

                    if (!r.prop[propType]) r.prop[propType] = { add: 0, mul: 0 };

                    if (propValue[0] == ArtifactPropValueType.ADD) {
                        r.prop[propType].add += propValue[0] * artifact.count;
                    } else if (propValue[0] == ArtifactPropValueType.MUL) {
                        r.prop[propType].mul += propValue[0] * artifact.count;
                    }
                }
            }

            // effect
            if (artifactConfig.effect.length > 0) {
                for (let j = 0; j < artifactConfig.effect.length; j++) {
                    const effectId = artifactConfig.effect[j];
                    const effConfig = ArtifactMgr.Instance.getArtifactEffectConf(effectId);
                    const effectType = effConfig.type;

                    if (effConfig.unlock && effConfig.unlock > cLv) {
                        continue;
                    }

                    if (!r.eff[effectType]) r.eff[effectType] = 0;
                    r.eff[effectType] += effConfig.para[0] * artifact.count;
                }
            }
        }

        return r;
    }

    public get artifactIsFull(): boolean {
        return this._localArtifactDatas.length >= this._maxArtifactLength;
    }
    public get maxItemLength(): number {
        return this._maxArtifactLength;
    }
    public get localArtifactDatas(): ArtifactData[] {
        return this._localArtifactDatas;
    }

    public addArtifact(artifacts: ArtifactData[]): void {
        if (artifacts.length <= 0) {
            return;
        }
        let changed: boolean = false;
        for (const artifact of artifacts) {
            const artifactConfig = this.getArtifactConf(artifact.artifactConfigId);
            if (artifactConfig == null) continue;
            if (this.artifactIsFull) continue;

            changed = true;
            const exsitArtifacts = this._localArtifactDatas.filter(v => v.artifactConfigId == artifact.artifactConfigId);
            if (exsitArtifacts.length > 0) {
                exsitArtifacts[0].count += artifact.count;
                exsitArtifacts[0].addTimeStamp = new Date().getTime();
            } else {
                artifact.addTimeStamp = new Date().getTime();
                this._localArtifactDatas.push(artifact);
            }

            if (artifactConfig.effect != null) {
                for (const temple of artifactConfig.effect) {
                    const effectData = this.getArtifactEffectConf(temple);

                }
            }
            if (artifactConfig.prop != null) {
                for (let j = 0; j < artifactConfig.prop.length; j++) {
                    const propType: ArtifactProp = artifactConfig.prop[j];
                    const propValue = artifactConfig.prop_value[j];
                    if (propType == ArtifactProp.HP) {
                        PioneerMgr.instance.pioneerChangeAllPlayerHpMax({
                            type: propValue[0],
                            value: propValue[1] * artifact.count,
                        });
                    } else if (propType == ArtifactProp.ATTACK) {
                        PioneerMgr.instance.pioneerChangeAllPlayerAttack({
                            type: propValue[0],
                            value: propValue[1] * artifact.count,
                        });
                    }
                }
            }
        }
        if (changed) {
            for (const observe of this._observers) {
                observe.artifactChanged();
            }
            sys.localStorage.setItem(this._localStorageKey, JSON.stringify(this._localArtifactDatas));
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

        const artifactConfig = this.getArtifactConf(artifactConfigId);
        if (artifactConfig != null) {
            // TODO: calc prop
        }

        if (this._localArtifactDatas[idx].count <= 0) {
            this._localArtifactDatas.splice(idx, 1);
        }
        for (const observe of this._observers) {
            observe.artifactChanged();
        }
        sys.localStorage.setItem(this._localStorageKey, JSON.stringify(this._localArtifactDatas));

        return true;
    }
    public arrange(sortType: ArtifactArrangeType): void {
        // merge same item
        const singleItems: Map<string, ArtifactData> = new Map();
        for (let i = 0; i < this._localArtifactDatas.length; i++) {
            const item = this._localArtifactDatas[i];
            if (singleItems.has(item.artifactConfigId)) {
                const savedItem = singleItems.get(item.artifactConfigId);
                savedItem.count += item.count;
                savedItem.addTimeStamp = Math.max(savedItem.addTimeStamp, item.addTimeStamp);
                this._localArtifactDatas.splice(i, 1);
                i--;
            } else {
                singleItems.set(item.artifactConfigId, item);
            }
        }
        localStorage.setItem(this._localStorageKey, JSON.stringify(this._localArtifactDatas));

        if (sortType == ArtifactArrangeType.Recently) {
            this._localArtifactDatas.sort((a, b) => {
                return b.addTimeStamp - a.addTimeStamp;
            });
        } else if (sortType == ArtifactArrangeType.Rarity) {
            //bigger in front
            this._localArtifactDatas.sort((a, b) => {
                return this.getArtifactConf(b.artifactConfigId).rank - this.getArtifactConf(a.artifactConfigId).rank;
            });
        }
        for (const observe of this._observers) {
            observe.artifactChanged();
        }
    }

    public addObserver(observer: ArtifactMgrEvent) {
        this._observers.push(observer);
    }
    public removeObserver(observer: ArtifactMgrEvent) {
        const index: number = this._observers.indexOf(observer);
        if (index != -1) {
            this._observers.splice(index, 1);
        }
    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new ArtifactMgr();
        }
        return this._instance;
    }
    public async initData() {
        await this._initData();
    }

    private _observers: ArtifactMgrEvent[] = [];
    public constructor() { }

    private _maxArtifactLength: number = 100;
    private _localStorageKey: string = "artifact_data";
    private _localArtifactDatas: ArtifactData[] = [];

    private static _instance: ArtifactMgr = null;
    private _artifactConfs = {};
    private _artifactEffectConfs = {};
    private _itemIconSpriteFrames = {};
    private async _initData() {
        // read artifact config
        const obj = await new Promise((resolve) => {
            resources.load("data_local/artifact", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (obj != null) {
            // format config
            let jsonObj = obj as object;

            for (var id in jsonObj) {
                let jd = jsonObj[id];
                let d = new ArtifactConfigData();
                for (var key in jd) {
                    if (!d.hasOwnProperty(key)) {
                        continue;
                    }
                    d[key] = jd[key];
                }
                d.configId = jd.id;
                this._artifactConfs[id] = d;
            }
        }

        // read artifact effect config
        const effobj = await new Promise((resolve) => {
            resources.load("data_local/artifact_effect", (err: Error, data: any) => {
                if (err) {
                    resolve(null);
                    return;
                }
                resolve(data.json);
            });
        });
        if (effobj != null) {
            // format config
            let jsonObj = effobj as object;

            for (var id in jsonObj) {
                let jd = jsonObj[id];
                let d = new ArtifactEffectConfigData();
                for (var key in jd) {
                    if (!d.hasOwnProperty(key)) {
                        continue;
                    }
                    d[key] = jd[key];
                }
                d.effectId = jd.id;
                this._artifactEffectConfs[id] = d;
            }
        }

        // load local artifact data
        let jsonStr = sys.localStorage.getItem(this._localStorageKey);
        if (!jsonStr) {
            this._localArtifactDatas = [];
        } else {
            this._localArtifactDatas = JSON.parse(jsonStr);
        }
    }
}
