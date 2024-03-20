export enum ItemArrangeType {
    Recently = "Recently",
    Rarity = "Rarity",
    Type = "Type",
}

export interface ItemMgrEvent {
    itemChanged(): void;
}