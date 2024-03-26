import { _decorator, Component, Label, Layout, Node } from 'cc';
import { MapPlayerPioneerModel } from '../Model/MapPioneerModel';
import { LanMgr } from '../../../Utils/Global';
import MapBuildingModel from '../Model/MapBuildingModel';
import { MapBuildingType, BuildingFactionType } from '../../../Const/BuildingDefine';
const { ccclass, property } = _decorator;

@ccclass('OuterBuildingView')
export class OuterBuildingView extends Component {

    public refreshUI(building: MapBuildingModel, players: MapPlayerPioneerModel[]) {

        this.node.getChildByPath("Title/Text").getComponent(Label).string = LanMgr.getLanById(building.name);
        this.node.getChildByPath("Level/Text").getComponent(Label).string = "Lv." + building.level;

        for (const buildingName of this._buildViewNames) {
            this.node.getChildByPath("BuildingContent/" + buildingName).active = buildingName == building.animType;
        }

        const strongholdView = this.node.getChildByPath("StrongholdContent");
        strongholdView.active = false;

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
            if (building.faction == BuildingFactionType.enemy) {
                this.node.getChildByPath("Level").active = true;
                battleIcon.active = true;
            } else {
                this.node.getChildByPath("Level").active = false;
            }

        } else if (building.type == MapBuildingType.explore) {
            exploreIcon.active = true;

        } else if (building.type == MapBuildingType.stronghold) {
            strongholdIcon.active = true;

            let isSelf = false;
            for (const player of players) {
                if (building.defendPioneerIds.indexOf(player.id) != -1) {
                    isSelf = true;
                    break;
                }
            }
            if (building.defendPioneerIds.length > 0) {
                strongholdView.active = true;
                strongholdView.getChildByPath("pioneer_default").active = building.defendPioneerIds.indexOf("pioneer_0") != -1;
                strongholdView.getChildByPath("secretGuard").active = building.defendPioneerIds.indexOf("pioneer_1") != -1;
                strongholdView.getChildByPath("doomsdayGangSpy").active = building.defendPioneerIds.indexOf("pioneer_2") != -1;
                strongholdView.getChildByPath("rebels").active = building.defendPioneerIds.indexOf("pioneer_3") != -1;
                strongholdView.getComponent(Layout).updateLayout();
            }
            if (isSelf) {
                // this._selfView.active = true;
            } else {
                // this._neturalView.active = true;
            }

        } else if (building.type == MapBuildingType.resource) {
            collectIcon.active = true;

        } else if (building.type == MapBuildingType.event) {
            exploreIcon.active = true;
        }

        this._levelShowing = this.node.getChildByPath("Level").active;
    }

    public showName(isShow: boolean) {
        this.node.getChildByPath("Title").active = isShow;
        if (isShow) {
            this.node.getChildByPath("Level").active = this._levelShowing;
        } else {
            this.node.getChildByPath("Level").active = false;
        }
    }

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
        "Pyramid_Group"
    ];

    private _levelShowing: boolean = false;
    protected onLoad(): void {

    }

    start() {

    }

    update(deltaTime: number) {

    }
}


