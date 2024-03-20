export enum ArtifactArrangeType {
    Recently = "Recently",
    Rarity = "Rarity",
}

export interface ArtifactMgrEvent {
    artifactChanged(): void;
}