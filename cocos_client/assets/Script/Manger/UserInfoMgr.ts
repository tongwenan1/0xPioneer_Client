import { GameExtraEffectType, GetPropData, ResourceCorrespondingItem } from "../Const/ConstDefine";
import ItemConfigDropTool from "../Tool/ItemConfigDropTool";
import ArtifactData from "../Model/ArtifactData";
import { GameMgr, ItemMgr } from "../Utils/Global";
import NotificationMgr from "../Basic/NotificationMgr";
import { InnerBuildingType } from "../Const/BuildingDefine";
import InnerBuildingLvlUpConfig from "../Config/InnerBuildingLvlUpConfig";
import ItemData from "../Const/Item";
import { NotificationName } from "../Const/Notification";
import { DataMgr } from "../Data/DataMgr";
import { MapPioneerObject } from "../Const/PioneerDefine";

export default class UserInfoMgr {
    private _afterTalkItemGetData: Map<string, ItemData[]> = new Map();
    private _afterCivilizationClosedShowItemDatas: ItemData[] = [];
    private _afterCivilizationClosedShowArtifactDatas: ArtifactData[] = [];
    private _afterCivilizationClosedShowPioneerDatas: MapPioneerObject[] = [];

    public constructor() {
        NotificationMgr.addListener(NotificationName.TASK_STEP_FINISHED, this._onTaskStepFinished, this);
        NotificationMgr.addListener(NotificationName.USERINFO_DID_CHANGE_LEVEL, this._onUserInfoDidChangeLevel, this);
        NotificationMgr.addListener(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, this._onInnerBuildingDidFinishUpgrade, this);

        NotificationMgr.addListener(NotificationName.GENERATE_TROOP_NUM_TO_CHANGE, this._generateTroopNumToChange, this);
        NotificationMgr.addListener(NotificationName.GENERATE_ENERGY_NUM_TO_CHANGE, this._generateEnergyNumToChange, this);
    }
    //--------------------------------------------------
    public get afterTalkItemGetData() {
        return this._afterTalkItemGetData;
    }
    public get afterCivilizationClosedShowItemDatas() {
        return this._afterCivilizationClosedShowItemDatas;
    }
    public get afterCivilizationClosedShowArtifactDatas() {
        return this._afterCivilizationClosedShowArtifactDatas;
    }
    public get afterCivilizationClosedShowPioneerDatas() {
        return this._afterCivilizationClosedShowPioneerDatas;
    }
    //--------------------------------------------------
    public getExplorationReward(boxId: string) {
        DataMgr.s.userInfo.getExplorationReward(boxId);
        DataMgr.s.count.addObj_openBox({
            id: boxId,
        });
    }
    public beginGenerateTroop(leftTime: number, troopNum: number) {
        DataMgr.s.userInfo.beginGenerateTroop(leftTime, troopNum);
        DataMgr.s.count.addObj_generateTroops({
            num: troopNum,
        });
    }

    public set afterCivilizationClosedShowItemDatas(itemDatas: ItemData[]) {
        this._afterCivilizationClosedShowItemDatas = itemDatas;
    }
    public set afterCivilizationClosedShowArtifactDatas(artifactDatas: ArtifactData[]) {
        this._afterCivilizationClosedShowArtifactDatas = artifactDatas;
    }
    public set afterCivilizationClosedShowPioneerDatas(pioneerDatas: MapPioneerObject[]) {
        this._afterCivilizationClosedShowPioneerDatas = pioneerDatas;
    }
    //-------------------------------------------------- notification
    private _onTaskStepFinished(taskId: string) {
        const task = DataMgr.s.task.getTask(taskId);
        if (task != null) {
            const finishedStepIndex: number = task.stepIndex - 1;
            if (finishedStepIndex >= 0 && finishedStepIndex < task.steps.length) {
                const finishedStep = DataMgr.s.task.getTaskStep(task.steps[finishedStepIndex]);

                if (finishedStep.progress != null && finishedStep.progress > 0) {
                    const effectProgress = GameMgr.getAfterExtraEffectPropertyByPioneer(null, GameExtraEffectType.TREASURE_PROGRESS, finishedStep.progress);
                    DataMgr.s.userInfo.gainTreasureProgress(effectProgress);
                }
                if (finishedStep.exp != null && finishedStep.exp > 0) {
                    DataMgr.s.userInfo.gainExp(finishedStep.exp);
                }
            }
        }
    }
    private _onUserInfoDidChangeLevel(data: { hpMaxChangeValue: number; showBuildingIds: string[]; rewards: GetPropData[] }) {
        if (data.hpMaxChangeValue > 0) {
            DataMgr.s.pioneer.changeAllPlayerHpMax(data.hpMaxChangeValue);
        }
        if (data.showBuildingIds.length > 0) {
            for (const buildingId of data.showBuildingIds) {
                DataMgr.s.mapBuilding.showBuilding(buildingId);
            }
        }
        if (data.rewards.length > 0) {
            ItemConfigDropTool.getItemByConfig(data.rewards);
        }
    }
    private _onInnerBuildingDidFinishUpgrade(type: InnerBuildingType) {
        const info = DataMgr.s.userInfo.data.innerBuildings[type];
        if (info == null) {
            return;
        }
        DataMgr.s.count.addObj_buildInnerBuilding({
            bId: type,
            level: info.buildLevel,
        });
    }

    private _generateTroopNumToChange(data: { generateNum: number }) {
        if (data.generateNum <= 0) {
            return;
        }
        DataMgr.s.item.addObj_item([new ItemData(ResourceCorrespondingItem.Troop, data.generateNum)]);
    }
    private _generateEnergyNumToChange() {
        const energyBuildingData = DataMgr.s.userInfo.data.innerBuildings[InnerBuildingType.EnergyStation];
        if (energyBuildingData == null) {
            return;
        }
        const generateConfig = InnerBuildingLvlUpConfig.getEnergyLevelData(energyBuildingData.buildLevel);
        if (generateConfig == null) {
            return;
        }
        let generateNumPerMin: number = generateConfig.output;
        generateNumPerMin = GameMgr.getAfterExtraEffectPropertyByBuilding(
            InnerBuildingType.EnergyStation,
            GameExtraEffectType.ENERGY_GENERATE,
            generateNumPerMin
        );
        DataMgr.s.userInfo.gainGenerateEnergy(generateNumPerMin);
    }
}
