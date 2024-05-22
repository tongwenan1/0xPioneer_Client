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
import UIPanelManger from "../Basic/UIPanelMgr";
import { UIName } from "../Const/ConstUIDefine";
import { ItemGettedUI } from "../UI/ItemGettedUI";
import { ArtifactInfoUI } from "../UI/ArtifactInfoUI";

export default class UserInfoMgr {
    private _afterTalkItemGetData: Map<string, ItemData[]> = new Map();
    private _afterCivilizationClosedShowItemDatas: ItemData[] = [];
    private _afterCivilizationClosedShowArtifactDatas: ArtifactData[] = [];
    private _afterCivilizationClosedShowPioneerDatas: MapPioneerObject[] = [];

    public constructor() {
        NotificationMgr.addListener(NotificationName.USERINFO_DID_CHANGE_LEVEL, this._onUserInfoDidChangeLevel, this);
        NotificationMgr.addListener(NotificationName.INNER_BUILDING_UPGRADE_FINISHED, this._onInnerBuildingDidFinishUpgrade, this);

        NotificationMgr.addListener(NotificationName.GENERATE_TROOP_NUM_TO_CHANGE, this._generateTroopNumToChange, this);
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
    private _onUserInfoDidChangeLevel(data: { hpMaxChangeValue: number; showBuildingIds: string[]; items: ItemData[]; artifacts: ArtifactData[] }) {
        if (data.hpMaxChangeValue > 0) {
            DataMgr.s.pioneer.changeAllPlayerHpMax(data.hpMaxChangeValue);
        }
        if (data.showBuildingIds.length > 0) {
            // for (const buildingId of data.showBuildingIds) {
            //     DataMgr.s.mapBuilding.showBuilding(buildingId);
            // }
        }

        // if (data.rewards.length > 0) {
        //     // upload resource changed levelup
        //     ItemConfigDropTool.getItemByConfig(data.rewards);
        // }

        if (data.items.length > 0) {
            setTimeout(async () => {
                if (UIPanelManger.inst.panelIsShow(UIName.CivilizationLevelUpUI) || UIPanelManger.inst.panelIsShow(UIName.SecretGuardGettedUI)) {
                    this._afterCivilizationClosedShowItemDatas.push(...data.items);
                } else {
                    const result = await UIPanelManger.inst.pushPanel(UIName.ItemGettedUI);
                    if (result.success) {
                        result.node.getComponent(ItemGettedUI).showItem(data.items);
                    }
                }
            });
        }
        if (data.artifacts.length > 0) {
            setTimeout(async () => {
                if (UIPanelManger.inst.panelIsShow(UIName.CivilizationLevelUpUI) || UIPanelManger.inst.panelIsShow(UIName.SecretGuardGettedUI)) {
                    this._afterCivilizationClosedShowArtifactDatas.push(...data.artifacts);
                } else {
                    const result = await UIPanelManger.inst.pushPanel(UIName.ArtifactInfoUI);
                    if (result.success) {
                        result.node.getComponent(ArtifactInfoUI).showItem(data.artifacts);
                    }
                }
            });
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
