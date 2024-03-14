import { _decorator, Component, Layout, Node } from 'cc';
import MapBuildingModel, { MapBuildingType } from '../Model/MapBuildingModel';
import { MapPlayerPioneerModel } from '../Model/MapPioneerModel';
const { ccclass, property } = _decorator;

@ccclass('OuterBuildingView')
export class OuterBuildingView extends Component {

    public refreshUI(building: MapBuildingModel, players: MapPlayerPioneerModel[]) {
        const treasure = this.node.getChildByName("treasure");
        const swamp = this.node.getChildByName("swamp_jungle");
        const sand = this.node.getChildByName("sand_mineral");
        const ruins = this.node.getChildByName("ruin");
        const oasis = this.node.getChildByName("oasis");
        const city = this.node.getChildByName("city");
        const ambush = this.node.getChildByName("ambush");
        const spiderCave = this.node.getChildByName("spider_cave");
        const laboratory = this.node.getChildByName("laboratory");
        const ancientRuins = this.node.getChildByName("ancient_ruins");

        const strongholdView = this.node.getChildByName("StrongholdContent");

        const pyramid = this.node.getChildByName("Pyramid_Group");
        const villageCave = this.node.getChildByName("Tree_Group");
        const aquatic = this.node.getChildByName("Aquatic_Relics_Group");

        treasure.active = false;
        swamp.active = false;
        sand.active = false;
        ruins.active = false;
        oasis.active = false;
        city.active = false;
        ambush.active = false;
        spiderCave.active = false;
        laboratory.active = false;
        ancientRuins.active = false;

        strongholdView.active = false;
        pyramid.active = false;
        villageCave.active = false;
        aquatic.active = false;

        this._neturalView.active = false;
        this._selfView.active = false;

        if (building.type == MapBuildingType.city) {
            city.active = true;

        } else if (building.type == MapBuildingType.explore) {
            this._neturalView.active = true;

            if (building.id == "building_2") {
                ruins.active = true;
            } else if (building.id == "building_3") {
                treasure.active = true;
            }

        } else if (building.type == MapBuildingType.stronghold) {
            ambush.active = true;

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
            if (building.id == "building_5" ||
                building.id == "building_6") {
                swamp.active = true;

            } else if (building.id == "building_7" ||
                building.id == "building_8" ||
                building.id == "building_9") {
                oasis.active = true;

            } else if (building.id == "building_10" ||
                building.id == "building_11" ||
                building.id == "building_12") {
                sand.active = true;
            }
        } else if (building.type == MapBuildingType.event) {
            this._neturalView.active = true;
            if (building.eventId.indexOf("9101") != -1) {
                spiderCave.active = true;
            } else if (building.eventId.indexOf("9102") != -1) {
                ancientRuins.active = true;
            } else if (building.eventId.indexOf("9103") != -1) {
                laboratory.active = true;
            } else if (building.eventId.indexOf("9104") != -1) {
                villageCave.active = true;
            } else if (building.eventId.indexOf("9105") != -1) {
                aquatic.active = true;
            } else if (building.eventId.indexOf("9106") != -1) {
                pyramid.active = true;
            }
        }
    }

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


