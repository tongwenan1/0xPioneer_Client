import { _decorator, Component, Label, Layout, Node } from 'cc';
import MapBuildingModel, { MapBuildingType } from '../Model/MapBuildingModel';
import { MapPlayerPioneerModel } from '../Model/MapPioneerModel';
import { LanMgr } from '../../../Utils/Global';
const { ccclass, property } = _decorator;

@ccclass('OuterBuildingView')
export class OuterBuildingView extends Component {

    public refreshUI(building: MapBuildingModel, players: MapPlayerPioneerModel[]) {

        this.node.getChildByName("Title").getComponent(Label).string = "Lv." + building.level + "  " + LanMgr.getLanById(building.name);


        for (const buildingName of this._buildViewNames) {
            this.node.getChildByPath("BuildingContent/" + buildingName).active = buildingName == building.animType;
        }

        const strongholdView = this.node.getChildByName("StrongholdContent");

        strongholdView.active = false;
       
        this._neturalView.active = false;
        this._selfView.active = false;

        if (building.type == MapBuildingType.city) {

        } else if (building.type == MapBuildingType.explore) {
            this._neturalView.active = true;

        } else if (building.type == MapBuildingType.stronghold) {
            let isSelf = false;
            for (const player of players) {
                if (building.defendPioneerIds.indexOf(player.id) != -1) {
                    isSelf = true;
                    break;
                }
            }
            if (building.defendPioneerIds.length > 0) {
                strongholdView.active = true;
                strongholdView.getChildByName("pioneer_default").active = building.defendPioneerIds.indexOf("pioneer_0") != -1;
                strongholdView.getChildByName("secretGuard").active = building.defendPioneerIds.indexOf("pioneer_1") != -1;
                strongholdView.getChildByName("doomsdayGangSpy").active = building.defendPioneerIds.indexOf("pioneer_2") != -1;
                strongholdView.getChildByName("rebels").active = building.defendPioneerIds.indexOf("pioneer_3") != -1;
                strongholdView.getComponent(Layout).updateLayout();
            }
            if (isSelf) {
                this._selfView.active = true;
            } else {
                this._neturalView.active = true;
            }

        } else if (building.type == MapBuildingType.resource) {
            this._neturalView.active = true;
            
        } else if (building.type == MapBuildingType.event) {
            this._neturalView.active = true;
        }

        this._neturalView.active = false;
        this._selfView.active = false;
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

    private _neturalView: Node = null;
    private _selfView: Node = null;
    protected onLoad(): void {
        this._neturalView = this.node.getChildByPath("mining_status/netual");
        this._selfView = this.node.getChildByPath("mining_status/self");
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


