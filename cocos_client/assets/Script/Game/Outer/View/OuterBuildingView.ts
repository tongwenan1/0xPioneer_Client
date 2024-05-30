import { _decorator, instantiate, Label, Layout, Node, Prefab } from "cc";
import { LanMgr, ResourcesMgr } from "../../../Utils/Global";
import { MapBuildingType, InnerBuildingType, UserInnerBuildInfo } from "../../../Const/BuildingDefine";
import ViewController from "../../../BasicView/ViewController";
import NotificationMgr from "../../../Basic/NotificationMgr";
import InnerBuildingLvlUpConfig from "../../../Config/InnerBuildingLvlUpConfig";
import InnerBuildingConfig from "../../../Config/InnerBuildingConfig";
import { NotificationName } from "../../../Const/Notification";
import { MapMemberFactionType } from "../../../Const/ConstDefine";
import { MapBuildingObject, MapBuildingTavernObject, MapBuildingWormholeObject } from "../../../Const/MapBuilding";
import { DataMgr } from "../../../Data/DataMgr";
import CommonTools from "../../../Tool/CommonTools";
import ArtifactConfig from "../../../Config/ArtifactConfig";
import { ArtifactConfigData } from "../../../Const/Artifact";
const { ccclass, property } = _decorator;

@ccclass("OuterBuildingView")
export class OuterBuildingView extends ViewController {
    public async refreshUI(building: MapBuildingObject) {
        this._building = building;

        let name: string = "";
        if (building.type == MapBuildingType.city) {
            name = DataMgr.s.userInfo.data.name + " " + LanMgr.getLanById(building.name);
        } else {
            name = LanMgr.getLanById(building.name);
        }
        this.node.getChildByPath("Title/Text").getComponent(Label).string = name;
        this.node.getChildByPath("Level/Text").getComponent(Label).string = "Lv." + building.level;

        for (const buildingName of this._buildViewNames) {
            this.node.getChildByPath("BuildingContent/" + buildingName).active = buildingName == building.animType;
        }

        const strongholdView = this.node.getChildByPath("StrongholdContent");
        const wormholdView = this.node.getChildByPath("WormholdView");
        const tavernView = this.node.getChildByPath("TavernView");
        const exploreView = this.node.getChildByPath("ExploreView");

        strongholdView.active = false;
        wormholdView.active = false;
        tavernView.active = false;
        exploreView.active = false;

        const collectIcon = this.node.getChildByPath("Level/Collect");
        const exploreIcon = this.node.getChildByPath("Level/Explore");
        const strongholdIcon = this.node.getChildByPath("Level/Stronghold");
        const battleIcon = this.node.getChildByPath("Level/Battle");

        collectIcon.active = false;
        exploreIcon.active = false;
        strongholdIcon.active = false;
        battleIcon.active = false;

        this.node.getChildByPath("Level").active = true;
        if (building.type == MapBuildingType.city) {
            if (building.faction == MapMemberFactionType.enemy) {
                this.node.getChildByPath("Level").active = true;
                battleIcon.active = true;
            } else {
                this.node.getChildByPath("Level").active = false;
            }
            let tempShowAni: string = null;
            const effectArtifac = DataMgr.s.artifact.getObj_artifact_equiped();
            for (const temp of effectArtifac) {
                const config: ArtifactConfigData = ArtifactConfig.getById(temp.artifactConfigId);
                if (config == null) {
                    return;
                }
                if (config.rank == 5) {
                    tempShowAni = config.ani;
                    break;
                }
            }
            if (tempShowAni != this._showArtifactAni) {
                if (this._artifactShowView != null) {
                    this._artifactShowView.destroy();
                    this._artifactShowView = null;
                }
                if (tempShowAni != null) {
                    const prb = await ResourcesMgr.LoadABResource("prefab/artifactX5/Prefab/artifact/" + tempShowAni, Prefab);
                    this._artifactShowView = instantiate(prb);
                    this.node.getChildByPath("ArtifactShow").addChild(this._artifactShowView);
                }
                this._showArtifactAni = tempShowAni;
            }
        } else if (building.type == MapBuildingType.explore) {
            exploreIcon.active = true;
            if (building.explorePioneerIds != null && building.explorePioneerIds.length > 0) {
                exploreView.active = true;
                exploreView.getChildByPath("Icon/pioneer_default").active = building.explorePioneerIds[0] == "pioneer_0";
                exploreView.getChildByPath("Icon/secretGuard").active = building.explorePioneerIds[0] == "pioneer_1";
                exploreView.getChildByPath("Icon/doomsdayGangSpy").active = building.explorePioneerIds[0] == "pioneer_2";
                exploreView.getChildByPath("Icon/rebels").active = building.explorePioneerIds[0] == "pioneer_3";
                
                const currentTimeStamp: number = new Date().getTime();
                const tempPioneer = DataMgr.s.pioneer.getById(building.explorePioneerIds[0]);
                exploreView.getChildByPath("Label").getComponent(Label).string = CommonTools.formatSeconds((tempPioneer.actionEndTimeStamp - currentTimeStamp) / 1000)
            }
        } else if (building.type == MapBuildingType.stronghold) {
            strongholdIcon.active = true;
            strongholdView.active = true;

            // let isSelf = false;
            // for (const player of players) {
            //     if (building.defendPioneerIds.indexOf(player.id) != -1) {
            //         isSelf = true;
            //         break;
            //     }
            // }

            for (const view of this._strongholdViews) {
                view.destroy();
            }
            this._strongholdViews = [];

            for (const pioneerId of building.defendPioneerIds) {
                const tempView = instantiate(this._strongholdItem);
                tempView.active = true;
                tempView.getChildByPath("pioneer_default").active = pioneerId == "pioneer_0";
                tempView.getChildByPath("secretGuard").active = pioneerId == "pioneer_1";
                tempView.getChildByPath("doomsdayGangSpy").active = pioneerId == "pioneer_2";
                tempView.getChildByPath("rebels").active = pioneerId == "pioneer_3";
                this._strongholdItem.parent.addChild(tempView);
                this._strongholdViews.push(tempView);
            }
            this._strongholdItem.parent.getComponent(Layout).updateLayout();

            // if (isSelf) {
            // this._selfView.active = true;
            // } else {
            // this._neturalView.active = true;
            // }
        } else if (building.type == MapBuildingType.wormhole) {
            strongholdIcon.active = true;
            const wormholeObj = building as MapBuildingWormholeObject;
            wormholdView.active = wormholeObj.attacker.size > 0;
            if (wormholdView.active) {
                const currentTimeStamp: number = new Date().getTime();
                const prepareDidFinish: boolean = wormholeObj.wormholdCountdownTime > currentTimeStamp;
                const maxWormholdLength: number = 3;
                for (let i = 0; i < maxWormholdLength; i++) {
                    const tempView = wormholdView.getChildByPath("WormholdContent/Item_" + i);
                    const emptyView = tempView.getChildByPath("Empty");
                    const prepareView = tempView.getChildByPath("Prepare");
                    if (wormholeObj.attacker.has(i)) {
                        const pioneerId = wormholeObj.attacker.get(i);
                        emptyView.active = false;
                        prepareView.active = true;
                        prepareView.getChildByPath("Icon/pioneer_default").active = pioneerId == "pioneer_0";
                        prepareView.getChildByPath("Icon/secretGuard").active = pioneerId == "pioneer_1";
                        prepareView.getChildByPath("Icon/doomsdayGangSpy").active = pioneerId == "pioneer_2";
                        prepareView.getChildByPath("Icon/rebels").active = pioneerId == "pioneer_3";
                        prepareView.getChildByPath("IconGarrison").active = !prepareDidFinish;
                    } else {
                        emptyView.active = true;
                        prepareView.active = false;
                    }
                }
                if (prepareDidFinish) {
                    wormholdView.getChildByPath("Countdown").active = true;
                    // useLanMgr
                    // wormholdView.getChildByPath("Countdown").getComponent(Label).string = LanMgr.getLanById("107549") + ":" + CommonTools.formatSeconds(wormholeObj.wormholdCountdownTime);
                    wormholdView.getChildByPath("Countdown").getComponent(Label).string =
                        "wormhold traveling: " + CommonTools.formatSeconds((wormholeObj.wormholdCountdownTime - currentTimeStamp) / 1000);
                } else {
                    wormholdView.getChildByPath("Countdown").active = false;
                }
            }
        } else if (building.type == MapBuildingType.resource) {
            collectIcon.active = true;
            if (building.gatherPioneerIds != null && building.gatherPioneerIds.length > 0) {
                exploreView.active = true;
                exploreView.getChildByPath("Icon/pioneer_default").active = building.gatherPioneerIds[0] == "pioneer_0";
                exploreView.getChildByPath("Icon/secretGuard").active = building.gatherPioneerIds[0] == "pioneer_1";
                exploreView.getChildByPath("Icon/doomsdayGangSpy").active = building.gatherPioneerIds[0] == "pioneer_2";
                exploreView.getChildByPath("Icon/rebels").active = building.gatherPioneerIds[0] == "pioneer_3";
                
                const currentTimeStamp: number = new Date().getTime();
                const tempPioneer = DataMgr.s.pioneer.getById(building.gatherPioneerIds[0]);
                exploreView.getChildByPath("Label").getComponent(Label).string = CommonTools.formatSeconds((tempPioneer.actionEndTimeStamp - currentTimeStamp) / 1000)
            }
        } else if (building.type == MapBuildingType.event) {
            exploreIcon.active = true;
            if (building.eventPioneerIds != null && building.eventPioneerIds.length > 0) {
                exploreView.active = true;
                exploreView.getChildByPath("Icon/pioneer_default").active = building.eventPioneerIds[0] == "pioneer_0";
                exploreView.getChildByPath("Icon/secretGuard").active = building.eventPioneerIds[0] == "pioneer_1";
                exploreView.getChildByPath("Icon/doomsdayGangSpy").active = building.eventPioneerIds[0] == "pioneer_2";
                exploreView.getChildByPath("Icon/rebels").active = building.eventPioneerIds[0] == "pioneer_3";
                exploreView.getChildByPath("Label").getComponent(Label).string = "Exploring";
            }
        } else if (building.type == MapBuildingType.tavern) {
            exploreIcon.active = true;

            const tavernObj = building as MapBuildingTavernObject;

            const countdownView = tavernView.getChildByPath("CountdownView");
            const newPioneerView = tavernView.getChildByPath("NewPioneerView");

            countdownView.active = false;
            newPioneerView.active = false;

            if (tavernObj.nft != null) {
                newPioneerView.active = true;
            } else if (tavernObj.tavernCountdownTime > 0) {
                countdownView.active = true;
                // useLanMgr
                // countdownView.getChildByPath("Text").getComponent(Label).string = LanMgr.getLanById("107549") + ":" + CommonTools.formatSeconds(tavernObj.tavernCountdownTime);
                countdownView.getChildByPath("Text").getComponent(Label).string = "recruiting: " + CommonTools.formatSeconds(tavernObj.tavernCountdownTime);
            }
            tavernView.active = countdownView.active || newPioneerView.active;
        }

        this._levelShowing = this.node.getChildByPath("Level").active;

        this._refreshEnergyTipShow();
        this._refreshBuildTipShow();
    }

    public showName(isShow: boolean) {
        this.node.getChildByPath("Title").active = isShow;
        if (isShow) {
            this.node.getChildByPath("Level").active = this._levelShowing;
        } else {
            this.node.getChildByPath("Level").active = false;
        }
    }

    private _toGetEnergyTip: Node = null;
    private _toBuildBuildingTip: Node = null;

    private _buildViewNames: string[] = [
        "city",
        "treasure",
        "swamp_jungle",
        "sand_mineral",
        "oasis",
        "ambush",
        "ruin",
        "spider_cave",
        "laboratory",
        "ancient_ruins",
        "Aquatic_Relics_Group",
        "Tree_Group",
        "Pyramid_Group",
        "Transfer_Matrix_Group",
    ];
    private _levelShowing: boolean = false;
    private _building: MapBuildingObject = null;
    private _showArtifactAni: string = null;

    private _strongholdItem: Node = null;
    private _strongholdViews: Node[] = [];
    private _artifactShowView: Node = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._toGetEnergyTip = this.node.getChildByName("ToGetEnergyTip");
        this._toGetEnergyTip.active = false;

        this._toBuildBuildingTip = this.node.getChildByName("ToBuildBuildingTip");
        this._toBuildBuildingTip.active = false;

        this._strongholdItem = this.node.getChildByPath("StrongholdContent/Item");
        this._strongholdItem.active = false;
    }

    protected viewDidStart(): void {
        super.viewDidStart();

        NotificationMgr.addListener(NotificationName.RESOURCE_GETTED, this._onResourceChanged, this);
        NotificationMgr.addListener(NotificationName.RESOURCE_CONSUMED, this._onResourceChanged, this);
        NotificationMgr.addListener(NotificationName.ARTIFACT_EQUIP_DID_CHANGE, this._onArtifactEquipDidChange, this);

        this.schedule(() => {
            if (this._building != null) {
                const currentTimestamp: number = new Date().getTime();
                if (this._building.type == MapBuildingType.wormhole) {
                    const wormObj = this._building as MapBuildingWormholeObject;
                    if (wormObj.wormholdCountdownTime >= currentTimestamp) {
                        this.refreshUI(this._building);
                    }
                } else if (this._building.type == MapBuildingType.explore || this._building.type == MapBuildingType.resource) {
                    let actionPioneerId = null;
                    if (this._building.explorePioneerIds != null && this._building.explorePioneerIds.length > 0) {
                        actionPioneerId = this._building.explorePioneerIds[0];
                    } else if (this._building.gatherPioneerIds != null && this._building.gatherPioneerIds.length > 0) {
                        actionPioneerId = this._building.gatherPioneerIds[0];
                    }
                    if (actionPioneerId != null) {
                        const pioneer = DataMgr.s.pioneer.getById(actionPioneerId);
                        if (pioneer != undefined && pioneer.actionEndTimeStamp >= currentTimestamp) {
                            this.refreshUI(this._building);
                        }
                    }
                }
            }
        }, 1);
    }

    protected viewDidAppear(): void {
        super.viewDidAppear();
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.RESOURCE_GETTED, this._onResourceChanged, this);
        NotificationMgr.removeListener(NotificationName.RESOURCE_CONSUMED, this._onResourceChanged, this);
        NotificationMgr.removeListener(NotificationName.ARTIFACT_EQUIP_DID_CHANGE, this._onArtifactEquipDidChange, this);
    }

    protected viewUpdate(dt: number): void {
        super.viewUpdate(dt);
    }

    //-------------------------------- function
    private _refreshEnergyTipShow() {
        if (this._toGetEnergyTip == null) {
            return;
        }
        this._toGetEnergyTip.active = false;
        if (this._building != null && this._building.type == MapBuildingType.city && this._building.faction != MapMemberFactionType.enemy) {
            if (DataMgr.s.userInfo.data.energyDidGetTimes < DataMgr.s.userInfo.data.energyGetLimitTimes) {
                this._toGetEnergyTip.active = true;
            }
        }
    }
    private _refreshBuildTipShow() {
        if (this._toBuildBuildingTip == null) {
            return;
        }
        this._toBuildBuildingTip.active = false;
        if (this._building != null && this._building.type == MapBuildingType.city && this._building.faction != MapMemberFactionType.enemy) {
            let canBuild: boolean = false;
            const innerBuildings = DataMgr.s.innerBuilding.data;
            innerBuildings.forEach((value: UserInnerBuildInfo, key: InnerBuildingType) => {
                const innerConfig = InnerBuildingConfig.getByBuildingType(key as InnerBuildingType);
                const levelConfig = InnerBuildingLvlUpConfig.getBuildingLevelData(value.buildLevel + 1, innerConfig.lvlup_cost);
                if (levelConfig != null) {
                    let thisBuild: boolean = true;
                    for (const cost of levelConfig) {
                        const type = cost[0].toString();
                        const num = cost[1];
                        if (DataMgr.s.item.getObj_item_count(type) < num) {
                            thisBuild = false;
                            break;
                        }
                    }
                    if (thisBuild) {
                        canBuild = true;
                    }
                }
            });
            if (canBuild) {
                this._toBuildBuildingTip.active = true;
            }
        }
    }

    //-------------------------------- notification
    private _onResourceChanged() {
        this._refreshBuildTipShow();
        this._refreshEnergyTipShow();
    }
    private _onArtifactEquipDidChange(data: {}) {
        if (this._building == null || this._building.type != MapBuildingType.city) {
            return;
        }
        this.refreshUI(this._building);
    }
}
