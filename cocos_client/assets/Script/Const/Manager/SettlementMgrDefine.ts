export interface SettlementModel {
    level: number,
    newPioneerIds: string[],
    killEnemies: number,
    gainResources: number,
    consumeResources: number,
    gainTroops: number,
    consumeTroops: number,
    gainEnergy: number,
    consumeEnergy: number,
    eventAchievements?: any[],
    exploredEvents: number
}
