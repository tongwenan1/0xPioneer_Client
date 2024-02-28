import { _decorator, Component, Node } from 'cc';
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
            if (building.eventId == "910101") {
                spiderCave.active = true;
            } else if (building.eventId == "910201") {
                ancientRuins.active = true;
            } else if (building.eventId == "910301") {
                laboratory.active = true;
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


