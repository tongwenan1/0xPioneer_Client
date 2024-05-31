export default class ArtifactData {
    public uniqueId: string;
    public artifactConfigId: string; // artifact config id
    public count: number; // count
    public addTimeStamp: number;
    public effectIndex: number;
    public effect: string[];

    public constructor(artifactConfigId: string, count: number, addTimeStamp = 0, effectIndex = -1) {
        this.artifactConfigId = artifactConfigId;
        this.count = count;
        this.addTimeStamp = addTimeStamp;
        this.effectIndex = effectIndex;
        this.uniqueId = "";
        this.effect = [];
    }
}


